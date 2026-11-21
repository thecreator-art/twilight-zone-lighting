// Shared Jobber helpers (underscore prefix = not a route). Edge-runtime safe: fetch + Web Crypto only.
//
// Direct connection to the client's Jobber account through Jobber's own GraphQL API, no middleman.
// Env vars (Vercel):
//   JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET  from the app in Jobber's Developer Center
//   JOBBER_REFRESH_TOKEN                    shown once by /api/jobber/callback after the account admin approves
//   JOBBER_SETUP_KEY                        any long random string; guards the setup routes
// The Developer Center app must have Refresh Token Rotation turned OFF (allowed for unpublished apps),
// so the refresh token stays the same and can live in an env var.

export const JOBBER_API = 'https://api.getjobber.com/api/graphql';
export const JOBBER_AUTHORIZE = 'https://api.getjobber.com/api/oauth/authorize';
export const JOBBER_TOKEN = 'https://api.getjobber.com/api/oauth/token';
export const JOBBER_VERSION = '2025-04-16';
export const CALLBACK_URL = 'https://twilightzonepermanentlighting.com/api/jobber/callback';

export const jobberConfigured = () =>
  !!(process.env.JOBBER_CLIENT_ID && process.env.JOBBER_CLIENT_SECRET && process.env.JOBBER_REFRESH_TOKEN);

const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

// Stateless, signed OAuth state: "<timestamp>.<hmac>" — valid for 15 minutes.
export async function signState(ts) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(process.env.JOBBER_SETUP_KEY || ''),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return ts + '.' + hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('jobber:' + ts)));
}
export async function checkState(state) {
  const ts = String(state || '').split('.')[0];
  if (!process.env.JOBBER_SETUP_KEY || !/^\d+$/.test(ts)) return false;
  if (Math.abs(Date.now() - Number(ts)) > 15 * 60 * 1000) return false;
  return (await signState(ts)) === state;
}
export const setupKeyOk = (req) => {
  const k = new URL(req.url).searchParams.get('key') || '';
  return !!process.env.JOBBER_SETUP_KEY && k.length > 15 && k === process.env.JOBBER_SETUP_KEY;
};

export async function tokenRequest(params) {
  const body = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID || '', client_secret: process.env.JOBBER_CLIENT_SECRET || '', ...params
  });
  const r = await fetch(JOBBER_TOKEN, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error('jobber_token_' + r.status + ':' + JSON.stringify(j).slice(0, 200));
  return j;
}

export async function accessToken() {
  const j = await tokenRequest({ grant_type: 'refresh_token', refresh_token: process.env.JOBBER_REFRESH_TOKEN });
  // With rotation ON Jobber hands back a different refresh token and kills the old one: the env var would go stale.
  if (j.refresh_token && j.refresh_token !== process.env.JOBBER_REFRESH_TOKEN) {
    console.error('JOBBER: refresh token rotated. Turn Refresh Token Rotation OFF on the app and reconnect at /api/jobber/connect.');
  }
  return j.access_token;
}

export async function gql(token, query, variables) {
  const r = await fetch(JOBBER_API, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'x-jobber-graphql-version': JOBBER_VERSION, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.errors) throw new Error('jobber_gql_' + r.status + ':' + JSON.stringify(j.errors || j).slice(0, 400));
  return j.data;
}

const userErrors = (node) => (node && node.userErrors && node.userErrors.length ? node.userErrors.map((e) => e.message).join('; ') : '');

function noteFor(lead) {
  const a = lead.attribution || {};
  const lines = [
    'Website lead (' + (lead.source || 'site') + ')',
    lead.scope && 'Wants: ' + lead.scope,
    lead.stories && 'Home: ' + lead.stories,
    lead.timeline && 'Timeline: ' + lead.timeline,
    [lead.address, lead.city, lead.state, lead.zip].filter(Boolean).length && 'Address: ' + [lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', '),
    'Phone: ' + lead.phone,
    lead.email && 'Email: ' + lead.email,
    '',
    'Lead source: ' + (a['Lead source'] || lead.lead_source || 'Unknown'),
    (a['Campaign'] || lead.utm_campaign) && 'Campaign: ' + (a['Campaign'] || lead.utm_campaign),
    (a['Ad'] || lead.utm_content) && 'Ad: ' + (a['Ad'] || lead.utm_content),
    lead.placement && 'Placement: ' + lead.placement,
    (a['Landing page'] || lead.landing_page) && 'Landing page: ' + (a['Landing page'] || lead.landing_page),
    a['First touch'] && 'First touch: ' + a['First touch'],
    a['Device'] && 'Device: ' + a['Device']
  ];
  return lines.filter((l) => l || l === '').join('\n').slice(0, 3000);
}

