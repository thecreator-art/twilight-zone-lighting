// Vercel serverless function — lead form proxy.
// Browser POSTs JSON to /api/lead. Function validates, drops bot submissions,
// and forwards the payload to LEAD_WEBHOOK_URL (set in Vercel env vars — point at GHL).
//
// Required env var: LEAD_WEBHOOK_URL (the GHL webhook URL or any HTTPS endpoint that accepts JSON)
// Optional env var: LEAD_WEBHOOK_AUTH ("Bearer xxx" if your webhook requires auth)

export const config = { runtime: 'edge' };

const ORIGIN_ALLOW = ['https://twilightzonepermanentlighting.com', 'https://www.twilightzonepermanentlighting.com'];

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '86400'
      }
    });
  }
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' });

  let payload;
  try { payload = await req.json(); } catch { return json(400, { ok: false, error: 'invalid_json' }); }

  // Honeypot: bots fill any field named "company". Real users never see it (CSS hides it off-screen).
  if (typeof payload.company === 'string' && payload.company.trim() !== '') {
    // Pretend to succeed so bots don't retry
    return json(200, { ok: true, queued: false });
  }

  // Required fields
  const firstName = (payload.firstName || '').toString().trim().slice(0, 80);
  const phone = (payload.phone || '').toString().trim().slice(0, 32);
  if (!firstName || !phone) return json(400, { ok: false, error: 'missing_required' });
  // Phone sanity: at least 7 digits
  if ((phone.replace(/\D/g, '').length) < 7) return json(400, { ok: false, error: 'invalid_phone' });

  // Build a clean payload to forward (whitelist fields, cap lengths)
  const out = {
    source: (payload.source || 'unknown').toString().slice(0, 32),
    firstName,
    lastName: (payload.lastName || '').toString().trim().slice(0, 80),
    email: (payload.email || '').toString().trim().slice(0, 200),
    phone,
    address: (payload.address || '').toString().trim().slice(0, 200),
    city: (payload.city || '').toString().trim().slice(0, 80),
    state: (payload.state || 'CA').toString().trim().slice(0, 16),
    zip: (payload.zip || '').toString().trim().slice(0, 16),
    page: (payload.page || '').toString().slice(0, 200),
    referrer: (payload.referrer || '').toString().slice(0, 200),
    userAgent: req.headers.get('user-agent') || '',
    ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '',
    submittedAt: new Date().toISOString()
  };

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    // Not configured yet — accept the lead so the UX still works, but flag it.
    console.warn('LEAD_WEBHOOK_URL not configured — lead accepted but not forwarded:', out);
    return json(200, { ok: true, queued: false, reason: 'webhook_not_configured' });
  }

  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.LEAD_WEBHOOK_AUTH) headers.authorization = process.env.LEAD_WEBHOOK_AUTH;
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(out)
    });
    if (!resp.ok) {
      console.error('Lead webhook returned non-200:', resp.status, await resp.text().catch(() => ''));
      return json(502, { ok: false, error: 'webhook_failed' });
    }
    return json(200, { ok: true, queued: true });
  } catch (err) {
    console.error('Lead webhook fetch error:', err);
    return json(502, { ok: false, error: 'webhook_unreachable' });
  }
}
