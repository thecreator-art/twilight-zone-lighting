// Step 2 of connecting Jobber: Jobber redirects here after the admin clicks Allow Access.
// Exchanges the one-time code for tokens and shows the refresh token ONCE so it can be saved in Vercel
// as JOBBER_REFRESH_TOKEN. Only reachable with a state value signed by /api/jobber/connect.
import { CALLBACK_URL, checkState, tokenRequest, gql } from '../_jobber.js';

export const config = { runtime: 'edge' };

const page = (status, title, body) => new Response(
  '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>' + title + '</title><body style="font:16px/1.5 system-ui;max-width:640px;margin:48px auto;padding:0 16px;background:#0b0b0d;color:#fff">' +
  '<h1 style="font-size:24px">' + title + '</h1>' + body + '</body>',
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req) {
  const q = new URL(req.url).searchParams;
  if (!(await checkState(q.get('state')))) return page(400, 'Link expired', '<p>Start again from the connect link.</p>');
  const code = q.get('code');
  if (!code) return page(400, 'No approval received', '<p>Jobber did not send an approval code. Start again from the connect link.</p>');
  try {
    const t = await tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: CALLBACK_URL });
    let account = '';
    try { account = (await gql(t.access_token, '{ account { name } }')).account.name; } catch (e) { /* name is only for display */ }
    return page(200, 'Jobber connected' + (account ? ': ' + esc(account) : ''),
      '<p>Save this value in Vercel as <b>JOBBER_REFRESH_TOKEN</b> (Production), then redeploy. It is shown only once.</p>' +
      '<pre style="padding:14px;border-radius:10px;background:#1c1c22;white-space:pre-wrap;word-break:break-all;user-select:all">' + esc(t.refresh_token) + '</pre>' +
      '<p style="color:#fbbf24">Refresh Token Rotation must be OFF on the app in the Developer Center. If it is on, this value stops working after the first lead.</p>');
  } catch (e) {
    return page(502, 'Jobber did not accept the connection', '<p>' + esc(e.message) + '</p>');
  }
}
