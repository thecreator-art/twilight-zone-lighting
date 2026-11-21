// Setup check: /api/jobber/schema?key=<JOBBER_SETUP_KEY>
// Confirms the stored connection works and returns the exact fields Jobber accepts for the mutations
// used in ../_jobber.js, so they can be verified against the live schema. Returns no customer data.
import { jobberConfigured, setupKeyOk, accessToken, gql } from '../_jobber.js';

export const config = { runtime: 'edge' };

const TYPE = 'query($n:String!){ __type(name:$n){ name inputFields{ name type{ kind name ofType{ kind name ofType{ kind name ofType{ name } } } } } } }';
const MUTATIONS = '{ __schema{ mutationType{ fields{ name args{ name type{ kind name ofType{ kind name } } } } } } }';

export default async function handler(req) {
  if (!setupKeyOk(req)) return new Response('Not found', { status: 404 });
  const json = (s, b) => new Response(JSON.stringify(b, null, 1), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  if (!jobberConfigured()) return json(200, { connected: false, reason: 'env vars missing' });
  try {
    const token = await accessToken();
    const account = (await gql(token, '{ account { name } }')).account.name;
    const want = /^(clientCreate|requestCreate|requestCreateNote|clientCreateNote|propertyCreate)$/;
    const mutations = (await gql(token, MUTATIONS)).__schema.mutationType.fields.filter((f) => want.test(f.name));
    const inputNames = new Set();
    mutations.forEach((m) => m.args.forEach((a) => { let t = a.type; while (t && !t.name) t = t.ofType; if (t && /Input|Attributes/.test(t.name)) inputNames.add(t.name); }));
    ['EmailCreateAttributes', 'PhoneNumberCreateAttributes', 'AddressAttributes'].forEach((n) => inputNames.add(n));
    const types = {};
    for (const n of inputNames) {
      const t = (await gql(token, TYPE, { n })).__type;
      types[n] = t ? t.inputFields : null;
    }
    return json(200, { connected: true, account, mutations, types });
  } catch (e) {
    return json(502, { connected: false, error: e.message });
  }
}
