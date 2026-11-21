// Step 1 of connecting Jobber: /api/jobber/connect?key=<JOBBER_SETUP_KEY>
// Sends the signed-in Jobber admin to Jobber's own "Allow Access" screen.
import { JOBBER_AUTHORIZE, CALLBACK_URL, setupKeyOk, signState } from '../_jobber.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (!setupKeyOk(req)) return new Response('Not found', { status: 404 });
  if (!process.env.JOBBER_CLIENT_ID) return new Response('JOBBER_CLIENT_ID is not set in Vercel yet.', { status: 500 });
  const u = new URL(JOBBER_AUTHORIZE);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', process.env.JOBBER_CLIENT_ID);
  u.searchParams.set('redirect_uri', CALLBACK_URL);
  u.searchParams.set('state', await signState(String(Date.now())));
  return new Response(null, { status: 302, headers: { location: u.toString(), 'cache-control': 'no-store' } });
}
