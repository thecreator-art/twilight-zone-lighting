/* Twilight Zone — lead attribution.
 *
 * Runs on every page. Records where a visitor came from the first time they arrive (first touch)
 * and again whenever they come back through a new ad, search or link (last touch), so a lead
 * submitted pages — or days — later still says exactly where it came from. Stored in this
 * browser only (localStorage, 90 days); nothing is sent anywhere until a form is submitted.
 *
 * Forms call window.tzAttribution() and attach:
 *   .fields  human-readable lines for the lead email ("Lead source", "Ad", "First touch"…)
 *   .params  raw tracking parameters (utm_*, fbclid, gclid…) for webhooks and Jobber
 */
(function () {
  'use strict';
  var KEY = 'tz_attr_v1', SESSION = 'tz_attr_s', TTL = 90 * 864e5;
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'site_source', 'placement', 'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid', 'li_fat_id'];

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* private mode */ } }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; } }
  function has(h, list) { for (var i = 0; i < list.length; i++) if (h === list[i] || h.slice(-list[i].length - 1) === '.' + list[i]) return true; return false; }

  // In-app browsers often send no referrer, but their user agent still says which app the tap came from.
  var ua = navigator.userAgent || '';
  var app = /Instagram/i.test(ua) ? 'Instagram' : /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua) ? 'Facebook'
    : /musical_ly|TikTok|BytedanceWebview/i.test(ua) ? 'TikTok' : /Snapchat/i.test(ua) ? 'Snapchat'
    : /LinkedInApp/i.test(ua) ? 'LinkedIn' : /Pinterest/i.test(ua) ? 'Pinterest' : '';

  var META_SITE = { fb: 'Facebook', ig: 'Instagram', msg: 'Messenger', an: 'Audience Network', th: 'Threads' };
  var SEARCH = { 'google': 'Google', 'bing.com': 'Bing', 'yahoo.com': 'Yahoo', 'duckduckgo.com': 'DuckDuckGo', 'ecosia.org': 'Ecosia', 'search.brave.com': 'Brave' };
  var AI = { 'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT', 'perplexity.ai': 'Perplexity', 'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini', 'copilot.microsoft.com': 'Copilot', 'you.com': 'You.com' };
  var SOCIAL = { 'facebook.com': 'Facebook', 'fb.com': 'Facebook', 'instagram.com': 'Instagram', 'tiktok.com': 'TikTok',
    'youtube.com': 'YouTube', 'nextdoor.com': 'Nextdoor', 'yelp.com': 'Yelp', 't.co': 'X (Twitter)', 'x.com': 'X (Twitter)',
    'linkedin.com': 'LinkedIn', 'reddit.com': 'Reddit', 'pinterest.com': 'Pinterest', 'threads.net': 'Threads' };

  // One plain-English line describing a touch.
  function classify(p, ref, inApp) {
    var src = (p.utm_source || '').toLowerCase(), med = (p.utm_medium || '').toLowerCase();
    var paid = /paid|cpc|ppc|cpm|ads?$|paid_social|paidsocial/.test(med);
    var site = META_SITE[(p.site_source || '').toLowerCase()];
    // {{placement}} arrives like "Instagram_Reels"; drop the platform prefix when it repeats the site
    var place = p.placement ? p.placement.replace(/_/g, ' ') : '';
    if (site && place.toLowerCase().indexOf(site.toLowerCase() + ' ') === 0) place = place.slice(site.length + 1);
    place = place ? ' · ' + place : '';
    if (p.gclid || p.gbraid || p.wbraid) return 'Google Ads' + (p.utm_campaign ? '' : ' (auto-tagged)');
    if (p.msclkid) return 'Microsoft (Bing) Ads';
    if (p.ttclid) return 'TikTok Ads';
    if (p.li_fat_id) return 'LinkedIn Ads';
    if (/^(meta|facebook|fb|instagram|ig)$/.test(src) && (paid || site || p.utm_campaign)) {
      return 'Meta Ads · ' + (site || (src === 'instagram' || src === 'ig' ? 'Instagram' : inApp || 'Facebook/Instagram')) + place;
    }
    if (src === 'google' && /gbp|business|maps/.test((p.utm_campaign || '').toLowerCase())) return 'Google Business Profile';
    if (src === 'truck_wrap') return 'Truck wrap (twilightzonelighting.com)';
    if (src) return src + (med ? ' / ' + med : '');
    var h = host(ref);
    for (var s in SEARCH) if (h === s || h.indexOf(s + '.') === 0 || has(h, [s])) {
      if (s === 'google' && /^(maps|business)\./.test(h)) return 'Google Maps / Business Profile';
      return SEARCH[s] + ' search (organic)';
    }
    for (var a in AI) if (has(h, [a])) return 'AI assistant · ' + AI[a];
    for (var so in SOCIAL) if (has(h, [so])) return SOCIAL[so] + (p.fbclid ? ' post or ad (no UTM tags)' : ' (organic)');
    if (p.fbclid) return (inApp || 'Facebook/Instagram') + ' link (ad or post without UTM tags)';
    if (inApp) return inApp + ' app (in-app browser, no tags)';
    if (h) return 'Referral · ' + h;
    return 'Direct (typed URL, bookmark, text/email link or QR)';
  }

  // ---- record this page view ----
  var q = new URLSearchParams(location.search), params = {}, tagged = false;
  PARAMS.forEach(function (k) { var v = q.get(k); if (v) { params[k] = v.slice(0, 300); tagged = true; } });
  var ref = document.referrer || '', refHost = host(ref);
  var external = !!refHost && refHost !== location.hostname.replace(/^www\./, '').toLowerCase();
  var now = Date.now(), st = load();
  if (st.first && now - st.first.ts > TTL) st = {};

  if (tagged || external || !st.first) {
    var touch = {
      ts: now, channel: classify(params, external ? ref : '', app), params: params, app: app,
      landing: location.pathname.slice(0, 200), referrer: external ? ref.slice(0, 300) : ''
    };
    if (!st.first) st.first = touch;
    st.last = touch;
  }
  var newSession = false;
  try { newSession = !sessionStorage.getItem(SESSION); sessionStorage.setItem(SESSION, '1'); } catch (e) {}
  if (newSession) st.visits = (st.visits || 0) + 1;
  st.pages = (st.pages || 0) + 1;
  save(st);

  function when(ts) { try { return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function device() {
    var os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Other';
    var type = /iPad|Tablet/.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/.test(ua) ? 'Phone' : 'Desktop';
    return type + ' · ' + os + (app ? ' · ' + app + ' in-app browser' : '');
  }

  window.tzAttribution = function () {
    var s = load(), f = s.first || {}, l = s.last || f, lp = l.params || {}, fp = f.params || {};
    var fields = {
      'Lead source': l.channel || 'Unknown',
      'Campaign': lp.utm_campaign || '—',
      'Ad set / keyword': lp.utm_term || '—',
      'Ad': lp.utm_content || '—',
      'Landing page': l.landing || '—',
      'Referrer': l.referrer || '(none)',
      'First touch': f.ts && f.ts !== l.ts ? f.channel + ' · ' + when(f.ts) + ' · ' + (f.landing || '') + (fp.utm_campaign ? ' · ' + fp.utm_campaign : '') : 'Same as lead source',
      'Visits before converting': String(s.visits || 1),
      'Pages viewed': String(s.pages || 1),
      'Days since first visit': f.ts ? String(Math.floor((Date.now() - f.ts) / 864e5)) : '0',
      'Device': device()
    };
    var raw = {};
    PARAMS.forEach(function (k) { if (lp[k]) raw[k] = lp[k]; });
    raw.lead_source = fields['Lead source'];
    raw.first_touch_source = f.channel || '';
    raw.first_touch_campaign = fp.utm_campaign || '';
    raw.landing_page = l.landing || '';
    raw.referrer = l.referrer || '';
    return { fields: fields, params: raw };
  };
})();