// Creates the client, then a request for them, then a note carrying the quiz answers and ad source.
// Returns { clientId, requestId, steps } and never throws: a Jobber problem must not lose the lead (email still goes out).
export async function pushLeadToJobber(lead) {
  const steps = [];
  const out = { clientId: null, requestId: null, propertyId: null, steps };
  let token;
  try { token = await accessToken(); } catch (e) { steps.push('token: ' + e.message); return out; }

  let first = lead.firstName, last = lead.lastName;
  // Forms with a single name box: split "Jane Doe" into first and last.
  const whole = (!last && (lead.name || first) || '').trim();
  if (whole.includes(' ')) { const parts = whole.split(/\s+/); first = parts.shift(); last = parts.join(' '); }
  const base = { firstName: first, lastName: last || '(web lead)' };
  if (lead.email) base.emails = [{ description: 'MAIN', primary: true, address: lead.email }];
  const full = { ...base, phones: [{ description: 'MAIN', primary: true, number: lead.phone }] };
  if (lead.address) {
    full.billingAddress = { street1: lead.address, city: lead.city || undefined, province: (lead.city || lead.zip) ? (lead.state || 'CA') : undefined, postalCode: lead.zip || undefined, country: 'US' };
  }
  const CLIENT = 'mutation($input: ClientCreateInput!){ clientCreate(input:$input){ client{ id } userErrors{ message path } } }';

  // Full record first; if Jobber rejects a field, fall back to name + email so the lead still lands (details go in the note).
  for (const [label, input] of [['client', full], ['client-minimal', base]]) {
    try {
      const d = await gql(token, CLIENT, { input });
      const err = userErrors(d.clientCreate);
      if (err) { steps.push(label + ': ' + err); continue; }
      out.clientId = d.clientCreate.client.id; steps.push(label + ': ok'); break;
    } catch (e) { steps.push(label + ': ' + e.message); }
  }
  if (!out.clientId) return out;

  // Service address as a Jobber property, so it shows on the request and can be scheduled against.
  let propertyId = null;
  if (lead.address) {
    try {
      const d = await gql(token,
        'mutation($id: EncodedId!, $input: PropertyCreateInput!){ propertyCreate(clientId:$id, input:$input){ properties{ id } userErrors{ message path } } }',
        { id: out.clientId, input: { properties: [{ address: { street1: lead.address, city: lead.city || undefined, province: (lead.city || lead.zip) ? (lead.state || 'CA') : undefined, postalCode: lead.zip || undefined, country: 'US' } }] } });
      const err = userErrors(d.propertyCreate);
      if (err) steps.push('property: ' + err);
      else { propertyId = out.propertyId = (d.propertyCreate.properties[0] || {}).id || null; steps.push('property: ok'); }
    } catch (e) { steps.push('property: ' + e.message); }
  }

  const note = noteFor(lead);
  try {
    const d = await gql(token,
      'mutation($input: RequestCreateInput!){ requestCreate(input:$input){ request{ id } userErrors{ message path } } }',
      { input: { clientId: out.clientId, title: 'Permanent lighting quote (website)', ...(propertyId ? { propertyId } : {}) } });
    const err = userErrors(d.requestCreate);
    if (err) steps.push('request: ' + err); else { out.requestId = d.requestCreate.request.id; steps.push('request: ok'); }
  } catch (e) { steps.push('request: ' + e.message); }

  try {
    if (out.requestId) {
      const d = await gql(token,
        'mutation($id: EncodedId!, $input: RequestCreateNoteInput!){ requestCreateNote(requestId:$id, input:$input){ userErrors{ message path } } }',
        { id: out.requestId, input: { message: note } });
      steps.push('request-note: ' + (userErrors(d.requestCreateNote) || 'ok'));
    } else {
      const d = await gql(token,
        'mutation($id: EncodedId!, $input: ClientCreateNoteInput!){ clientCreateNote(clientId:$id, input:$input){ userErrors{ message path } } }',
        { id: out.clientId, input: { message: note } });
      steps.push('client-note: ' + (userErrors(d.clientCreateNote) || 'ok'));
    }
  } catch (e) { steps.push('note: ' + e.message); }
  return out;
}
