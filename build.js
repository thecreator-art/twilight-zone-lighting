#!/usr/bin/env node
/**
 * Twilight Zone Permanent Lighting — SEO War Machine Build
 * Generates 325 unique static HTML pages from /_data/*.json
 * Output: project root (matches existing Vercel deploy structure).
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = p => JSON.parse(fs.readFileSync(path.join(ROOT, '_data', p), 'utf8'));

const shared = DATA('shared.json');
// data files are { slug: {...}, slug: {...} } maps — flatten to arrays.
const _citiesRaw = DATA('cities.json');
const _servicesRaw = DATA('services.json');
const _verticalsRaw = DATA('verticals.json');
const cities = Object.values(_citiesRaw).map(c => ({
  ...c,
  driveTime: typeof c.drive === 'number' ? c.drive : (parseInt(c.drive, 10) || 25),
  popularUseCase: c.popular || ''
}));
const services = Object.values(_servicesRaw);
const verticals = Object.values(_verticalsRaw);
const comparisons = DATA('comparisons.json').comparisons;
const posts = (() => { try { return DATA('posts.json').posts; } catch { return []; } })();

const SITE = shared.brand.siteUrl.replace(/\/$/, '');
const PHONE = shared.brand.phoneDisplay;
const TEL = shared.brand.phone;
const BRAND = shared.brand.name;

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usd = n => '$' + Number(n).toLocaleString('en-US');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const writePage = (urlPath, html) => {
  const dir = urlPath === '/' ? ROOT : path.join(ROOT, urlPath.replace(/^\//, ''));
  if (urlPath !== '/') fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  if (urlPath === '/') return; // never overwrite homepage
  fs.writeFileSync(file, html);
};

// ---------- SHARED CHROME ----------
// Critical CSS — minimum needed for above-the-fold paint (header + hero).
// Inlined to eliminate render-blocking on first visit. Full styles.css loads async.
const CRITICAL_CSS = `*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{margin:0;background:#050505;color:#fff;font-family:Inter,sans-serif;font-size:16px;line-height:1.5;overflow-x:hidden}img,video{max-width:100%;display:block}a{color:inherit;text-decoration:none}.container{max-width:1280px;margin:0 auto;padding:0 24px}.header-stack{position:fixed;top:0;left:0;right:0;z-index:100}.ann-bar{background:#050505;color:#fff;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden;white-space:nowrap}.ann-track{display:flex;gap:48px;animation:annScroll 40s linear infinite;padding-left:100%;width:max-content}@keyframes annScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}.ann-pulse{display:inline-block;width:6px;height:6px;background:#c084fc;border-radius:999px;margin-right:10px;vertical-align:middle;animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.nav{background:rgba(5,5,5,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06)}.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;max-width:1280px;margin:0 auto;gap:24px}.brand-logo{height:42px;width:auto}.nav-links{display:flex;gap:24px;align-items:center}.nav-links a{font-size:13px;font-weight:500;color:rgba(255,255,255,.75);transition:color .2s}.nav-phone{color:#c084fc !important;font-weight:600}.nav-cta{display:flex;align-items:center;gap:12px}.btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .25s cubic-bezier(.2,.8,.2,1);text-decoration:none}.btn-primary{background:linear-gradient(135deg,#a855f7,#6366f1);color:#fff;box-shadow:0 4px 16px rgba(168,85,247,.3)}.btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(168,85,247,.4)}.btn-text{background:transparent;color:rgba(255,255,255,.85);padding:12px 16px}.hamburger{display:none;background:transparent;border:0;width:32px;height:32px;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;padding:0}.hamburger span{display:block;height:2px;background:#fff;border-radius:1px;transition:all .25s}.hero{position:relative;min-height:calc(100vh - 132px);display:flex;flex-direction:column;justify-content:center;padding:60px 0;overflow:hidden;background:#000}.hero.hero-sub{min-height:78vh;padding:80px 0 56px}.hero-media{position:absolute;inset:0;z-index:0;overflow:hidden}.ken-burns{width:110%;height:110%;object-fit:cover;position:absolute;inset:-5% 0 0 -5%;filter:brightness(.5) saturate(1.1) contrast(1.05);animation:kenBurns 24s ease-in-out infinite alternate;will-change:transform}@keyframes kenBurns{0%{transform:scale(1.05)}100%{transform:scale(1.18) translate(-2%,-3%)}}.hero-vignette{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.5) 0%,transparent 25%,transparent 55%,rgba(0,0,0,.95) 100%),radial-gradient(ellipse at 70% 30%,rgba(168,85,247,.22),transparent 60%);pointer-events:none}.hero-content{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:0 24px;width:100%}.hero-eyebrow{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#c084fc;margin-bottom:22px}.hero-title{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(38px,6vw,76px);line-height:1.05;font-weight:400;letter-spacing:-.02em;margin:0 0 22px;color:#fff;display:flex;flex-direction:column;gap:0}.hero-title span{display:block;opacity:0;transform:translateY(20px);animation:heroLineIn .8s cubic-bezier(.2,.8,.2,1) forwards}.hero-title .hero-line-1{animation-delay:.4s}.hero-title .hero-line-2{animation-delay:.6s}.hero-title .hero-line-3{animation-delay:.8s}@keyframes heroLineIn{to{opacity:1;transform:translateY(0)}}.hero-title em{font-style:italic;background:linear-gradient(135deg,#c084fc,#6366f1);-webkit-background-clip:text;background-clip:text;color:transparent}.hero-est{font-size:clamp(17px,1.4vw,21px);line-height:1.55;color:rgba(255,255,255,.82);max-width:720px;margin:0 0 32px}.hero-actions{display:flex;gap:14px;flex-wrap:wrap}.hero-foot{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,.08);max-width:720px}.hero-foot-item .num{font-family:'Instrument Serif',Georgia,serif;font-size:36px;font-weight:400;color:#c084fc;line-height:1}.hero-foot-item .lab{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:4px}@media (max-width:980px){.nav-links,.nav-cta .btn{display:none}.hamburger{display:flex}.hero-foot{grid-template-columns:repeat(2,1fr);gap:16px}}`;

// Build a single @graph-linked JSON-LD block from multiple schema objects
// so Google sees the entities as connected, not free-floating.
function buildGraph(jsonld, canonical) {
  if (!jsonld.length) return '';
  // Tag each schema with @id derived from canonical + type, so they reference each other
  const tagged = jsonld.map((j, i) => {
    if (!j['@id']) j['@id'] = `${SITE}${canonical}#${(j['@type'] || 'thing').toString().toLowerCase()}-${i}`;
    return j;
  });
  // Strip per-block @context (we'll set it once at @graph root)
  const stripped = tagged.map(j => { const { '@context': _, ...rest } = j; return rest; });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': stripped })}</script>`;
}

const head = ({ title, desc, canonical, kw = '', ogImg = '/images/03-accent.jpg', jsonld = [], speakable = ['h1', '.hero-est', '.section-head h2'] }) => {
  // Add Speakable schema for AI/voice — adds explicit "answer here" markers for assistants
  if (speakable && speakable.length) {
    jsonld = [...jsonld, {
      '@type': 'WebPage',
      '@id': `${SITE}${canonical}#webpage`,
      url: `${SITE}${canonical}`,
      name: title,
      description: desc,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${SITE}/#website` },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: speakable }
    }];
  }
  // Always inject the website root entity for graph linking
  jsonld = [{
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE + '/',
    name: BRAND,
    publisher: { '@id': `${SITE}/#org` }
  }, {
    '@type': 'Organization',
    '@id': `${SITE}/#org`,
    name: BRAND,
    url: SITE + '/',
    telephone: TEL,
    email: shared.brand.email,
    logo: { '@type': 'ImageObject', url: `${SITE}/images/logo-600.png` },
    sameAs: []
  }, ...jsonld];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
${kw ? `<meta name="keywords" content="${esc(kw)}" />` : ''}
<meta name="author" content="${esc(BRAND)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<link rel="canonical" href="${SITE}${canonical}" />
<meta name="geo.region" content="US-CA" />
<meta name="geo.placename" content="Fresno, California" />
<meta name="geo.position" content="36.7378;-119.7871" />
<meta name="ICBM" content="36.7378, -119.7871" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${SITE}${canonical}" />
<meta property="og:site_name" content="${esc(BRAND)}" />
<meta property="og:image" content="${SITE}${ogImg}" />
<meta property="og:image:width" content="1600" />
<meta property="og:image:height" content="900" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${SITE}${ogImg}" />
<meta name="theme-color" content="#050505" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="format-detection" content="telephone=yes" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${CRITICAL_CSS}</style>
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
${buildGraph(jsonld, canonical)}
</head>
<body>`;
};

// Active-link helper: marks current section in nav
const navLink = (href, label, cur) => {
  const active = cur === href ||
    (href !== '/' && cur.startsWith(href + '/')) ||
    (href === '/services' && /^\/(permanent-christmas-|halloween-|accent-|security-|patio-|pool-|pathway-|game-day-|eave-|custom-|string-|year-round-)/.test(cur)) ||
    (href === '/services' && cur === '/permanent-outdoor-lights') ||
    (href === '/service-areas' && cur.startsWith('/permanent-outdoor-lights-')) ||
    (href === '/commercial' && /^\/(restaurant-|hotel-|storefront-|hoa-|church-|dealership-|school-|office-|event-)/.test(cur)) ||
    (href === '/blog' && cur.startsWith('/blog/')) ||
    (href === '/galleries' && cur.startsWith('/gallery-')) ||
    (href === '/pricing' && cur.startsWith('/cost'));
  return `<a href="${href}"${active ? ' class="is-active" aria-current="page"' : ''}>${esc(label)}</a>`;
};

const headerHTML = (cur = '') => `
<div class="header-stack" id="headerStack">
<div class="ann-bar" role="banner">
  <div class="ann-track">
    <span><i class="ann-pulse"></i> BOOKING SPRING 2026 — 7 INSTALL SLOTS REMAIN</span>
    <span><i class="ann-pulse"></i> 60-DAY MONEY-BACK · LIFETIME WARRANTY · STARTING AT <strong>$950</strong></span>
    <span><i class="ann-pulse"></i> FRESNO · CLOVIS · MADERA · VISALIA · HANFORD · SELMA · SANGER</span>
    <span aria-hidden="true"><i class="ann-pulse"></i> BOOKING SPRING 2026 — 7 INSTALL SLOTS REMAIN</span>
    <span aria-hidden="true"><i class="ann-pulse"></i> 60-DAY MONEY-BACK · LIFETIME WARRANTY · STARTING AT <strong>$950</strong></span>
    <span aria-hidden="true"><i class="ann-pulse"></i> FRESNO · CLOVIS · MADERA · VISALIA · HANFORD · SELMA · SANGER</span>
  </div>
</div>
<header class="nav" id="nav">
  <div class="nav-inner">
    <a href="/" class="brand" aria-label="${esc(BRAND)} — Home">
      <img class="brand-logo" src="/images/logo-300.png" srcset="/images/logo-300.png 1x, /images/logo-600.png 2x" alt="${esc(BRAND)}" width="153" height="102" fetchpriority="high" />
    </a>
    <nav class="nav-links" aria-label="Primary">
      ${navLink('/services', 'Services', cur)}
      ${navLink('/service-areas', 'Areas', cur)}
      ${navLink('/commercial', 'Commercial', cur)}
      ${navLink('/pricing', 'Pricing', cur)}
      ${navLink('/galleries', 'Gallery', cur)}
      ${navLink('/blog', 'Blog', cur)}
      ${navLink('/faq', 'FAQ', cur)}
      <a href="tel:${TEL}" class="nav-phone">${PHONE}</a>
    </nav>
    <div class="nav-cta">
      <a href="/quote" class="btn btn-primary">Get Quote</a>
      <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
</div>`;

const footerHTML = () => `
<footer class="footer">
  <div class="container">
    <div class="foot-top">
      <div class="foot-brand">
        <a href="/" class="brand brand-light">
          <img class="brand-logo brand-logo-foot" src="/images/logo-600.png" alt="${esc(BRAND)}" width="240" height="160" loading="lazy" />
        </a>
        <p>Fresno's authorized permanent outdoor lighting installer. Locally owned. Lifetime warranty. From $950.</p>
        <address class="foot-nap">
          <strong>${esc(BRAND)}</strong><br />
          ${esc(shared.brand.address.street)}<br />
          ${esc(shared.brand.address.city)}, ${esc(shared.brand.address.state)} ${esc(shared.brand.address.zip)}<br />
          <a href="tel:${TEL}">${PHONE}</a><br />
          <a href="mailto:${shared.brand.email}">${shared.brand.email}</a>
        </address>
      </div>
      <div class="foot-col"><h5>Service Areas</h5><ul>${cities.map(c => `<li><a href="/permanent-outdoor-lights-${c.slug}">${esc(c.name)}</a></li>`).join('')}<li><a href="/service-areas"><strong>All areas →</strong></a></li></ul></div>
      <div class="foot-col"><h5>Services</h5><ul>${services.map(s => `<li><a href="/${s.slug}">${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</a></li>`).join('')}<li><a href="/services"><strong>All services →</strong></a></li></ul></div>
      <div class="foot-col"><h5>Commercial</h5><ul>${verticals.slice(0,8).map(v => `<li><a href="/${v.slug}">${esc(v.h1.split(' Installation')[0].split(' in ')[0])}</a></li>`).join('')}<li><a href="/commercial"><strong>All commercial →</strong></a></li></ul></div>
      <div class="foot-col"><h5>Resources</h5><ul><li><a href="/blog">Blog (60 articles)</a></li><li><a href="/galleries">Gallery</a></li><li><a href="/guides">Buyer guides</a></li><li><a href="/compare">Compare brands</a></li><li><a href="/reviews">Reviews</a></li><li><a href="/process">Install process</a></li><li><a href="/warranty">Warranty</a></li></ul></div>
      <div class="foot-col"><h5>Company</h5><ul><li><a href="/pricing">Pricing</a></li><li><a href="/quote">Free Quote</a></li><li><a href="/faq">FAQ</a></li><li><a href="tel:${TEL}">${PHONE}</a></li><li><a href="mailto:${shared.brand.email}">Email us</a></li><li><a href="/sitemap">Sitemap</a></li></ul></div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 ${esc(BRAND)} · Fresno, CA · Lic. #${shared.brand.license} · Bonded · Insured</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/warranty">Warranty</a></span>
    </div>
  </div>
</footer>
<div class="sticky-cta">
  <a href="tel:${TEL}" class="sticky-call">Call</a>
  <a href="/quote" class="sticky-quote">Get Quote →</a>
</div>
<script src="/script.js" defer></script>
</body>
</html>`;

// ---------- JSON-LD HELPERS ----------
const breadcrumbs = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE + it.url }))
});
const faqLD = faqs => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
});
const serviceLD = (name, desc, area, price) => ({
  '@context': 'https://schema.org', '@type': 'Service', serviceType: name, name,
  description: desc,
  provider: { '@type': 'HomeAndConstructionBusiness', name: BRAND, telephone: TEL, address: { '@type': 'PostalAddress', addressLocality: 'Fresno', addressRegion: 'CA', postalCode: '93704', addressCountry: 'US' } },
  areaServed: area,
  offers: { '@type': 'Offer', price: String(price), priceCurrency: 'USD' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '412' }
});
const localBusinessLD = (city) => ({
  '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness',
  name: `${BRAND} — ${city.name}`,
  description: `Permanent outdoor lighting installer serving ${city.name}, CA. From $950. Lifetime warranty.`,
  telephone: TEL, priceRange: '$950 - $15000+',
  address: { '@type': 'PostalAddress', streetAddress: shared.brand.address.street, addressLocality: 'Fresno', addressRegion: 'CA', postalCode: '93704', addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
  areaServed: { '@type': 'City', name: city.name },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '412' }
});

// ---------- COMMON BLOCKS ----------
// Split a long h1 into 3 lines for the hero, with the middle line italic-emphasized.
// If lines arg is supplied, use it directly. Otherwise auto-split.
function splitH1(h1, override) {
  if (Array.isArray(override) && override.length === 3) return override;
  const t = h1.trim();
  // " in {City}, CA" suffix
  const inMatch = t.match(/^(.*?)\s+in\s+(.+)$/i);
  if (inMatch) {
    const head = inMatch[1].replace(/\s+Installation$/i, '').trim();
    const tail = `in ${inMatch[2]}`;
    // First word becomes line 1 (e.g. "Permanent"); rest becomes em line 2.
    const firstSpace = head.indexOf(' ');
    if (firstSpace > 0) return [head.slice(0, firstSpace), head.slice(firstSpace + 1), tail];
    return [head, '', tail];
  }
  // " vs {Brand}" pattern → comparison
  const vs = t.match(/^(.+?)\s+vs\s+(.+)$/i);
  if (vs) return [vs[1], `vs ${vs[2]}`, ''];
  // "{Topic} Cost (...)" / "{Topic}: ..." → split on punctuation
  const colon = t.match(/^(.+?)[:—–-]\s+(.+)$/);
  if (colon) return [colon[1], colon[2], ''];
  // Default: first word, rest, blank
  const fs = t.indexOf(' ');
  if (fs > 0) return [t.slice(0, fs), t.slice(fs + 1), ''];
  return [t, '', ''];
}

const heroBlock = ({ kicker, h1, h1Lines, lead, ctaPrice, img }) => {
  const [l1, l2, l3] = splitH1(h1, h1Lines);
  const heroImg = (img || '/images/03-accent.jpg').replace(/^images\//, '/images/');
  return `
<section class="hero hero-sub" id="top" aria-label="Page hero">
  <div class="hero-media">
    <img class="ken-burns" src="${heroImg}" alt="${esc(h1)}" loading="eager" fetchpriority="high" />
    <div class="hero-vignette"></div>
    <div class="hero-grain"></div>
    <div class="hero-glow"></div>
    <div class="hero-particles" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>
  <div class="hero-content">
    ${kicker ? `<div class="hero-eyebrow">${esc(kicker)}</div>` : ''}
    <h1 class="hero-title">
      ${l1 ? `<span class="hero-line-1">${esc(l1)}</span>` : ''}
      ${l2 ? `<span class="hero-line-2"><em>${esc(l2)}</em></span>` : ''}
      ${l3 ? `<span class="hero-line-3">${esc(l3)}</span>` : ''}
    </h1>
    <p class="hero-est">${esc(lead)}</p>
    <div class="hero-actions">
      <a href="/quote" class="btn btn-primary" data-magnetic>Free Quote in 24 hours</a>
      <a href="tel:${TEL}" class="btn btn-text">${PHONE}</a>
    </div>
  </div>
</section>`;
};

const trustBar = () => `
<section class="trust-band" aria-label="Guarantees">
  <div class="container">
    <div class="tb-grid">
      ${shared.guarantees.map(g => `<div class="tb-item"><strong>${esc(g.title)}</strong><span>${esc(g.desc)}</span></div>`).join('')}
    </div>
  </div>
</section>`;

// Section head: eyebrow + h2 with em accent + intro paragraph
const sectionHead = ({ eyebrow, h2, em, intro, purple }) => `
<header class="section-head">
  ${eyebrow ? `<p class="eyebrow${purple ? ' eyebrow-purple' : ''}">${esc(eyebrow)}</p>` : ''}
  <h2>${esc(h2)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>
  ${intro ? `<p class="section-intro">${esc(intro)}</p>` : ''}
</header>`;

// Solutions-style image card grid (matches homepage .sol-grid)
const solutionsGrid = (cards) => `
<div class="sol-grid">
  ${cards.map(c => `
    <article class="sol-card">
      <div class="sol-image"><img src="${(c.img || '/images/03-accent.jpg').replace(/^images\//, '/images/')}" alt="${esc(c.alt || c.h)}" loading="lazy" /></div>
      <div class="sol-body">
        <h3>${esc(c.h)}</h3>
        <p>${esc(c.p)}</p>
        ${c.href ? `<a href="${c.href}" class="sol-link">${esc(c.linkLabel || 'Learn more')} <span>→</span></a>` : ''}
      </div>
    </article>
  `).join('')}
</div>`;

const breadcrumbBlock = items => `
<nav class="breadcrumb container" aria-label="Breadcrumb">
  ${items.map((it, i) => i === items.length - 1
    ? `<span aria-current="page">${esc(it.name)}</span>`
    : `<a href="${it.url}">${esc(it.name)}</a> <span class="sep">›</span>`).join(' ')}
</nav>`;

const faqBlock = faqs => `
<section class="faq-section container">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">
    ${faqs.map(f => `<details class="faq-item"><summary>${esc(f.q)}</summary><div>${esc(f.a)}</div></details>`).join('')}
  </div>
</section>`;

// Full quote form — mirrors homepage's #quote section so every page has the same conversion path.
const ctaBlock = () => `
<section class="next-steps" id="quote" aria-label="Free quote form">
  <div class="container ns-grid">
    <div class="ns-text">
      <p class="eyebrow">Next steps</p>
      <h2>Get your <em>free quote.</em></h2>
      <ol class="ns-steps">
        <li><span class="ns-num">1</span> Request your free estimate.</li>
        <li><span class="ns-num">2</span> We help you choose the right lighting for your property and budget.</li>
        <li><span class="ns-num">3</span> Schedule your install with our W-2 technicians.</li>
      </ol>
      <div class="ns-progress"><span class="ns-pct" style="width:65%"></span></div>
      <div class="ns-call">
        <span>Or call us directly</span>
        <a href="tel:${TEL}">${PHONE}</a>
      </div>
    </div>
    <form class="ns-form" aria-label="Request a free quote" action="mailto:${shared.brand.email}" method="post" enctype="text/plain">
      <div class="ns-field"><label>First Name</label><input type="text" name="firstName" placeholder="Jane" required autocomplete="given-name" /></div>
      <div class="ns-field"><label>Last Name</label><input type="text" name="lastName" placeholder="Smith" required autocomplete="family-name" /></div>
      <div class="ns-field"><label>Email</label><input type="email" name="email" placeholder="email@site.com" required autocomplete="email" /></div>
      <div class="ns-field"><label>Phone</label><input type="tel" name="phone" placeholder="123-456-7890" required autocomplete="tel" /></div>
      <div class="ns-field"><label>Street Address</label><input type="text" name="address" placeholder="123 Main Ave" required autocomplete="street-address" /></div>
      <div class="ns-field-row">
        <div class="ns-field"><label>City</label><input type="text" name="city" placeholder="Fresno" required autocomplete="address-level2" /></div>
        <div class="ns-field"><label>State</label><input type="text" name="state" placeholder="CA" required autocomplete="address-level1" value="CA" /></div>
        <div class="ns-field"><label>Zip</label><input type="text" name="zip" placeholder="93704" required autocomplete="postal-code" /></div>
      </div>
      <p class="ns-fine">By submitting you agree to receive communication. 60-day money-back. $0 down.</p>
      <button type="submit" class="btn btn-white btn-block btn-lg" data-magnetic>Request quote</button>
    </form>
  </div>
</section>`;

const cityRowBlock = (currentSlug) => `
<section class="city-row container">
  <h3>Serving the Central Valley</h3>
  <div class="city-pills">
    ${cities.filter(c => c.slug !== currentSlug).map(c => `<a href="/permanent-outdoor-lights-${c.slug}" class="pill">${esc(c.name)}</a>`).join('')}
  </div>
</section>`;

const serviceRowBlock = (currentSlug) => `
<section class="service-row container">
  <h3>More Lighting Services</h3>
  <div class="service-pills">
    ${services.filter(s => s.slug !== currentSlug).slice(0, 10).map(s => `<a href="/${s.slug}" class="pill">${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</a>`).join('')}
  </div>
</section>`;

const guaranteeBlock = () => `
<section class="container guarantees">
  <h2>What you get, every time</h2>
  <div class="guarantee-grid">
    ${shared.guarantees.map(g => `<div class="g-card"><h4>${esc(g.title)}</h4><p>${esc(g.desc)}</p></div>`).join('')}
  </div>
</section>`;

const techSpecsBlock = () => `
<section class="container tech-specs">
  ${sectionHead({ eyebrow: 'The hardware', h2: 'Built for', em: 'fifty thousand hours.' })}
  <div class="spec-grid">
    <div><dt>LED chip</dt><dd>${esc(shared.tech.ledType)}</dd></div>
    <div><dt>Colors</dt><dd>${esc(shared.tech.colors)}</dd></div>
    <div><dt>Patterns</dt><dd>${shared.tech.patterns}+ presets</dd></div>
    <div><dt>Lifespan</dt><dd>${esc(shared.tech.lifespan)}</dd></div>
    <div><dt>Weather</dt><dd>${esc(shared.tech.weatherRating)} · ${esc(shared.tech.tempRange)}</dd></div>
    <div><dt>Smart home</dt><dd>${shared.tech.appCompat.join(', ')}</dd></div>
  </div>
</section>`;

// ============================================================
// ASSET REGISTRY — real install photos by category
// ============================================================
const ASSETS = {
  residential: ['/images/work/gameday/g1.jpg','/images/work/gameday/g3.jpg','/images/work/gameday/g8.jpg','/images/work/gameday/g9.jpg','/images/work/gameday/g11.jpg','/images/work/gameday/g12.jpg','/images/03-accent.jpg','/images/04-holiday.jpg','/images/02-security.jpg'],
  gameday:     ['/images/work/gameday/g1.jpg','/images/work/gameday/g2.jpg','/images/work/gameday/g3.jpg','/images/work/gameday/g4.jpg','/images/work/gameday/g5.jpg','/images/work/gameday/g6.jpg','/images/work/gameday/g7.jpg','/images/work/gameday/g8.jpg','/images/work/gameday/g9.jpg','/images/work/gameday/g10.jpg','/images/work/gameday/g11.jpg','/images/work/gameday/g12.jpg'],
  holiday:     ['/images/04-holiday.jpg','/images/work/gameday/g3.jpg','/images/work/gameday/g11.jpg','/images/work/gameday/g4.jpg','/images/work/gameday/g7.jpg','/images/work/gameday/g10.jpg'],
  accent:      ['/images/03-accent.jpg','/images/work/gameday/g8.jpg','/images/work/gameday/g12.jpg','/images/work/gameday/g6.jpg','/images/work/gameday/g9.jpg'],
  security:    ['/images/02-security.jpg','/images/work/gameday/g5.jpg','/images/work/gameday/g8.jpg','/images/work/gameday/g11.jpg'],
  restaurant:  ['/images/work/restaurant/r1.jpg','/images/work/restaurant/r2.jpg','/images/work/restaurant/r3.jpg','/images/work/restaurant/r4.jpg'],
  entertainment:['/images/work/entertainment/e1.jpg','/images/work/entertainment/e2.jpg','/images/work/entertainment/e3.jpg','/images/work/entertainment/e4.jpg'],
  municipal:   ['/images/work/municipal/m1.jpg','/images/work/municipal/m2.jpg','/images/work/municipal/m3.jpg','/images/work/municipal/m4.jpg','/images/work/municipal/m5.jpg','/images/work/municipal/m6.jpg'],
  commercial:  ['/images/work/restaurant/r1.jpg','/images/work/entertainment/e2.jpg','/images/work/municipal/m1.jpg','/images/work/restaurant/r3.jpg','/images/work/entertainment/e4.jpg','/images/work/municipal/m4.jpg']
};

// Map each service slug → photo category
const SERVICE_PHOTO_MAP = {
  'permanent-outdoor-lights': 'residential',
  'permanent-christmas-lights': 'holiday',
  'halloween-lights': 'holiday',
  'accent-lighting': 'accent',
  'security-lighting': 'security',
  'patio-lighting': 'residential',
  'pool-deck-lighting': 'residential',
  'pathway-landscape-lighting': 'accent',
  'game-day-lighting': 'gameday',
  'eave-soffit-lighting': 'residential',
  'custom-architectural-lighting': 'accent',
  'string-lights-installation': 'residential',
  'year-round-lighting': 'residential'
};
const VERTICAL_PHOTO_MAP = {
  'restaurant-bar-lighting': 'restaurant',
  'hotel-resort-lighting': 'entertainment',
  'storefront-retail-lighting': 'restaurant',
  'hoa-apartment-lighting': 'residential',
  'church-religious-lighting': 'municipal',
  'dealership-lighting': 'commercial',
  'school-university-lighting': 'municipal',
  'office-park-business-lighting': 'municipal',
  'event-venue-wedding-lighting': 'entertainment'
};

// Deterministic seeded shuffle so same page always picks same photos
const seedHash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); };
function pickPhotos(category, seed, count) {
  const pool = ASSETS[category] || ASSETS.residential;
  if (count >= pool.length) return pool.slice(0, count);
  const start = seedHash(seed) % pool.length;
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}
const photoForService = (svcSlug, seed = 'a') => pickPhotos(SERVICE_PHOTO_MAP[svcSlug] || 'residential', seed, 1)[0];
const photoForVertical = (vSlug, seed = 'a') => pickPhotos(VERTICAL_PHOTO_MAP[vSlug] || 'commercial', seed, 1)[0];

// ============================================================
// NEW COMPONENTS — match homepage gravitas
// ============================================================

// Real testimonial section: photo on left, big italic quote on right
const testimonialBlock = (city, photoOverride) => {
  if (!city || !city.testimonialQuote) return '';
  const photo = photoOverride || pickPhotos('residential', city.slug, 1)[0];
  return `
<section class="testimonial-section" aria-label="Customer testimonial">
  <div class="container testimonial-grid">
    <div class="testimonial-photo">
      <img src="${photo}" alt="Permanent outdoor lighting install in ${esc(city.name)}, CA" loading="lazy" />
      <div class="testimonial-photo-glow"></div>
    </div>
    <div class="testimonial-content">
      <p class="eyebrow eyebrow-purple">${esc(city.neighborhoods[0])} · ${esc(city.name)}, CA</p>
      <blockquote class="testimonial-quote">
        <span class="quote-mark" aria-hidden="true">&ldquo;</span>${esc(city.testimonialQuote)}
      </blockquote>
      <cite class="testimonial-attribution">
        <strong>${esc(city.testimonialName)}</strong>
        <span>Verified homeowner · ${shared.brand.rating}★ Google review</span>
      </cite>
    </div>
  </div>
</section>`;
};

// Vertical-rail process timeline (mirrors homepage)
const processTimelineBlock = ({ kicker = 'How it works', h2 = 'Five steps,', em = 'one day on site.', intro = 'Free quote, design, install, app setup, walkthrough. Most homes finished by sundown.' } = {}) => `
<section class="container process-rail-section" aria-label="Install process">
  ${sectionHead({ eyebrow: kicker, h2, em, intro, purple: true })}
  <ol class="process-rail">
    <li class="process-rail-step">
      <div class="step-num">1</div>
      <div class="step-body">
        <h3>Free quote in 24 hours</h3>
        <p>We measure linear feet, identify ladder access, propose track color, and quote in writing on the spot. No phone-tag, no upsells.</p>
      </div>
    </li>
    <li class="process-rail-step">
      <div class="step-num">2</div>
      <div class="step-body">
        <h3>Design + track color</h3>
        <p>Match your existing trim — white, bronze, brown, or black. 3D rendering for HOA submission if you need it. Free.</p>
      </div>
    </li>
    <li class="process-rail-step">
      <div class="step-num">3</div>
      <div class="step-body">
        <h3>Install in a day</h3>
        <p>Single-story homes finish in 6–8 hours. Our W-2 crew, in-house. No subcontractors, ever.</p>
      </div>
    </li>
    <li class="process-rail-step">
      <div class="step-num">4</div>
      <div class="step-body">
        <h3>Wiring + control box</h3>
        <p>Concealed channel-routed wiring. One drop to the attic. Weatherproof box mounted in your garage. Surge protection inline.</p>
      </div>
    </li>
    <li class="process-rail-step">
      <div class="step-num">5</div>
      <div class="step-body">
        <h3>App + walkthrough</h3>
        <p>We pair the controller with your Wi-Fi, train you on scenes and schedules, and don't leave until you've changed colors from your phone.</p>
      </div>
    </li>
  </ol>
</section>`;

// Real install photo grid (6 images, asymmetric, descriptive alt text)
const installPhotoGrid = ({ category, seed, kicker = 'Real installs', h2 = 'Ours, lit.', em = 'Yours, next.', intro, altContext }) => {
  const pics = pickPhotos(category || 'residential', seed || 'a', 6);
  // Derive contextual alt text from kicker + photo position
  const ctx = altContext || kicker || 'Permanent outdoor lighting';
  const altFor = (i, type) => {
    const types = ['featured roofline outline', 'eave-mounted track detail', 'two-story facade install', 'soffit channel close-up', 'full-perimeter install at twilight', 'side-yard accent run'];
    return `${ctx} — ${types[i] || 'permanent outdoor lighting install'} by ${BRAND}`;
  };
  return `
<section class="container install-grid-section" aria-label="Install gallery">
  ${sectionHead({ eyebrow: kicker, h2, em, intro: intro || `${shared.brand.installs}+ installs across the Central Valley. Same crew. Same warranty. Same hardware.` })}
  <div class="install-grid">
    <figure class="install-photo install-photo-large"><img src="${pics[0]}" alt="${esc(altFor(0))}" loading="lazy" decoding="async" width="800" height="600" /></figure>
    <figure class="install-photo"><img src="${pics[1]}" alt="${esc(altFor(1))}" loading="lazy" decoding="async" width="400" height="300" /></figure>
    <figure class="install-photo"><img src="${pics[2]}" alt="${esc(altFor(2))}" loading="lazy" decoding="async" width="400" height="300" /></figure>
    <figure class="install-photo"><img src="${pics[3]}" alt="${esc(altFor(3))}" loading="lazy" decoding="async" width="400" height="300" /></figure>
    <figure class="install-photo install-photo-wide"><img src="${pics[4]}" alt="${esc(altFor(4))}" loading="lazy" decoding="async" width="800" height="300" /></figure>
    <figure class="install-photo"><img src="${pics[5]}" alt="${esc(altFor(5))}" loading="lazy" decoding="async" width="400" height="300" /></figure>
  </div>
</section>`;
};

// Atmospheric video reel moment (lazy-loaded via IntersectionObserver, adaptive mobile/desktop sources)
const reelMomentBlock = ({ video = '/videos/commercial-loop.mp4', kicker, h, em, p, poster = '/images/03-accent.jpg' }) => {
  // Derive mobile variant by injecting "-mobile" before extension if pattern matches
  const mobileVideo = video.replace(/(-loop)?\.mp4$/, (m) => m === '-loop.mp4' ? '-loop-mobile.mp4' : '-mobile.mp4');
  return `
<section class="reel-moment" aria-label="${esc(kicker || 'Cinematic moment')}" data-lazy-video>
  <video class="reel-video" autoplay muted loop playsinline preload="none" poster="${poster}">
    <source data-src="${mobileVideo}" type="video/mp4" media="(max-width: 768px)" />
    <source data-src="${video}" type="video/mp4" />
  </video>
  <div class="reel-overlay"></div>
  <div class="container reel-content">
    ${kicker ? `<p class="eyebrow eyebrow-purple">${esc(kicker)}</p>` : ''}
    <h2 class="reel-h">${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>
    ${p ? `<p class="reel-p">${esc(p)}</p>` : ''}
  </div>
</section>`;
};

// Big pull-quote for blog posts (between sections)
const pullQuote = (text, attribution) => `
<aside class="pull-quote" role="note">
  <p class="pull-quote-text">${esc(text)}</p>
  ${attribution ? `<p class="pull-quote-attr">— ${esc(attribution)}</p>` : ''}
</aside>`;

// Standalone stat counter row (separate from hero)
const statsCounters = (items) => `
<section class="container stats-counters" aria-label="Stats">
  <div class="stats-counters-grid">
    ${items.map(it => `<div class="counter-item"><div class="counter-num">${esc(it.num)}</div><div class="counter-lab">${esc(it.lab)}</div></div>`).join('')}
  </div>
</section>`;

// Two-photo split: us vs them, for comparison pages
const compareVisualBlock = (c) => `
<section class="container compare-visual-section" aria-label="Visual comparison">
  ${sectionHead({ eyebrow: 'Side by side', h2: `${esc(BRAND).split(' ')[0]} ${esc(BRAND).split(' ')[1]}`, em: `vs ${esc(c.competitor)}.` })}
  <div class="compare-visual-grid">
    <div class="cv-card cv-card-us">
      <div class="cv-badge cv-badge-us">${esc(BRAND.split(' ')[0])} ${esc(BRAND.split(' ')[1])}</div>
      <img src="${pickPhotos('residential', c.slug, 1)[0]}" alt="${esc(BRAND)} install" loading="lazy" />
    </div>
    <div class="cv-card cv-card-them">
      <div class="cv-badge cv-badge-them">${esc(c.competitor)}</div>
      <img src="${pickPhotos('residential', c.slug + 'b', 1)[0]}" alt="${esc(c.competitor)}" loading="lazy" />
    </div>
  </div>
</section>`;

// ROI callout for vertical / commercial pages
const roiCalloutBlock = (items) => `
<section class="container roi-callout" aria-label="ROI numbers">
  <div class="roi-grid">
    ${items.map(it => `
      <div class="roi-item">
        <div class="roi-num">${esc(it.num)}</div>
        <div class="roi-context">${esc(it.context)}</div>
      </div>`).join('')}
  </div>
</section>`;

// ---------- TEMPLATE: Service × City ----------
function renderServiceCity(service, city) {
  const slug = `${service.slug}-${city.slug}`;
  const h1 = `${service.h1.replace(' Installation', '')} Installation in ${city.name}, CA`;
  const title = `${service.h1.replace(' Installation', '')} ${city.name} CA | From ${usd(service.fromPrice)} | ${BRAND}`;
  const desc = `${service.h1.replace(' Installation', '')} installation in ${city.name}, CA. ${service.lead} Serving ${city.neighborhoods.slice(0,4).join(', ')}. Lifetime warranty. From ${usd(service.fromPrice)}.`;
  const localKw = `${service.primaryKw} ${city.name.toLowerCase()}`;
  const canonical = `/${slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.h1.split(' Installation')[0].split(' in ')[0], url: `/${service.slug}` },
    { name: city.name, url: canonical }
  ];
  const faqs = [
    { q: `How much does ${service.h1.split(' Installation')[0].toLowerCase()} cost in ${city.name}?`,
      a: `${service.h1.split(' Installation')[0]} in ${city.name} starts at ${usd(service.fromPrice)} for a Starter install. Most ${city.name} homes range ${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}. Two-story estates: ${usd(shared.pricing.estateFrom)}+. Financing from $89/month at 0% APR.` },
    { q: `Do you serve ${city.neighborhoods[0]} and ${city.neighborhoods[1]}?`,
      a: `Yes. We install across all ${city.name} neighborhoods including ${city.neighborhoods.slice(0, 6).join(', ')}, and surrounding ZIPs ${city.zips.join(', ')}.` },
    { q: `Will the lights survive ${city.name} summers?`,
      a: `Yes. The track is rated IP67 and tested -40°F to 140°F — engineered for ${city.climate.summerHigh}°F+ ${city.name} summers. ${city.climate.notes}` },
    { q: `How long is the install in ${city.name}?`,
      a: `Single-story homes finish in 6-8 hours. Two-story typically 1-2 days. Drive time from our Fresno shop to ${city.name} is about ${city.driveTime} minutes, so we keep the same crew on-site through the install.` },
    ...service.faqs.slice(0, 4)
  ];
  const jsonld = [
    breadcrumbs(crumbs),
    serviceLD(`${service.h1.split(' Installation')[0]} in ${city.name}, CA`, desc, { '@type': 'City', name: city.name }, service.fromPrice),
    localBusinessLD(city),
    faqLD(faqs)
  ];
  const useCases = service.useCases.slice(0, 6);
  const photoCat = SERVICE_PHOTO_MAP[service.slug] || 'residential';
  const heroImg = pickPhotos(photoCat, slug, 1)[0];
  const svcName = service.h1.split(' Installation')[0].split(' in ')[0];
  const html = head({ title, desc, canonical, kw: localKw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `${city.name}, CA · From ${usd(service.fromPrice)}`, h1, lead: `${service.lead} ${city.intro}`, ctaPrice: service.fromPrice, img: heroImg }) +
    trustBar() +
    `<section class="container intro-block">
      ${sectionHead({ eyebrow: `${city.name} homeowners`, h2: `${svcName} for`, em: `${city.name} homes.`, intro: `${service.intro}` })}
      <p>${esc(city.name)} sits in ${esc(city.county || 'the Central Valley')}, with summer highs averaging ${city.climate.summerHigh}°F — exactly the conditions our IP67-rated aluminum track is engineered for. ${esc(city.climate.notes || '')} We've installed across ${city.neighborhoods.slice(0, 5).map(esc).join(', ')}, and serve every ZIP in the city: ${city.zips.map(esc).join(', ')}.</p>
    </section>` +
    installPhotoGrid({ category: photoCat, seed: slug, kicker: `${svcName}`, h2: 'Real installs,', em: `not stock photos.`, intro: `Selected from our ${shared.brand.installs}+ Central Valley installs.` }) +
    `<section class="container use-cases">
      ${sectionHead({ eyebrow: 'Use cases', h2: `Where ${city.name} homeowners`, em: 'use this most.' })}
      <div class="use-grid">
        ${useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}
      </div>
    </section>` +
    testimonialBlock(city, pickPhotos(photoCat, slug + 't', 1)[0]) +
    techSpecsBlock() +
    processTimelineBlock({ kicker: `${city.name} install process`, h2: 'Quoted, designed, installed —', em: `in a day.` }) +
    `<section class="container neighborhood-list">
      ${sectionHead({ eyebrow: `${city.name} coverage`, h2: 'Neighborhoods we', em: `cover in ${city.name}.` })}
      <div class="nbhd-pills">
        ${city.neighborhoods.map(n => `<span class="pill">${esc(n)}</span>`).join('')}
      </div>
      <p class="muted">ZIPs we serve: ${city.zips.map(esc).join(' · ')}</p>
    </section>` +
    guaranteeBlock() +
    faqBlock(faqs) +
    serviceRowBlock(service.slug) +
    cityRowBlock(city.slug) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Service Hub (no city) ----------
function renderServiceHub(service) {
  const h1 = service.h1;
  const title = service.title;
  const desc = service.metaDesc;
  const canonical = `/${service.slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.h1.split(' Installation')[0].split(' in ')[0], url: canonical }
  ];
  const faqs = service.faqs;
  const jsonld = [
    breadcrumbs(crumbs),
    serviceLD(h1, desc, 'Central Valley California', service.fromPrice),
    faqLD(faqs)
  ];
  const photoCat = SERVICE_PHOTO_MAP[service.slug] || 'residential';
  const heroImg = pickPhotos(photoCat, service.slug, 1)[0];
  const svcName = service.h1.split(' Installation')[0].split(' in ')[0];
  const fresno = cities.find(c => c.slug === 'fresno');
  // Tier C: exact-match alt phrasings per service slug for low-competition keyword capture.
  const altPhrasesMap = {
    'permanent-outdoor-lights': ['outdoor lights permanent', 'permanent out door lights', 'permanent exterior house lighting', 'permanent led outdoor lighting systems', 'permanent led outdoor lighting', 'festive lights', 'best christmas lights for roofline'],
    'permanent-christmas-lights': ['christmas light installers', 'christmas lighting company', 'permanent xmas lights', 'christmas light decorations', 'christmas light display', 'christmas lights and decorations', 'christmas lights with remote', 'gemstone christmas lights', 'best christmas lights for roofline'],
    'security-lighting': ['residential security lighting', 'motion security lighting', 'outdoor home security lighting', 'outdoor security lighting for homes'],
    'pathway-landscape-lighting': ['landscape lighting company', 'landscape lighting contractors', 'outdoor lighting contractors', 'outdoor lighting service near me', 'high quality landscape lights', 'landscape lighting service'],
    'halloween-lights': ['halloween light installation', 'permanent halloween lights', 'halloween spotlight'],
    'accent-lighting': ['architectural lighting design firms', 'architectural lighting company'],
    'game-day-lighting': ['team color lights', 'sports color outdoor lights'],
    'year-round-lighting': ['holiday living lights', 'easter lights decorations', 'festive lights', 'holiday lighting']
  };
  const altPhrases = altPhrasesMap[service.slug] || [];
  const html = head({ title, desc, canonical, kw: service.primaryKw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `Service · From ${usd(service.fromPrice)}`, h1, lead: service.lead, ctaPrice: service.fromPrice, img: heroImg }) +
    trustBar() +
    `<section class="container intro-block">
      ${sectionHead({ eyebrow: 'About this service', h2: `${svcName} —`, em: `what it is, who it's for.`, intro: service.intro })}
      ${altPhrases.length ? `<p class="muted">Also searched as: ${altPhrases.map(esc).join(', ')}.</p>` : ''}
    </section>` +
    installPhotoGrid({ category: photoCat, seed: service.slug, kicker: 'Recent work', h2: `${svcName},`, em: 'as installed.' }) +
    `<section class="container use-cases">
      ${sectionHead({ eyebrow: 'Where it lands', h2: 'Common', em: 'use cases.', intro: `${svcName} fits a handful of recurring use cases — here are the ones we install most often.` })}
      <div class="use-grid">${service.useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div>
    </section>` +
    `<section class="container specs-block">
      ${sectionHead({ eyebrow: 'Specs', h2: 'The numbers', em: `behind the install.` })}
      <ul class="spec-list">${service.specs.map(s => `<li><strong>${esc(s.label)}:</strong> ${esc(s.value)}</li>`).join('')}</ul>
    </section>` +
    techSpecsBlock() +
    testimonialBlock(fresno, pickPhotos(photoCat, service.slug + 't', 1)[0]) +
    processTimelineBlock() +
    `<section class="container city-grid">
      ${sectionHead({ eyebrow: 'By city', h2: `${svcName} across`, em: 'the Central Valley.' })}
      <div class="city-pills">
        ${cities.map(c => `<a href="/${service.slug}-${c.slug}" class="pill">${esc(c.name)}, CA</a>`).join('')}
      </div>
    </section>` +
    guaranteeBlock() +
    faqBlock(faqs) +
    serviceRowBlock(service.slug) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: City Hub ----------
function renderCityHub(city) {
  const h1 = `Permanent Outdoor Lighting in ${city.name}, CA`;
  const title = `Permanent Outdoor Lights ${city.name} CA | From $950 | ${BRAND}`;
  const desc = `Permanent outdoor lighting installer serving ${city.name}, CA and ${city.neighborhoods.slice(0, 3).join(', ')}. From $950. Lifetime warranty. ${shared.brand.reviews}+ reviews at ${shared.brand.rating}★.`;
  const canonical = `/permanent-outdoor-lights-${city.slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/service-areas' },
    { name: city.name, url: canonical }
  ];
  const faqs = [
    { q: `Do you serve all of ${city.name}?`, a: `Yes — every ZIP in ${city.name} (${city.zips.join(', ')}) and every neighborhood including ${city.neighborhoods.slice(0, 6).join(', ')}.` },
    { q: `How much does permanent lighting cost in ${city.name}?`, a: `Starts at $950 for a single-facade Starter install. Most ${city.name} homes land $2,800-$5,800. Two-story estates $5,800-$9,000. Financing from $89/month.` },
    { q: `What's the most popular install style in ${city.name}?`, a: city.popularUseCase || `Full eave-and-soffit outline with warm-white architectural mode for daily use plus 200+ holiday presets.` },
    { q: `How long does it take you to get to ${city.name}?`, a: `About ${city.driveTime} minutes from our Fresno shop. We dispatch the same W-2 install crew — no subcontractors.` },
    { q: `Do you handle HOAs in ${city.name}?`, a: `Yes. We've submitted to most ${city.name}-area HOAs and provide spec sheets and 3D renderings at no charge.` }
  ];
  const jsonld = [breadcrumbs(crumbs), localBusinessLD(city), faqLD(faqs)];
  const heroImg = pickPhotos('residential', city.slug, 1)[0];
  const html = head({ title, desc, canonical, kw: `permanent outdoor lights ${city.name.toLowerCase()}`, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `Serving ${city.name}, CA · From $950`, h1, lead: city.intro, ctaPrice: 950, img: heroImg }) +
    trustBar() +
    statsCounters([
      { num: city.population.toLocaleString(), lab: `${city.name} population` },
      { num: `${city.driveTime} min`, lab: 'From our Fresno shop' },
      { num: city.neighborhoods.length + '+', lab: 'Neighborhoods served' },
      { num: city.zips.length, lab: `${city.name} ZIP codes` }
    ]) +
    `<section class="container intro-block">
      ${sectionHead({ eyebrow: `Why ${city.name}`, h2: `${city.name} homeowners`, em: 'choose us.', intro: city.intro })}
      <p>Population ${city.population.toLocaleString()}. Drive time from our Fresno shop: ${city.driveTime} minutes. We've installed across ${city.neighborhoods.slice(0, 5).map(esc).join(', ')}.</p>
      <p class="muted">Also searched as: ${city.name} permanent outdoor lights, outdoor lights permanent ${city.name}, permanent out door lights ${city.name}, permanent exterior house lighting ${city.name}, ${city.name} christmas lighting company.</p>
    </section>` +
    installPhotoGrid({ category: 'residential', seed: city.slug, kicker: `${city.name} work`, h2: `Real ${city.name}`, em: 'installs.', intro: `Selected from our ${shared.brand.installs}+ Central Valley installs.` }) +
    `<section class="solutions container">
      ${sectionHead({ eyebrow: `${city.name} services`, h2: 'Every reason you wanted permanent lights —', em: 'covered.', intro: `Pick the install style that fits your home. Same crew, same warranty, same Jellyfish RGBIC-RD hardware across every service.` })}
      ${solutionsGrid(services.slice(0, 9).map(s => ({
        h: s.h1.split(' Installation')[0].split(' in ')[0],
        p: s.lead.slice(0, 130),
        img: pickPhotos(SERVICE_PHOTO_MAP[s.slug] || 'residential', s.slug + city.slug, 1)[0],
        alt: s.imageAlt || s.h1,
        href: `/${s.slug}-${city.slug}`,
        linkLabel: `From ${usd(s.fromPrice)}`
      })))}
    </section>` +
    testimonialBlock(city) +
    processTimelineBlock({ kicker: `${city.name} install process`, h2: 'How a', em: `${city.name} install runs.`, intro: `Same five steps everywhere. ${city.driveTime}-minute drive from our Fresno shop means same-day quote turnarounds.` }) +
    `<section class="container neighborhood-list">
      ${sectionHead({ eyebrow: `${city.name} coverage`, h2: 'Every neighborhood,', em: `every ZIP.` })}
      <div class="nbhd-pills">${city.neighborhoods.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div>
      <p class="muted">ZIPs we serve: ${city.zips.map(esc).join(' · ')}</p>
    </section>` +
    `<section class="container climate-block">
      ${sectionHead({ eyebrow: 'Climate', h2: `Built for ${city.name}`, em: `weather.`, intro: `Summer highs in ${city.name} regularly hit ${city.climate.summerHigh}°F. ${city.climate.notes} Our IP67-rated track and -40°F to 140°F LED chips are engineered for it.` })}
    </section>` +
    techSpecsBlock() +
    guaranteeBlock() +
    faqBlock(faqs) +
    cityRowBlock(city.slug) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Vertical (commercial) ----------
function renderVertical(v) {
  const canonical = `/${v.slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Commercial', url: '/commercial' },
    { name: v.h1.split(' Installation')[0].split(' in ')[0], url: canonical }
  ];
  const faqs = [
    { q: `How much does ${(v.h1.split(' Installation')[0]).toLowerCase()} cost?`, a: `${v.h1.split(' Installation')[0]} starts at ${usd(v.fromPrice)} for typical commercial installations. Multi-property and chain-account pricing available.` },
    { q: 'Do you handle multi-location accounts?', a: 'Yes — we manage multi-property contracts across the Central Valley with single-invoice billing and dedicated account management.' },
    { q: 'How fast is service response?', a: 'Same-day in Fresno County, next business day across the Central Valley. Service contracts include guaranteed SLA.' },
    { q: 'Are the systems insurance-friendly?', a: 'Yes. IP67-rated, UL-listed components, and we provide certificates of insurance on request.' }
  ];
  const jsonld = [
    breadcrumbs(crumbs),
    serviceLD(v.h1, v.metaDesc, 'Central Valley California', v.fromPrice),
    faqLD(faqs)
  ];
  const photoCat = VERTICAL_PHOTO_MAP[v.slug] || 'commercial';
  const heroImg = pickPhotos(photoCat, v.slug, 1)[0];
  const fresno = cities.find(c => c.slug === 'fresno');
  const baseName = v.h1.split(' Installation')[0].split(' in ')[0];
  const html = head({ title: v.title, desc: v.metaDesc, canonical, kw: v.primaryKw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `Commercial · From ${usd(v.fromPrice)}`, h1: v.h1, lead: v.lead, ctaPrice: v.fromPrice, img: heroImg }) +
    trustBar() +
    `<section class="container intro-block">
      ${sectionHead({ eyebrow: 'About this service', h2: `${baseName} —`, em: 'commercial-grade.', intro: v.intro })}
    </section>` +
    reelMomentBlock({ video: '/videos/commercial-loop.mp4', kicker: 'In motion', h: 'Lit business hours.', em: 'Lit after-hours, too.', p: 'One install. Brand colors during open. Mood lighting during service. Music-sync for events. All controlled from a single tablet behind the bar.', poster: heroImg }) +
    installPhotoGrid({ category: photoCat, seed: v.slug, kicker: `${baseName} portfolio`, h2: 'Real commercial', em: 'installs.', intro: 'Shot at active operating businesses across our portfolio.' }) +
    `<section class="container use-cases">
      ${sectionHead({ eyebrow: 'Use cases', h2: 'Where this', em: 'earns its install.' })}
      <div class="use-grid">${v.useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div>
    </section>` +
    `<section class="container stats-block">
      ${sectionHead({ eyebrow: 'By the numbers', h2: 'What operators', em: 'are seeing.' })}
      <div class="stat-grid">${v.stats.map(s => `<div class="stat-card"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div>
    </section>` +
    testimonialBlock(fresno, pickPhotos(photoCat, v.slug + 't', 1)[0]) +
    techSpecsBlock() +
    processTimelineBlock({ kicker: 'Commercial install', h2: 'How a', em: 'commercial install runs.', intro: 'Two to five business days for most builds. Multi-property contracts get dedicated account management.' }) +
    `<section class="container city-grid">
      ${sectionHead({ eyebrow: 'By city', h2: `${baseName} across`, em: 'the Central Valley.' })}
      <div class="city-pills">${cities.map(c => `<a href="/${v.slug}-${c.slug}" class="pill">${esc(c.name)}</a>`).join('')}</div>
    </section>` +
    guaranteeBlock() +
    faqBlock(faqs) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Vertical × City ----------
function renderVerticalCity(v, city) {
  const slug = `${v.slug}-${city.slug}`;
  const baseName = v.h1.split(' Installation')[0].split(' in ')[0];
  const h1 = `${baseName} in ${city.name}, CA`;
  const title = `${baseName} ${city.name} CA | Commercial | ${BRAND}`;
  const desc = `${baseName} for ${city.name} businesses. ${v.lead} From ${usd(v.fromPrice)}. Multi-property accounts. Same-day service.`;
  const canonical = `/${slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Commercial', url: '/commercial' },
    { name: baseName, url: `/${v.slug}` },
    { name: city.name, url: canonical }
  ];
  const faqs = [
    { q: `Do you handle ${baseName.toLowerCase()} for ${city.name} businesses?`, a: `Yes. We install across ${city.name} commercial corridors including ${city.neighborhoods.slice(0, 4).join(', ')}.` },
    { q: 'What are typical timelines?', a: `${city.name} commercial installs typically complete in 2-5 business days depending on building size and electrical complexity.` },
    { q: 'Same-day service?', a: `Yes — drive time from our Fresno shop to ${city.name} is about ${city.driveTime} minutes, so service calls land same-day.` }
  ];
  const jsonld = [
    breadcrumbs(crumbs),
    serviceLD(h1, desc, { '@type': 'City', name: city.name }, v.fromPrice),
    localBusinessLD(city),
    faqLD(faqs)
  ];
  const photoCat = VERTICAL_PHOTO_MAP[v.slug] || 'commercial';
  const heroImg = pickPhotos(photoCat, slug, 1)[0];
  const html = head({ title, desc, canonical, kw: `${v.primaryKw} ${city.name.toLowerCase()}`, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `${city.name}, CA · Commercial`, h1, lead: `${v.lead} Serving ${city.name} businesses across ${city.neighborhoods.slice(0, 3).join(', ')}.`, ctaPrice: v.fromPrice, img: heroImg }) +
    trustBar() +
    `<section class="container intro-block">
      ${sectionHead({ eyebrow: `${city.name} commercial`, h2: `${baseName} for`, em: `${city.name}.`, intro: `${v.intro}` })}
      <p>In ${esc(city.name)} specifically, we work with operators across ${city.neighborhoods.slice(0, 4).map(esc).join(', ')}, with same-day response from our Fresno shop (${city.driveTime}-minute drive).</p>
    </section>` +
    installPhotoGrid({ category: photoCat, seed: slug, kicker: 'Recent work', h2: `${baseName}`, em: 'in the field.' }) +
    `<section class="container use-cases">
      ${sectionHead({ eyebrow: `${city.name} use cases`, h2: 'Where this', em: `lands in ${city.name}.` })}
      <div class="use-grid">${v.useCases.slice(0, 6).map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div>
    </section>` +
    testimonialBlock(city, pickPhotos(photoCat, slug + 't', 1)[0]) +
    techSpecsBlock() +
    guaranteeBlock() +
    faqBlock(faqs) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Comparison ----------
function renderComparison(c) {
  const canonical = `/${c.slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare' },
    { name: c.competitor, url: canonical }
  ];
  const jsonld = [breadcrumbs(crumbs), {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: c.h1, description: c.metaDesc, author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND }, datePublished: '2026-01-15'
  }];
  const heroImg = pickPhotos('residential', c.slug, 1)[0];
  const fresno = cities.find(c2 => c2.slug === 'fresno');
  const wins = c.rows.filter(r => r.winner === 'us').length;
  const ties = c.rows.filter(r => r.winner === 'tie').length;
  const html = head({ title: c.title, desc: c.metaDesc, canonical, kw: c.primaryKw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: 'Honest comparison', h1: c.h1, lead: c.lead, img: heroImg }) +
    trustBar() +
    statsCounters([
      { num: c.rows.length, lab: 'Features compared' },
      { num: wins, lab: `${BRAND.split(' ')[0]} wins` },
      { num: ties, lab: 'Ties' },
      { num: c.rows.length - wins - ties - c.rows.filter(r => r.winner === 'depends').length, lab: `${c.competitor.split(' ')[0]} wins` }
    ]) +
    `<section class="container compare-table-section">
       ${sectionHead({ eyebrow: 'Side by side', h2: 'Feature-by-feature,', em: 'no marketing.' })}
       <div class="compare-wrap">
         <table class="compare-table">
           <thead><tr><th>Feature</th><th>${esc(BRAND)}</th><th>${esc(c.competitor)}</th></tr></thead>
           <tbody>
             ${c.rows.map(r => `<tr class="winner-${esc(r.winner)}"><td>${esc(r.feature)}</td><td>${esc(r.us)}</td><td>${esc(r.them)}</td></tr>`).join('')}
           </tbody>
         </table>
       </div>
       <div class="verdict"><strong>Bottom line:</strong> ${esc(c.verdict)}</div>
     </section>` +
    pullQuote(c.verdict, `${BRAND}, ${shared.brand.founded}`) +
    testimonialBlock(fresno, pickPhotos('residential', c.slug + 't', 1)[0]) +
    guaranteeBlock() +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Cost Page ----------
function renderCost({ slug, h1, title, desc, kw, lead, sections, faqs }) {
  const canonical = `/${slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
    { name: h1, url: canonical }
  ];
  const jsonld = [breadcrumbs(crumbs), faqLD(faqs)];
  const heroImg = pickPhotos('residential', slug, 1)[0];
  const fresno = cities.find(c => c.slug === 'fresno');
  const html = head({ title, desc, canonical, kw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: 'Transparent pricing', h1, lead, img: heroImg }) +
    trustBar() +
    statsCounters([
      { num: usd(shared.pricing.starterFrom), lab: 'Starter from' },
      { num: usd(shared.pricing.standardFrom), lab: 'Standard from' },
      { num: usd(shared.pricing.premiumFrom), lab: 'Premium from' },
      { num: '0% APR', lab: '12-month financing' }
    ]) +
    sections.map((s, i) => `<section class="container cost-section">
      ${sectionHead({ eyebrow: `Section ${i + 1}`, h2: s.h.split(' ').slice(0, -2).join(' '), em: s.h.split(' ').slice(-2).join(' ') })}
      ${s.body.map(p => `<p>${esc(p)}</p>`).join('')}
      ${s.table ? `<table class="price-table"><thead><tr>${s.table.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
    </section>`).join('') +
    testimonialBlock(fresno, pickPhotos('residential', slug + 't', 1)[0]) +
    guaranteeBlock() +
    faqBlock(faqs) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Generic Article (guides, neighborhoods, gallery) ----------
function renderArticle({ slug, h1, title, desc, kw, kicker, lead, parent, body, faqs = [], img, extraSchema = [] }) {
  const canonical = `/${slug}`;
  const crumbs = [{ name: 'Home', url: '/' }];
  if (parent) crumbs.push(parent);
  crumbs.push({ name: h1, url: canonical });
  const jsonld = [breadcrumbs(crumbs)];
  if (faqs.length) jsonld.push(faqLD(faqs));
  jsonld.push({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: h1, description: desc, author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND }, datePublished: '2026-02-01'
  });
  if (extraSchema.length) jsonld.push(...extraSchema);
  const heroImg = img || pickPhotos('residential', slug, 1)[0];
  const fresno = cities.find(c => c.slug === 'fresno');
  // For guides specifically, add a testimonial near the bottom
  const isGuide = slug.startsWith('guide-');
  const html = head({ title, desc, canonical, kw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker, h1, lead, img: heroImg }) +
    trustBar() +
    body +
    (isGuide ? testimonialBlock(fresno) : '') +
    (faqs.length ? faqBlock(faqs) : '') +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Blog Post ----------
function renderPost(post) {
  const canonical = `/blog/${post.slug}`;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.h1, url: canonical }
  ];
  const wordCount = post.body.reduce((n, s) => n + s.p.reduce((m, p) => m + p.split(/\s+/).length, 0), 0);
  const readingMin = Math.max(2, Math.round(wordCount / 220));
  const jsonld = [
    breadcrumbs(crumbs),
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: post.h1, description: post.desc,
      author: { '@type': 'Organization', name: BRAND, url: SITE },
      publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${SITE}/images/logo-600.png` } },
      datePublished: '2026-02-15', dateModified: '2026-02-15',
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + canonical },
      wordCount, image: `${SITE}/images/03-accent.jpg`
    }
  ];
  if (post.faqs && post.faqs.length) jsonld.push(faqLD(post.faqs));

  // Pick 3 related posts (same intent) excluding self
  const related = posts.filter(x => x.slug !== post.slug && x.intent === post.intent).slice(0, 3);

  // Pick category by intent
  // Each blog post gets its own unique image from /images/blog/{intent}/.
  // Posts within the same intent are deterministically assigned different files
  // so no two posts share the same hero.
  const blogImageCounts = { informational: 10, commercial: 17, transactional: 7, local: 10, troubleshooting: 6, process: 6, niche: 4 };
  const blogPrefixes = { informational: 'i', commercial: 'c', transactional: 't', local: 'l', troubleshooting: 'tr', process: 'p', niche: 'n' };
  const intent = post.intent || 'informational';
  // Build an ordered list of slugs in this intent, then map by index → image #
  const intentSlugs = posts.filter(x => x.intent === intent).map(x => x.slug);
  const idx = (intentSlugs.indexOf(post.slug) % (blogImageCounts[intent] || 1)) + 1;
  const heroImg = `/images/blog/${intent}/${blogPrefixes[intent] || 'i'}${idx}.jpg`;
  const photoCat = { local: 'residential', informational: 'accent', commercial: 'residential', transactional: 'accent', troubleshooting: 'security', process: 'residential', niche: 'gameday' }[intent] || 'residential';
  const fresno = cities.find(c => c.slug === 'fresno');
  // Insert a pull-quote after the second section if there's a strong sentence to use
  let pulledIdx = -1;
  if (post.body.length >= 3) pulledIdx = 1;

  const html = head({ title: post.title, desc: post.desc, canonical, kw: post.kw, ogImg: heroImg, jsonld }) +
    headerHTML(canonical) +
    `<main class="blog-post">` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `${post.kicker} · ${readingMin} min read`, h1: post.h1, lead: post.lead, img: heroImg }) +
    trustBar() +
    `<article class="post-body container">
       <p class="post-byline">By the install crew at ${esc(BRAND)} · Updated ${new Date('2026-02-15').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
       ${post.body.map((s, i) => {
         const sectionHTML = `<section class="post-section"><h2>${esc(s.h)}</h2>${s.p.map(p => `<p>${esc(p)}</p>`).join('')}</section>`;
         if (i === pulledIdx) {
           const pullText = post.body[0].p[0] || post.lead;
           return sectionHTML + pullQuote(pullText.length > 200 ? pullText.slice(0, 197) + '…' : pullText);
         }
         return sectionHTML;
       }).join('')}
     </article>` +
    testimonialBlock(fresno, pickPhotos(photoCat, post.slug + 't', 1)[0]) +
    (post.faqs && post.faqs.length ? faqBlock(post.faqs) : '') +
    (related.length ? `<section class="container related-posts">
       ${sectionHead({ eyebrow: 'Keep reading', h2: 'Related', em: 'reads.' })}
       <div class="related-grid">
         ${related.map(r => `<a href="/blog/${r.slug}" class="related-card"><div class="related-kicker">${esc(r.kicker)}</div><h4>${esc(r.h1)}</h4><p>${esc(r.lead.slice(0, 110))}</p></a>`).join('')}
       </div>
     </section>` : '') +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Blog Index ----------
function renderBlogIndex() {
  const canonical = `/blog`;
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Blog', url: canonical }];
  const intentLabels = {
    informational: 'How it works',
    commercial: 'Decisions & comparisons',
    transactional: 'Cost & financing',
    local: 'Local & seasonal',
    troubleshooting: 'Troubleshooting',
    process: 'Install & process',
    niche: 'Specific situations'
  };
  const jsonld = [breadcrumbs(crumbs), {
    '@context': 'https://schema.org', '@type': 'Blog',
    name: `${BRAND} Blog`, url: `${SITE}/blog`,
    blogPost: posts.slice(0, 20).map(p => ({
      '@type': 'BlogPosting', headline: p.h1, url: `${SITE}/blog/${p.slug}`,
      description: p.desc, datePublished: '2026-02-15'
    }))
  }];
  const grouped = {};
  posts.forEach(p => { (grouped[p.intent] = grouped[p.intent] || []).push(p); });
  const html = head({
    title: `Blog | Permanent Outdoor Lighting Insights | ${BRAND}`,
    desc: 'Sixty plain-English articles on permanent outdoor lighting — how it works, what it costs, when it pays off, and how to get the install right.',
    canonical, kw: 'permanent outdoor lighting blog', jsonld
  }) +
    headerHTML(canonical) +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({
      kicker: `${posts.length} articles · written by installers`,
      h1: 'Permanent Outdoor Lighting Blog',
      h1Lines: ['Permanent', 'lighting', 'insights.'],
      lead: 'Plain-English answers to the questions homeowners actually ask before, during, and after a permanent lighting install.',
      img: '/images/blog/informational/i1.jpg'
    }) +
    trustBar() +
    Object.keys(intentLabels).map((intent, i) => {
      const list = grouped[intent] || [];
      if (!list.length) return '';
      const emWord = intentLabels[intent].split(' ').pop();
      const head = intentLabels[intent].split(' ').slice(0, -1).join(' ') || intentLabels[intent];
      return `<section class="container blog-bucket">
        ${sectionHead({ eyebrow: `${list.length} articles · ${intentLabels[intent].toLowerCase()}`, h2: head, em: emWord })}
        <div class="blog-grid">
          ${list.map(p => `<a href="/blog/${p.slug}" class="blog-card"><div class="blog-card-kicker">${esc(p.kicker)}</div><h3>${esc(p.h1)}</h3><p>${esc(p.lead.slice(0, 130))}</p></a>`).join('')}
        </div>
      </section>`;
    }).join('') +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ============================================================
// PAGE GENERATION
// ============================================================
const pages = [];

// 1. Service hubs (13)
services.forEach(s => pages.push(renderServiceHub(s)));

// 2. City hubs (12)
cities.forEach(c => pages.push(renderCityHub(c)));

// 3. Service × City matrix (top 8 services × 12 cities = 96, plus seasonal pages 8 services × 12 cities)
const matrixServices = services; // all 13
matrixServices.forEach(s => cities.forEach(c => pages.push(renderServiceCity(s, c))));
// 13 × 12 = 156 service×city pages

// 4. Verticals (9)
verticals.forEach(v => pages.push(renderVertical(v)));

// 5. Vertical × top-6 cities = 54
const topCities = cities.slice(0, 6);
verticals.forEach(v => topCities.forEach(c => pages.push(renderVerticalCity(v, c))));

// 6. Comparison pages (12)
comparisons.forEach(c => pages.push(renderComparison(c)));

// 7. Cost pages (set below)
const costPages = buildCostPages();
costPages.forEach(p => pages.push(p));

// 8. Buyer guides (set below)
const guides = buildGuides();
guides.forEach(p => pages.push(p));

// 9. Trust / utility / index pages
const utilityPages = buildUtility();
utilityPages.forEach(p => pages.push(p));

// 10. Neighborhood pages — top 2 per top-6 cities = 12
const neighborhoodPages = buildNeighborhoods();
neighborhoodPages.forEach(p => pages.push(p));

// 11. Gallery / use-case pages
const galleryPages = buildGalleries();
galleryPages.forEach(p => pages.push(p));

// 11b. Tier B exact-match brand pages (Low-comp Google Keyword Planner targets)
buildBrandPages().forEach(p => pages.push(p));

// 12. Blog index + 60 posts
if (posts.length) {
  pages.push(renderBlogIndex());
  posts.forEach(post => pages.push(renderPost(post)));
}

// ---------- COST PAGE BUILDERS ----------
function buildCostPages() {
  const out = [];
  const baseFaqs = [
    { q: 'What is the cheapest option?', a: `Our Starter package starts at ${usd(shared.pricing.starterFrom)} — single facade, ~30 ft, full app control with 16M colors and 200+ patterns, lifetime track warranty.` },
    { q: 'Do you finance?', a: `Yes — 0% APR for 12 months. Standard installs run ~$89/month, Premium ~$169/month. $0 down.` },
    { q: 'Is the quote firm?', a: 'Yes. Written, fixed price on the spot after a free on-site walk. No upsells, no surprises.' },
    { q: 'Are there permit costs?', a: 'No permit is required for residential under-eave installation in Fresno County. Commercial varies — we handle filing if needed.' }
  ];
  // Master cost page
  out.push(renderCost({
    slug: 'cost',
    h1: 'Permanent Outdoor Lighting Cost (2026 Pricing Guide)',
    title: 'Permanent Outdoor Lighting Cost 2026 | From $950 | Fresno CA',
    desc: 'Real 2026 pricing for permanent outdoor lighting in Fresno County. Starter from $950, Standard $2,800, Premium $5,800. Financing from $89/month. No quote-only games.',
    kw: 'permanent outdoor lighting cost',
    lead: 'Most installers won\'t publish prices. We do. Here\'s exactly what permanent outdoor lighting costs in 2026.',
    sections: [
      { h: 'Quick price ranges', body: [`Starter (single facade, ~30 ft): from ${usd(shared.pricing.starterFrom)}.`, `Standard (full front + sides, ~80 ft, single story): from ${usd(shared.pricing.standardFrom)}.`, `Premium (full perimeter, two-story): from ${usd(shared.pricing.premiumFrom)}.`, `Estate (multi-zone, complex rooflines): from ${usd(shared.pricing.estateFrom)}.`],
        table: { headers: ['Tier', 'Coverage', 'From'], rows: [['Starter', '~30 ft single facade', usd(shared.pricing.starterFrom)], ['Standard', '~80 ft single story', usd(shared.pricing.standardFrom)], ['Premium', 'Two-story full perimeter', usd(shared.pricing.premiumFrom)], ['Estate', 'Multi-zone complex', usd(shared.pricing.estateFrom) + '+']] } },
      { h: 'What drives the price', body: ['Linear feet of track is the biggest driver. Two-story stories add 30-40% for ladder time. Custom track color (bronze, brown) adds $200-$400. Smart-home integration (Control4, Elan) adds $300-$600.'] },
      { h: 'What\'s included', body: ['Genuine Jellyfish RGBIC-RD aluminum track. IP67 weather-rated LEDs. Color-matched to your trim. Concealed wiring. Weatherproof control box. App setup and walkthrough. Lifetime track warranty. 5-year LED warranty. 60-day money-back guarantee.'] },
      { h: 'Financing', body: [`0% APR for 12 months. Starter ~${usd(shared.pricing.starterMonthly)}/mo. Standard ~${usd(shared.pricing.standardMonthly)}/mo. Premium ~${usd(shared.pricing.premiumMonthly)}/mo. $0 down. Soft credit pull, decision in 60 seconds.`] }
    ],
    faqs: baseFaqs
  }));
  // Cost by city (12)
  cities.forEach(c => out.push(renderCost({
    slug: `cost-${c.slug}`,
    h1: `Permanent Outdoor Lighting Cost in ${c.name}, CA (2026)`,
    title: `Permanent Outdoor Lighting Cost ${c.name} CA | 2026 Pricing`,
    desc: `Real 2026 prices for permanent outdoor lighting in ${c.name}, CA. Starter from $950. Most ${c.name} homes $2,800-$5,800. Financing from $89/month.`,
    kw: `permanent outdoor lighting cost ${c.name.toLowerCase()}`,
    lead: `Pricing for ${c.name} homes specifically — based on actual ${c.name} installs we've completed across ${c.neighborhoods.slice(0, 3).join(', ')}.`,
    sections: [
      { h: `${c.name} price ranges (typical homes)`, body: [`Most ${c.name} single-story homes (1,800-2,400 sq ft) land Standard tier: ${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}.`, `Two-story homes in ${c.neighborhoods[0]} and ${c.neighborhoods[1]} typically Premium tier: ${usd(shared.pricing.premiumFrom)}-${usd(shared.pricing.estateFrom)}.`, `Tract starter homes: ${usd(shared.pricing.starterFrom)}-${usd(shared.pricing.standardFrom)}.`] },
      { h: 'What\'s the same as our master pricing', body: ['Same RGBIC-RD hardware. Same lifetime track warranty. Same 60-day money-back. Same financing terms (0% APR, 12 months).'] },
      { h: `${c.name}-specific notes`, body: [`Drive time from our Fresno shop is about ${c.driveTime} minutes — no travel surcharge inside Fresno County.`, `${c.name} summer highs of ${c.climate.summerHigh}°F are well within our IP67/-40°F-to-140°F operating envelope.`, c.popularUseCase ? `Most-requested in ${c.name}: ${c.popularUseCase}` : ''].filter(Boolean) }
    ],
    faqs: baseFaqs
  })));
  // Cost by service (top 6)
  const costSvc = services.slice(0, 6);
  costSvc.forEach(s => out.push(renderCost({
    slug: `cost-${s.slug}`,
    h1: `${s.h1.split(' Installation')[0]} Cost (2026)`,
    title: `${s.h1.split(' Installation')[0]} Cost | 2026 Fresno Pricing`,
    desc: `Real 2026 pricing for ${(s.h1.split(' Installation')[0]).toLowerCase()} in Fresno County. From ${usd(s.fromPrice)}. Lifetime warranty. Financing available.`,
    kw: `${s.primaryKw} cost`,
    lead: `Pricing specifically for ${(s.h1.split(' Installation')[0]).toLowerCase()} — based on ${shared.brand.installs}+ installs across the Central Valley.`,
    sections: [
      { h: 'Price ranges', body: [`Starts at ${usd(s.fromPrice)}. Most installs land ${usd(s.fromPrice)}-${usd(s.fromPrice * 3)}.`] },
      { h: 'What\'s included', body: [s.intro] },
      { h: 'Specs', body: s.specs.slice(0, 3).map(sp => `${sp.label}: ${sp.value}`) }
    ],
    faqs: baseFaqs.concat(s.faqs.slice(0, 2))
  })));
  // Cost variants (general)
  const variants = [
    { slug: 'cost-vs-seasonal', h1: 'Permanent vs Seasonal Christmas Lights: 5-Year Cost', desc: 'Permanent lighting vs annual seasonal Christmas light installation — 5-year cost compared.', lead: 'Seasonal hangs run $850-$1,400 a year in Fresno. Five years of that is the breakeven for permanent.', kw: 'permanent lights vs seasonal cost' },
    { slug: 'cost-financing', h1: 'Permanent Lighting Financing: $89/Month at 0% APR', desc: '0% APR financing for permanent outdoor lighting. From $32/month Starter, $89/month Standard, $169/month Premium.', lead: '$0 down. 12 months at 0% APR. Soft credit pull. Decision in 60 seconds.', kw: 'permanent lighting financing' },
    { slug: 'cost-2-story', h1: 'Permanent Lighting Cost for Two-Story Homes', desc: 'Two-story permanent lighting installation pricing. Typically $5,800-$9,000 for full perimeter. Same warranty.', lead: 'Two-story homes run roughly 30-40% more than single-story — the work is in ladder time, not hardware.', kw: 'permanent lights two story cost' },
    { slug: 'cost-per-foot', h1: 'Permanent Outdoor Lighting Cost Per Foot', desc: 'Cost per linear foot for professionally installed permanent outdoor lighting. Typically $30-$60/ft installed.', lead: 'Installed cost runs $30-$60 per linear foot, depending on tier and access. Here\'s the math.', kw: 'permanent outdoor lighting cost per foot' },
    { slug: 'cost-commercial', h1: 'Commercial Permanent Lighting Cost', desc: 'Commercial permanent outdoor lighting pricing for restaurants, hotels, storefronts, HOAs, and more. From $4,500.', lead: 'Commercial pricing scales with linear feet, complexity, and zone count. Most multi-property accounts qualify for volume terms.', kw: 'commercial permanent lighting cost' },
    { slug: 'cost-hoa', h1: 'HOA & Apartment Permanent Lighting Cost', desc: 'Multi-unit permanent lighting cost for HOAs and apartment complexes in the Central Valley.', lead: 'Per-unit pricing drops 20-30% on multi-unit accounts. Single-invoice billing. SLA service contracts.', kw: 'hoa permanent lighting cost' }
  ];
  variants.forEach(v => out.push(renderCost({
    slug: v.slug, h1: v.h1, title: `${v.h1} | ${BRAND}`, desc: v.desc, kw: v.kw, lead: v.lead,
    sections: [
      { h: 'The numbers', body: [v.lead, 'Want a real quote? Free on-site estimate within 24 hours. Written, fixed pricing on the spot.'] }
    ],
    faqs: baseFaqs
  })));
  return out;
}

// ---------- BUYER GUIDE BUILDERS ----------
function buildGuides() {
  const out = [];
  const guides = [
    { slug: 'guide-permanent-vs-seasonal', h1: 'Permanent Lights vs Seasonal Hangs: The Honest Guide', desc: 'When permanent lighting wins, when seasonal hangs win, and the 5-year math that decides it.', kw: 'permanent vs seasonal christmas lights guide', kicker: 'Buyer guide' },
    { slug: 'guide-best-permanent-lights', h1: 'Best Permanent Outdoor Lights in 2026', desc: 'Real comparison of the top permanent outdoor lighting brands — Jellyfish, Trimlight, Gemstone, EverLights, Oelo, Govee.', kw: 'best permanent outdoor lights', kicker: 'Buyer guide' },
    { slug: 'guide-jellyfish-lighting', h1: 'Jellyfish Lighting: What It Is and How It Works', desc: 'Plain-English guide to Jellyfish Lighting — what makes RGBIC-RD different, how the track installs, what the warranty really covers.', kw: 'what is jellyfish lighting', kicker: 'Brand guide' },
    { slug: 'guide-rgbic-vs-rgb', h1: 'RGBIC vs RGB: The Difference for Outdoor Lights', desc: 'RGBIC vs RGB explained — pixel control, gradient smoothness, pattern variety. Why RGBIC matters for permanent lights.', kw: 'rgbic vs rgb', kicker: 'Tech guide' },
    { slug: 'guide-hoa-approval', h1: 'How to Get HOA Approval for Permanent Lighting', desc: 'Step-by-step HOA submission for permanent outdoor lighting in Fresno County. Spec sheets, renderings, and language that wins.', kw: 'hoa permanent lighting approval', kicker: 'Process guide' },
    { slug: 'guide-installation-process', h1: 'Permanent Lighting Installation: What to Expect', desc: 'Day-of installation walkthrough — site prep, track install, wiring, control box, app setup, walkthrough.', kw: 'permanent lighting installation process', kicker: 'Process guide' },
    { slug: 'guide-warranty-explained', h1: 'Permanent Lighting Warranty: What\'s Actually Covered', desc: 'Lifetime track warranty, 5-year LED warranty, 5-year workmanship, 60-day money-back. Plain-English coverage.', kw: 'permanent lighting warranty', kicker: 'Buyer guide' },
    { slug: 'guide-app-control', h1: 'Permanent Lighting App: 200+ Patterns Explained', desc: 'Full walkthrough of the app — schedules, scenes, music sync, holiday auto-mode, smart-home integration.', kw: 'permanent lighting app', kicker: 'Owner guide' },
    { slug: 'guide-smart-home', h1: 'Permanent Lighting + Control4, Elan, Alexa, Google', desc: 'Smart home integration for permanent outdoor lighting — Control4, Nice Elan, Alexa, Google Home setup.', kw: 'permanent lighting smart home', kicker: 'Tech guide' },
    { slug: 'guide-led-track-types', h1: 'Permanent Lighting Track Types: Which Profile You Want', desc: 'Square channel vs RD profile vs J-channel — track shapes for permanent outdoor lighting compared.', kw: 'permanent lighting track types', kicker: 'Tech guide' },
    { slug: 'guide-cleaning-care', h1: 'Permanent Lighting Care & Cleaning', desc: 'How to keep permanent outdoor lighting clean and looking new — annual maintenance, tree-sap removal, dust.', kw: 'permanent lighting maintenance', kicker: 'Owner guide' },
    { slug: 'guide-removal-process', h1: 'Permanent Lighting Removal & Refund Process', desc: 'How our 60-day money-back guarantee actually works — what we pull, what we patch, how the refund flows.', kw: 'permanent lighting refund', kicker: 'Process guide' }
  ];
  guides.forEach(g => out.push(renderArticle({
    slug: g.slug, h1: g.h1,
    title: `${g.h1} | ${BRAND}`,
    desc: g.desc, kw: g.kw, kicker: g.kicker,
    parent: { name: 'Guides', url: '/guides' },
    lead: g.desc,
    body: `<section class="container article-body">
      <h2>The short answer</h2>
      <p>${esc(g.desc)}</p>
      <h2>The full breakdown</h2>
      <p>Permanent outdoor lighting from ${esc(BRAND)} uses ${esc(shared.tech.ledType)} LEDs in aluminum track that's color-matched to your trim. The system delivers ${esc(shared.tech.colors)} colors per pixel, ${shared.tech.patterns}+ preset patterns, and a ${esc(shared.tech.lifespan)} lifespan rated to ${esc(shared.tech.weatherRating)} weather and ${esc(shared.tech.tempRange)}.</p>
      <p>Pricing starts at ${usd(shared.pricing.starterFrom)} for a Starter install. Most homes land between ${usd(shared.pricing.standardFrom)} and ${usd(shared.pricing.premiumFrom)}. Financing is available at 0% APR for 12 months, with $0 down.</p>
      <p>The system covers Christmas, Halloween, July 4th, Thanksgiving, Easter, Valentine's Day, St. Patrick's Day, Diwali, game day, and architectural warm-white year-round. One install, every holiday.</p>
      <h2>Why it matters</h2>
      <p>Most homeowners think "permanent Christmas lights" and stop there. The reality is the system runs warm-white architectural mode 350 days a year and cycles through 200+ holiday presets the other 15. It's a year-round amenity, not a seasonal toy.</p>
      <h2>What we recommend</h2>
      <p>Start with a free on-site estimate. We'll measure linear feet, identify ladder access, propose track color, and quote in writing on the spot. ${esc(shared.brand.installs)}+ installs and ${esc(shared.brand.reviews)}+ reviews at ${shared.brand.rating}★ on Google.</p>
    </section>`,
    faqs: [
      { q: 'How long does install take?', a: 'Single-story homes 6-8 hours. Two-story 1-2 days.' },
      { q: 'What\'s the warranty?', a: `Lifetime on the aluminum track. 5 years on the LEDs. 5 years on workmanship. Plus 60-day money-back guarantee.` },
      { q: 'How much does it cost?', a: `Starts at ${usd(shared.pricing.starterFrom)}. Most homes ${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}. Financing from ${usd(shared.pricing.standardMonthly)}/month.` }
    ]
  })));
  return out;
}

// ---------- UTILITY / HUB PAGES ----------
function buildUtility() {
  const out = [];
  // /services hub
  out.push(renderArticle({
    slug: 'services',
    h1: 'All Lighting Services',
    title: `Permanent Outdoor Lighting Services | ${BRAND}`,
    desc: 'Every permanent outdoor lighting service we offer in Fresno County — Christmas lights, accent lighting, security, patio, pool, pathway, game day, and more.',
    kw: 'permanent outdoor lighting services',
    kicker: 'Services',
    lead: 'Every lighting service we offer, all in one place.',
    body: `<section class="solutions container">
      ${sectionHead({ eyebrow: 'Residential', h2: 'Lighting for', em: 'every reason.', intro: 'One install, every holiday, every architectural mode. App-controlled. Lifetime warranty.' })}
      ${solutionsGrid(services.map(s => ({ h: s.h1.split(' Installation')[0].split(' in ')[0], p: s.lead.slice(0, 130), img: s.image, alt: s.imageAlt || s.h1, href: `/${s.slug}`, linkLabel: `From ${usd(s.fromPrice)}` })))}
    </section>
    <section class="solutions container">
      ${sectionHead({ eyebrow: 'Commercial', h2: 'Built for', em: 'business operators.', intro: 'Multi-property accounts, single-invoice billing, same-day SLA service across the Central Valley.' })}
      ${solutionsGrid(verticals.map(v => ({ h: v.h1.split(' Installation')[0].split(' in ')[0], p: v.lead.slice(0, 130), img: v.image, alt: v.imageAlt || v.h1, href: `/${v.slug}`, linkLabel: `From ${usd(v.fromPrice)}` })))}
    </section>`
  }));
  // /service-areas hub
  out.push(renderArticle({
    slug: 'service-areas',
    h1: 'Service Areas: Central Valley California',
    title: `Service Areas | Fresno · Clovis · Madera · Visalia | ${BRAND}`,
    desc: 'Permanent outdoor lighting installation across Fresno County, Madera County, Tulare County, Kings County, and San Luis Obispo County.',
    kw: 'permanent outdoor lighting service area',
    kicker: 'Coverage',
    lead: 'Locally installed across 12 cities and 4 counties in California\'s Central Valley.',
    body: `<section class="solutions container">
      ${sectionHead({ eyebrow: 'Service areas', h2: 'Locally installed across', em: 'the Central Valley.', intro: '12 cities, 4 counties, one in-house W-2 crew. Same-day response across Fresno County.' })}
      ${solutionsGrid(cities.map(c => ({
        h: `${c.name}, CA`,
        p: (c.intro || '').slice(0, 140),
        img: '/images/03-accent.jpg',
        alt: `${c.name} permanent outdoor lighting`,
        href: `/permanent-outdoor-lights-${c.slug}`,
        linkLabel: `${c.driveTime} min from Fresno`
      })))}
    </section>`
  }));
  // /commercial hub
  out.push(renderArticle({
    slug: 'commercial',
    h1: 'Commercial Permanent Lighting',
    title: `Commercial Permanent Outdoor Lighting | ${BRAND}`,
    desc: 'Commercial permanent outdoor lighting for restaurants, hotels, storefronts, HOAs, churches, dealerships, schools, offices, and event venues across the Central Valley.',
    kw: 'commercial permanent outdoor lighting',
    kicker: 'Commercial',
    lead: 'Multi-property accounts. Same-day SLA service. Single-invoice billing.',
    body: `<section class="solutions container">
      ${sectionHead({ eyebrow: 'Commercial verticals', h2: 'Lighting that', em: 'works your business.', intro: 'Restaurants, hotels, storefronts, HOAs, churches, dealerships, schools, offices, and event venues — same hardware, vertical-specific design.' })}
      ${solutionsGrid(verticals.map(v => ({ h: v.h1.split(' Installation')[0].split(' in ')[0], p: v.lead.slice(0, 140), img: v.image, alt: v.imageAlt || v.h1, href: `/${v.slug}`, linkLabel: `From ${usd(v.fromPrice)}` })))}
    </section>`
  }));
  // /compare hub
  out.push(renderArticle({
    slug: 'compare',
    h1: 'Permanent Lighting Comparisons',
    title: `Permanent Lighting Comparisons | ${BRAND}`,
    desc: 'Honest side-by-side comparisons — Jellyfish, Trimlight, Gemstone, EverLights, Oelo, Govee, seasonal hangs, DIY string lights, and more.',
    kw: 'permanent lighting comparison',
    kicker: 'Compare',
    lead: 'Twelve honest comparisons. We\'re a Jellyfish dealer — and we\'ll still tell you when something else fits better.',
    body: `<section class="solutions container">
      ${sectionHead({ eyebrow: 'Compare', h2: 'Twelve honest', em: 'comparisons.', intro: "We're a Jellyfish dealer — and we'll still tell you when something else fits better." })}
      ${solutionsGrid(comparisons.map(c => ({ h: c.competitor, p: c.lead.slice(0, 150), img: '/images/03-accent.jpg', alt: `${c.competitor} comparison`, href: `/${c.slug}`, linkLabel: 'Read comparison' })))}
    </section>`
  }));
  // /pricing
  out.push(renderArticle({
    slug: 'pricing',
    h1: 'Pricing: Permanent Outdoor Lighting',
    title: `Pricing | From $950 | ${BRAND}`,
    desc: 'Transparent published pricing. Starter from $950, Standard $2,800, Premium $5,800, Estate $7,500. Financing from $89/month at 0% APR.',
    kw: 'permanent outdoor lighting pricing',
    kicker: 'Transparent pricing',
    lead: 'Most installers won\'t publish numbers. We do.',
    img: pickPhotos('residential', 'pricing', 1)[0],
    body: statsCounters([
      { num: usd(shared.pricing.starterFrom), lab: 'Starter from' },
      { num: '0% APR', lab: '12-month financing' },
      { num: '60-day', lab: 'Money-back' },
      { num: 'Lifetime', lab: 'Track warranty' }
    ]) +
    `<section class="container price-tiers">
      ${sectionHead({ eyebrow: 'Tiers', h2: 'Four published', em: 'price points.', intro: 'No quote-only games. Every install lands in one of these four tiers — final price written on the spot after a free walk.' })}
      <div class="tier-grid">
        <div class="tier"><div class="tier-eyebrow">Single facade</div><h3>Starter</h3><p class="price">${usd(shared.pricing.starterFrom)}</p><p>~30 ft, single zone, full app control with all 16M colors, lifetime track warranty.</p><p class="tier-mo">${usd(shared.pricing.starterMonthly)}/mo at 0% APR</p></div>
        <div class="tier tier-popular"><div class="tier-eyebrow">Most popular</div><h3>Standard</h3><p class="price">${usd(shared.pricing.standardFrom)}</p><p>Full front + sides, ~80 ft, single story. Most Fresno homes land here.</p><p class="tier-mo">${usd(shared.pricing.standardMonthly)}/mo at 0% APR</p></div>
        <div class="tier"><div class="tier-eyebrow">Two-story</div><h3>Premium</h3><p class="price">${usd(shared.pricing.premiumFrom)}</p><p>Full perimeter, two-story home. Same hardware, more linear feet, more ladder time.</p><p class="tier-mo">${usd(shared.pricing.premiumMonthly)}/mo at 0% APR</p></div>
        <div class="tier"><div class="tier-eyebrow">Custom</div><h3>Estate</h3><p class="price">${usd(shared.pricing.estateFrom)}+</p><p>Multi-zone, complex rooflines, custom design. Built to your spec.</p><p class="tier-mo">Custom financing</p></div>
      </div>
    </section>` +
    installPhotoGrid({ category: 'residential', seed: 'pricing', kicker: 'Real installs by tier', h2: 'See what each', em: 'tier looks like.' }) +
    testimonialBlock(cities.find(c => c.slug === 'fresno'))
  }));
  // /quote
  out.push(renderArticle({
    slug: 'quote',
    h1: 'Get a Free Quote',
    title: `Free Quote | Permanent Outdoor Lighting | ${BRAND}`,
    desc: 'Free on-site estimate within 24 hours. Written, fixed pricing on the spot. From $950. 0% APR financing. 60-day money-back.',
    kw: 'permanent outdoor lighting quote',
    kicker: 'Free Quote',
    lead: 'Real quote in 24 hours. No phone-tag, no upsells, no surprises.',
    img: pickPhotos('residential', 'quote', 1)[0],
    body: `<section class="container quote-form-block">
      ${sectionHead({ eyebrow: 'Three ways to start', h2: 'Pick whichever', em: 'is easiest.', intro: 'Most quotes are scheduled within 24 hours. We measure, design, and write the price on the spot.' })}
      <div class="quote-options">
        <a href="tel:${TEL}" class="quote-option">
          <div class="quote-option-num">1</div>
          <h3>Call us</h3>
          <p class="quote-option-cta">${PHONE}</p>
          <p class="quote-option-detail">Live, 8am–6pm Mon–Fri · 9am–4pm Sat</p>
        </a>
        <a href="mailto:${shared.brand.email}" class="quote-option">
          <div class="quote-option-num">2</div>
          <h3>Email us</h3>
          <p class="quote-option-cta">${shared.brand.email}</p>
          <p class="quote-option-detail">Reply within one business hour</p>
        </a>
        <a href="/" class="quote-option">
          <div class="quote-option-num">3</div>
          <h3>Quick form</h3>
          <p class="quote-option-cta">Homepage form →</p>
          <p class="quote-option-detail">Name, phone, ZIP. 30 seconds.</p>
        </a>
      </div>
    </section>` +
    statsCounters([
      { num: '24 hr', lab: 'Quote turnaround' },
      { num: usd(shared.pricing.starterFrom), lab: 'Starts at' },
      { num: '0% APR', lab: 'Financing available' },
      { num: '$0', lab: 'On-site estimate fee' }
    ]) +
    processTimelineBlock({ kicker: 'After your quote', h2: 'What happens', em: 'next.', intro: 'From quote to lit-up roof in two weeks for most installs.' }) +
    testimonialBlock(cities.find(c => c.slug === 'fresno'))
  }));
  // /faq
  out.push(renderArticle({
    slug: 'faq',
    h1: 'FAQ: Permanent Outdoor Lighting',
    title: `FAQ | Permanent Outdoor Lighting | ${BRAND}`,
    desc: 'Answers to the most common questions about permanent outdoor lighting — cost, warranty, install time, HOA, weather, smart home, and more.',
    kw: 'permanent outdoor lighting faq',
    kicker: 'FAQ',
    lead: 'Everything we\'re asked, answered straight.',
    img: pickPhotos('residential', 'faq', 1)[0],
    body: `<section class="container article-body">
      ${sectionHead({ eyebrow: 'Frequently asked', h2: 'Plain-English answers,', em: `no asterisks.`, intro: `${shared.brand.installs}+ installs and ${shared.brand.reviews}+ reviews — these are the questions we hear most. If yours isn't here, call us at ${PHONE}.` })}
    </section>`,
    faqs: [
      { q: 'How much does permanent outdoor lighting cost?', a: `Starts at ${usd(shared.pricing.starterFrom)} for a Starter install. Most homes land ${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}. Two-story estates ${usd(shared.pricing.premiumFrom)}-${usd(shared.pricing.estateFrom)}+. Financing from ${usd(shared.pricing.standardMonthly)}/month at 0% APR.` },
      { q: 'How long does the install take?', a: 'Single-story homes finish in 6-8 hours. Two-story 1-2 days.' },
      { q: 'Are the lights visible during the day?', a: 'No. The aluminum track is color-matched to your trim and tucks under the eave. Essentially invisible from the curb.' },
      { q: 'What\'s the warranty?', a: `Lifetime on the aluminum track. 5 years on the LEDs. 5 years on workmanship. Plus our 60-day money-back guarantee.` },
      { q: 'Will the lights survive Fresno summers?', a: 'Yes. IP67 weather-rated, tested -40°F to 140°F. Engineered for 115°F+ Fresno summers.' },
      { q: 'Is permanent lighting HOA-approved?', a: 'Almost always. Most Fresno-area HOAs approve us on first submission. We provide spec sheets and 3D renderings at no charge.' },
      { q: 'Do you damage the roof or fascia?', a: 'No. Aluminum track is anchored with stainless screws into the soffit substructure — same anchoring as gutters. No damage to siding, stucco, shingles, or trim.' },
      { q: 'Can it do Halloween, July 4th, etc?', a: 'Yes. 200+ presets covering every holiday. Auto-schedule by date.' },
      { q: 'Does it work with Alexa, Google, Control4, Elan?', a: 'Yes — all four. Plus app control with 16 million colors and 200+ patterns.' },
      { q: 'Do you serve outside Fresno?', a: `Yes — Clovis, Madera, Visalia, Hanford, Selma, Sanger, Reedley, Kingsburg, Parlier, Fowler, Kerman, and across Madera, Tulare, Kings, and San Luis Obispo counties.` },
      { q: 'Are you a real Jellyfish dealer?', a: 'Yes. Authorized Jellyfish Lighting dealer for the Fresno area. California Lic. #1234567. Bonded. Insured.' },
      { q: 'Do you finance?', a: '0% APR for 12 months. $0 down. Soft credit pull, decision in 60 seconds.' }
    ]
  }));
  // Process / Reviews / Warranty / Guides hub
  out.push((() => {
    // HowTo schema — drives AI/LLM "how does install work" answers
    const howTo = {
      '@type': 'HowTo',
      name: 'How permanent outdoor lighting is installed',
      description: 'Five-step install process for permanent outdoor lighting from quote to walkthrough.',
      totalTime: 'PT8H',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: shared.pricing.standardFrom },
      tool: [
        { '@type': 'HowToTool', name: 'Aluminum LED track' },
        { '@type': 'HowToTool', name: 'RGBIC-RD LED strip' },
        { '@type': 'HowToTool', name: 'Weatherproof control box' },
        { '@type': 'HowToTool', name: 'Stainless steel screws' }
      ],
      step: [
        { '@type': 'HowToStep', name: 'Free quote in 24 hours', text: 'On-site walk to measure linear feet, identify ladder access, and propose track color. Written quote on the spot.' },
        { '@type': 'HowToStep', name: 'Design and track color', text: 'Match track to existing trim color (white, bronze, brown, or black). 3D rendering produced for HOA submission at no charge.' },
        { '@type': 'HowToStep', name: 'Install in a day', text: 'W-2 in-house crew installs the aluminum channel and LED strip. Single-story homes finish in 6 to 8 hours.' },
        { '@type': 'HowToStep', name: 'Wiring and control box', text: 'Concealed channel-routed wiring drops to attic. Weatherproof control box mounts in garage with surge protection inline.' },
        { '@type': 'HowToStep', name: 'App pairing and walkthrough', text: 'Controller paired with home Wi-Fi. Homeowner trained on scenes, schedules, and smart-home integration before crew leaves.' }
      ]
    };
    return renderArticle({
      slug: 'process',
      h1: 'Our Install Process',
      title: `Install Process | ${BRAND}`,
      desc: 'Five-step install process for permanent outdoor lighting — quote, design, install, app setup, walkthrough.',
      kw: 'permanent lighting install process', kicker: 'How it works', lead: 'Five steps. One day on site for most homes.',
      img: pickPhotos('residential', 'process', 1)[0],
      extraSchema: [howTo],
      body: processTimelineBlock({ kicker: 'How it works', h2: 'Five steps,', em: 'one day on site.', intro: 'Free quote, design, install, app setup, walkthrough. Most homes finished by sundown.' }) +
      installPhotoGrid({ category: 'residential', seed: 'process', kicker: 'Recent installs', h2: 'What it looks', em: 'like when it ships.' }) +
      testimonialBlock(cities.find(c => c.slug === 'fresno'))
    });
  })());
  out.push(renderArticle({
    slug: 'reviews',
    h1: `${shared.brand.reviews}+ Reviews at ${shared.brand.rating}★`,
    title: `Reviews | ${shared.brand.rating} Stars | ${BRAND}`,
    desc: `${shared.brand.reviews}+ Google reviews at ${shared.brand.rating} stars. Real feedback from real Central Valley homeowners.`,
    kw: 'twilight zone lighting reviews', kicker: 'Reviews', lead: `${shared.brand.reviews}+ reviews at ${shared.brand.rating}★ on Google.`,
    img: pickPhotos('residential', 'reviews', 1)[0],
    body: statsCounters([
      { num: `${shared.brand.rating}★`, lab: 'Google rating' },
      { num: `${shared.brand.reviews}+`, lab: 'Reviews' },
      { num: shared.brand.installs.toLocaleString(), lab: 'Installs' },
      { num: '0', lab: 'Subcontractors' }
    ]) +
    `<section class="container review-grid">
      ${sectionHead({ eyebrow: 'In their words', h2: 'Real homeowners,', em: 'real reviews.' })}
      <div class="review-cards">${cities.slice(0, 9).map(c => `<div class="review-card"><div class="stars">★★★★★</div><p>"${esc(c.testimonialQuote)}"</p><cite>— ${esc(c.testimonialName)}, ${esc(c.name)}</cite></div>`).join('')}</div>
    </section>` +
    installPhotoGrid({ category: 'residential', seed: 'reviews', kicker: 'The work behind the reviews', h2: 'Real installs.', em: 'Real homes.' })
  }));
  out.push(renderArticle({
    slug: 'warranty',
    h1: 'Lifetime Track Warranty',
    title: `Warranty | Lifetime Track | 5-Year LED | ${BRAND}`,
    desc: 'Lifetime warranty on the aluminum track. 5 years on LEDs. 5 years on workmanship. 60-day money-back guarantee.',
    kw: 'permanent lighting warranty', kicker: 'Warranty', lead: 'Track is for life. LEDs for five years. Money back for sixty days.',
    body: `<section class="container"><h2>What's covered</h2><ul>
      <li><strong>Aluminum track:</strong> Lifetime — replaced at no cost if it fails.</li>
      <li><strong>LEDs:</strong> 5-year manufacturer warranty.</li>
      <li><strong>Workmanship:</strong> 5 years on our install.</li>
      <li><strong>60-day money-back:</strong> Pulled and refunded in full. No fine print.</li>
    </ul></section>`
  }));
  out.push(renderArticle({
    slug: 'guides',
    h1: 'Buyer Guides & How-Tos',
    title: `Buyer Guides | Permanent Outdoor Lighting | ${BRAND}`,
    desc: 'Plain-English guides — comparing brands, choosing tier, HOA approval, install process, smart-home integration, and more.',
    kw: 'permanent outdoor lighting guides', kicker: 'Guides', lead: 'Twelve guides covering every decision.',
    body: `<section class="container"><p>Browse our buyer and owner guides:</p><ul class="link-list">
      ${[
        ['/guide-best-permanent-lights','Best permanent outdoor lights 2026'],
        ['/guide-permanent-vs-seasonal','Permanent vs seasonal hangs'],
        ['/guide-jellyfish-lighting','What is Jellyfish Lighting?'],
        ['/guide-rgbic-vs-rgb','RGBIC vs RGB explained'],
        ['/guide-hoa-approval','HOA approval guide'],
        ['/guide-installation-process','What to expect on install day'],
        ['/guide-warranty-explained','Warranty explained'],
        ['/guide-app-control','App control walkthrough'],
        ['/guide-smart-home','Control4, Elan, Alexa, Google'],
        ['/guide-led-track-types','Track types explained'],
        ['/guide-cleaning-care','Care and cleaning'],
        ['/guide-removal-process','Removal & refund process']
      ].map(([h,t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}
    </ul></section>`
  }));
  // Privacy, Terms, Sitemap (HTML)
  out.push(renderArticle({
    slug: 'privacy', h1: 'Privacy Policy', title: `Privacy Policy | ${BRAND}`,
    desc: 'How we collect, use, and protect your data.', kw: 'privacy policy', kicker: 'Legal', lead: 'Plain-English privacy policy.',
    body: `<section class="container article-body"><h2>What we collect</h2><p>Name, address, phone, and email when you request a quote. Cookies for anonymized analytics. That's it.</p><h2>How we use it</h2><p>To respond to quotes and service calls. We never sell or share customer data.</p><h2>Contact</h2><p>Questions: <a href="mailto:${shared.brand.email}">${shared.brand.email}</a></p></section>`
  }));
  out.push(renderArticle({
    slug: 'terms', h1: 'Terms of Service', title: `Terms of Service | ${BRAND}`,
    desc: 'Standard terms of service.', kw: 'terms of service', kicker: 'Legal', lead: 'Standard terms of service.',
    body: `<section class="container article-body"><p>Service agreements, warranty terms, and liability limitations are detailed in your written estimate and install contract. By engaging our services you agree to those terms.</p></section>`
  }));
  out.push(renderArticle({
    slug: 'sitemap', h1: 'Sitemap', title: `Sitemap | ${BRAND}`,
    desc: 'All pages on this website.', kw: 'sitemap', kicker: 'Index', lead: 'Every page on this site.',
    body: `<section class="container article-body"><h2>Main</h2><ul><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li><a href="/service-areas">Service Areas</a></li><li><a href="/commercial">Commercial</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/compare">Compare</a></li><li><a href="/quote">Free Quote</a></li><li><a href="/faq">FAQ</a></li><li><a href="/guides">Guides</a></li><li><a href="/reviews">Reviews</a></li></ul>
    <h2>Services</h2><ul>${services.map(s => `<li><a href="/${s.slug}">${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</a></li>`).join('')}</ul>
    <h2>Cities</h2><ul>${cities.map(c => `<li><a href="/permanent-outdoor-lights-${c.slug}">${esc(c.name)}</a></li>`).join('')}</ul>
    <h2>Commercial</h2><ul>${verticals.map(v => `<li><a href="/${v.slug}">${esc(v.h1.split(' Installation')[0].split(' in ')[0])}</a></li>`).join('')}</ul>
    <h2>Comparisons</h2><ul>${comparisons.map(c => `<li><a href="/${c.slug}">${esc(c.competitor)}</a></li>`).join('')}</ul>
    </section>`
  }));
  return out;
}

// ---------- NEIGHBORHOOD PAGES ----------
function buildNeighborhoods() {
  const out = [];
  cities.slice(0, 6).forEach(c => {
    c.neighborhoods.slice(0, 2).forEach(n => {
      const nslug = slugify(n);
      const seed = `${c.slug}-${nslug}`;
      const heroImg = pickPhotos('residential', seed, 1)[0];
      out.push(renderArticle({
        slug: `permanent-outdoor-lights-${c.slug}-${nslug}`,
        h1: `Permanent Outdoor Lighting in ${n}, ${c.name}`,
        title: `Permanent Outdoor Lights ${n} ${c.name} CA | ${BRAND}`,
        desc: `Permanent outdoor lighting installer for ${n} in ${c.name}, CA. From $950. Lifetime warranty. ${shared.brand.installs}+ Central Valley installs.`,
        kw: `permanent outdoor lights ${n.toLowerCase()} ${c.name.toLowerCase()}`,
        kicker: `${c.name} · Neighborhood`,
        parent: { name: c.name, url: `/permanent-outdoor-lights-${c.slug}` },
        lead: `Local installer for ${n} homeowners — same crew that runs all of ${c.name}.`,
        img: heroImg,
        body: `<section class="container article-body">
          ${sectionHead({ eyebrow: `${n}, ${c.name}`, h2: `About`, em: n + '.', intro: `${n} is one of ${c.name}'s established neighborhoods. We've installed permanent outdoor lighting across ${n} and the surrounding ${c.neighborhoods.slice(0, 4).join(', ')} corridor. Drive time from our Fresno shop is roughly ${c.driveTime} minutes.` })}
          <h2>What ${esc(n)} homes typically run</h2>
          <p>Most ${esc(n)} single-story homes land Standard tier (${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}). Two-story homes Premium tier (${usd(shared.pricing.premiumFrom)}-${usd(shared.pricing.estateFrom)}). Tract starter homes can come in at Starter (${usd(shared.pricing.starterFrom)}).</p>
          <h2>Why local matters</h2>
          <p>If something goes sideways in year four, you call us — not a 1-800 number. W-2 crew, in-house, California Lic. #${shared.brand.license}.</p>
        </section>` +
        installPhotoGrid({ category: 'residential', seed, kicker: `${n} portfolio`, h2: 'Recent', em: `${n} installs.` }) +
        `<section class="solutions container">
          ${sectionHead({ eyebrow: `${n} · ${c.name}`, h2: 'Services available', em: `in ${n}.` })}
          ${solutionsGrid(services.slice(0, 6).map(s => ({ h: s.h1.split(' Installation')[0].split(' in ')[0], p: s.lead.slice(0, 110), img: pickPhotos(SERVICE_PHOTO_MAP[s.slug] || 'residential', s.slug + seed, 1)[0], alt: s.imageAlt || s.h1, href: `/${s.slug}-${c.slug}`, linkLabel: `From ${usd(s.fromPrice)}` })))}
        </section>` +
        testimonialBlock(c, pickPhotos('residential', seed + 't', 1)[0]),
        faqs: [
          { q: `Do you serve ${n}?`, a: `Yes — ${n} and the surrounding ${c.name} neighborhoods. Same W-2 crew, no subs.` },
          { q: `How fast can you get to ${n}?`, a: `${c.driveTime} minutes from our Fresno shop. Same-day service in most cases.` }
        ]
      }));
    });
  });
  return out;
}

// ---------- GALLERIES / USE-CASE PAGES ----------
// ---------- TIER B: Exact-match brand pages ----------
// Each page targets a specific Low-competition keyword from Google Keyword Planner
// data. Original commentary on publicly-known competitor brands, with honest
// comparison + lead-capture CTA.
function buildBrandPages() {
  const out = [];
  const fresno = cities.find(c => c.slug === 'fresno');
  const heroImgFor = (seed) => pickPhotos('residential', seed, 1)[0];

  const brandPages = [
    {
      slug: 'oelo-lights',
      h1: 'Oelo Lights: Honest Brand Guide for Fresno Homeowners',
      title: 'Oelo Lights | Brand Guide & Twilight Zone Comparison',
      desc: 'Oelo Lights is one of the longer-running permanent outdoor lighting brands. Here is what the system is, what it costs, and how it compares to a Jellyfish install from Twilight Zone in Fresno.',
      kw: 'oelo lights',
      kicker: 'Brand guide',
      lead: 'Oelo has been in permanent outdoor lighting longer than most brands you have heard of. Here is the honest breakdown.',
      bodyParas: [
        'Oelo Lights manufactures permanent outdoor lighting tracks that mount under the eaves of a home. The system uses individually-addressable RGB LEDs, an aluminum channel, and an app-based controller. The brand has roots in the early 2010s, which means a longer real-world track record than newer entrants — but also older hardware generations on some installs.',
        'For Fresno County homeowners weighing Oelo against newer options, the practical questions are pixel density, app polish, install crew quality, and warranty terms. Oelo is a legitimate professional system. Whether it is the right system for your home depends mostly on which authorized installer you can actually book locally.',
        'We are an authorized Jellyfish dealer, not Oelo. So this is not a sales page — it is a fair-comparison page for homeowners trying to choose. The short version: both systems work. The Jellyfish RGBIC-RD chip we install has a slightly finer pixel pitch and a more polished current-generation app. Oelo has a longer install track record. Locally, the answer is whoever can show up faster and back it with a real warranty.'
      ],
      faqs: [
        { q: 'Does Twilight Zone install Oelo?', a: 'No. We are the authorized Jellyfish dealer for the Fresno area. We can install Jellyfish RGBIC-RD systems with the same warranty backing.' },
        { q: 'Is Oelo better than Jellyfish?', a: 'Oelo is older and more proven over time. Jellyfish has finer pixel density and a more refined app. For most homeowners the difference is marginal — installer quality and local response time matter more than the brand badge.' },
        { q: 'How much does Oelo cost vs our installs?', a: 'Pricing is roughly comparable: $2,800 to $7,500 for typical residential installs. Our published pricing starts at $950 for a Starter and tops out around $7,500 for Estate.' }
      ]
    },
    {
      slug: 'gemstone-permanent-lights',
      h1: 'Gemstone Permanent Lights: What They Are & How They Compare',
      title: 'Gemstone Permanent Lights | Honest Comparison',
      desc: 'Gemstone Permanent Lights explained — what the system is, what it costs, and how it compares to professionally-installed Jellyfish RGBIC-RD lighting from Twilight Zone in Fresno County.',
      kw: 'gemstone permanent lights',
      kicker: 'Brand guide',
      lead: 'Gemstone has visible track. Jellyfish hides it. Both work — the difference shows in daylight.',
      bodyParas: [
        'Gemstone Permanent Lights is a Canadian-rooted permanent outdoor lighting brand with strong dealer presence in the Mountain West and parts of the Central Valley. The system uses individually-controlled RGBIC LEDs in a track that runs under the eave or along architectural trim.',
        'Where Gemstone visually differs: the track profile sits slightly more visible during the day than the Jellyfish RGBIC-RD aluminum channel we install, which color-matches your trim and tucks tighter under the soffit. Whether that matters is a curb-appeal question — both systems essentially disappear from forty feet away, but inspection from the driveway tells a different story.',
        'On the technology side, Gemstone is a current-generation system with a competent app and 100+ presets. Jellyfish RGBIC-RD has slightly finer pixel pitch (better gradients), 200+ presets, and integrates with Control4 and Nice Elan. For homeowners with a smart home, that integration is the deciding factor.',
        'Honest summary: if Gemstone has a great local installer near you, it is a real option. In Fresno, we install Jellyfish, full lifetime track warranty, 5-year LED, 60-day money-back. Pick whichever you can hold accountable in year four.'
      ],
      faqs: [
        { q: 'Is Gemstone better than Jellyfish?', a: 'Different trade-offs. Gemstone has a longer track record. Jellyfish has finer pixel density and broader smart-home integration. Locally, installer quality decides which is better for your house.' },
        { q: 'Can you install Gemstone?', a: 'No. We are an authorized Jellyfish dealer. We can install Jellyfish RGBIC-RD with full warranty.' }
      ]
    },
    {
      slug: 'minleon-permanent-lighting',
      h1: 'Minleon Permanent Lighting: What You Are Getting',
      title: 'Minleon Permanent Lighting | Brand Explained',
      desc: 'Minleon makes high-end pixel lighting controllers and LED strings used by professional Christmas-light pros. Here is what Minleon permanent lighting actually is, who installs it, and how it compares to consumer-facing Jellyfish.',
      kw: 'minleon permanent lighting',
      kicker: 'Brand guide',
      lead: 'Minleon is the gear behind a lot of the high-end displays you see — and now it is starting to show up in permanent residential installs.',
      bodyParas: [
        'Minleon is a US-based manufacturer that has supplied controllers and pixel-string LEDs to professional Christmas-light installers for over a decade. Their hardware powers many of the most elaborate residential and commercial holiday displays in the country, often programmed to music with thousands of individually-addressable pixels.',
        'In recent years some installers have used Minleon components to build year-round permanent outdoor lighting systems — essentially repurposing the same controller and pixel-string hardware in a permanent track. The result is a system with more raw control flexibility than off-the-shelf consumer brands, but with a steeper learning curve and an installer-dependent app experience.',
        'For most homeowners in Fresno, a turnkey system like Jellyfish RGBIC-RD (which we install) is going to be easier to live with day to day. Minleon shines when you have a perfectionist installer programming custom shows and you actually use that capability. Different audiences, different fits.'
      ],
      faqs: [
        { q: 'Is Minleon Permanent Lighting a brand or a parts supplier?', a: 'Minleon is primarily a parts manufacturer. The "brand" of the install you see is usually the local installer who built it on Minleon hardware.' },
        { q: 'Should I get Minleon or Jellyfish?', a: 'For most residential homeowners: Jellyfish — turnkey, polished app, broad dealer support. For show-driven music-sync displays: Minleon, if you have an installer who specializes.' }
      ]
    },
    {
      slug: 'minleon-permanent-lights',
      h1: 'Minleon Permanent Lights: A Plain-English Explanation',
      title: 'Minleon Permanent Lights | What They Are',
      desc: 'Minleon permanent lights explained: where the hardware comes from, who installs it, and how it differs from off-the-shelf consumer permanent lighting brands.',
      kw: 'minleon permanent lights',
      kicker: 'Brand guide',
      lead: 'Same hardware, different install philosophy than the consumer brands.',
      bodyParas: [
        'Minleon permanent lights are not a single brand-name product — they are a class of installs built on Minleon-made controllers and LED pixel strings. Minleon is a long-standing supplier to high-end Christmas-light professionals, and the same controllers that power national TV-feature holiday displays can be repurposed into permanent residential systems.',
        'For a typical Fresno homeowner, the practical question is whether your installer can support Minleon hardware year over year. Off-the-shelf brands like Jellyfish ship with a polished consumer app and a global support stack. Minleon installs depend more on the local installer for app updates, scene programming, and warranty claims.',
        'We install Jellyfish RGBIC-RD because the consumer experience is more predictable — the app does not require a programmer, the warranty is centralized, and replacement parts are stocked nationally. If you want music-sync show-grade flexibility, Minleon is interesting. For everyone else, the simpler system wins.'
      ],
      faqs: [
        { q: 'Are Minleon permanent lights worth more than Jellyfish?', a: 'Only if you actually use the show-programming capability. For 95% of homeowners, the simpler turnkey system wins on day-to-day use.' }
      ]
    },
    {
      slug: 'trimlight-permanent-lights',
      h1: 'Trimlight Permanent Lights: Comparison & Honest Take',
      title: 'Trimlight Permanent Lights vs Jellyfish | 2026 Comparison',
      desc: 'Trimlight permanent lights compared to professionally-installed Jellyfish RGBIC-RD from Twilight Zone in Fresno. Hardware generation, app polish, warranty, and install support.',
      kw: 'trimlight permanent lights',
      kicker: 'Brand comparison',
      lead: 'Trimlight has the longer track record. Jellyfish has the newer hardware. Both are real systems.',
      bodyParas: [
        'Trimlight is one of the more established permanent outdoor lighting brands, with dealer presence in most US metros. The system uses individually-addressable RGB LEDs in an aluminum channel, mounted under the eave or along architectural lines, controlled by an app.',
        'On hardware: Trimlight is a mature, well-understood platform. Jellyfish RGBIC-RD (what we install) is a newer chip generation with finer pixel pitch — meaning gradients and pixel-by-pixel animations look smoother. The visual difference is subtle on solid colors and obvious on flowing patterns.',
        'On app: Jellyfish ships with a more current-generation interface and a larger preset library. Trimlight is functional and stable but feels a generation behind in UX.',
        'On warranty: Jellyfish offers lifetime track warranty plus a 5-year LED warranty. Trimlight typically offers lifetime track plus 3-year LED. Two extra years on the LEDs is roughly 300 dollars of value over the system lifespan.',
        'Locally in Fresno, both have authorized dealers. We are the Jellyfish dealer. The honest answer: pick the dealer you trust to be there in year four when something needs service.'
      ],
      faqs: [
        { q: 'Is Trimlight cheaper than Jellyfish?', a: 'About 5 to 15 percent cheaper at the hardware level. Installed cost is comparable once you account for installer labor.' },
        { q: 'Can you service Trimlight if I already have it?', a: 'We can do basic re-tightening and Wi-Fi reset for any aluminum-track system. Warranty claims need to go through your original Trimlight dealer.' }
      ]
    },
    {
      slug: 'govee-permanent-outdoor-lights-installation',
      h1: 'Govee Permanent Outdoor Lights Installation: DIY vs Hiring a Pro',
      title: 'Govee Permanent Outdoor Lights Installation | DIY Guide & Pro Comparison',
      desc: 'Govee permanent outdoor lights installation walkthrough — DIY approach, common pitfalls, and when hiring a pro installer makes more sense for Fresno homeowners.',
      kw: 'govee permanent outdoor lights installation',
      kicker: 'Installation guide',
      lead: 'Govee is the most popular DIY permanent lighting kit. Here is the honest install reality.',
      bodyParas: [
        'Govee Permanent Outdoor Lights are a consumer-grade RGBIC LED system designed for DIY installation. The kit ships with the LED string, mounting clips, controller, and a Wi-Fi app. For a single-story home with accessible eaves, a careful homeowner can install the front facade in a weekend.',
        'Common install pitfalls: visible cable runs that did not get tucked into the soffit, clip spacing too wide, controller mounted in a spot that loses Wi-Fi, and connector ends that water-damage in the first heavy rain. None of these are unfixable but each one shows.',
        'When DIY makes sense: single-story home, ground-level access via standard ladder, budget under 700 dollars, and you genuinely enjoy ladder work. When hiring a pro makes more sense: two-story home, complex roofline, you want the track invisible during the day, you want a long warranty, and you want one phone number to call when something fails.',
        'Our pro install starts at $950 fully installed using Jellyfish RGBIC-RD aluminum track — color-matched to your trim, concealed wiring, lifetime track warranty. By the time a homeowner accounts for the value of their own time and the visible-cable trade-off, the gap between DIY Govee and a pro Starter install is smaller than it looks on paper.'
      ],
      faqs: [
        { q: 'Will you install Govee for me?', a: 'We focus on professional Jellyfish installs. We do not subcontract Govee jobs — the warranty mismatch is not fair to you.' },
        { q: 'How long does Govee installation take DIY?', a: 'A single facade typically takes 4 to 8 hours for a confident DIYer. A whole-home install spans a weekend or two for most homeowners.' }
      ]
    },
    {
      slug: 'govee-permanent-house-lights',
      h1: 'Govee Permanent House Lights: Real Pros & Cons',
      title: 'Govee Permanent House Lights | Honest Review & Pro Alternative',
      desc: 'Govee permanent house lights explained — what the kit gets right, what it does not, and how the DIY consumer system compares to a professionally-installed Jellyfish system in Fresno County.',
      kw: 'govee permanent house lights',
      kicker: 'Brand review',
      lead: 'Govee built the most accessible permanent lighting kit on the market. Here is what that buys you.',
      bodyParas: [
        'Govee Permanent House Lights are a DIY-friendly RGBIC permanent outdoor lighting kit aimed at homeowners who want the look of a pro install without the pro installer. The system uses individually-addressable RGB LEDs, an external Wi-Fi controller, and a polished consumer app with hundreds of preset patterns.',
        'What Govee gets right: price (typically 400 to 700 dollars for a full kit), ease of programming, decent IP65 weather rating, and a large user community sharing scene presets online. For a single-story Fresno home, the visual outcome at night can rival professional installs.',
        'Where Govee falls short: the cable is more visible by day than aluminum-track systems, the IP65 rating is a step below IP67 for very wet weather, the LED rated lifespan is about half that of pro-grade chips, and the warranty caps at 1 to 2 years vs lifetime track on pro systems.',
        'The five-year math is what changes minds. A Govee kit at 600 dollars plus likely one or two replacement runs over five years lands at 1,200 to 1,800 dollars total. A pro Jellyfish Starter install at 950 dollars all-in, lifetime track warranty, lasts the same five years and beyond. Govee wins year one. Pro wins year four.'
      ],
      faqs: [
        { q: 'Are Govee permanent house lights worth it?', a: 'For a single-story home, modest budget, and a homeowner who likes DIY: yes. For two-story homes, complex rooflines, or anyone who wants set-and-forget reliability: pro install wins on five-year cost.' }
      ]
    },
    {
      slug: 'govee-permanent-outdoor-house-lights',
      h1: 'Govee Permanent Outdoor House Lights: Outdoor Use Cases',
      title: 'Govee Permanent Outdoor House Lights | Outdoor Use Cases & Limits',
      desc: 'Govee permanent outdoor house lights — what they handle well outdoors, where the IP65 rating starts to limit use, and when to step up to a IP67 pro system in Fresno.',
      kw: 'govee permanent outdoor house lights',
      kicker: 'Outdoor use guide',
      lead: 'IP65 covers most outdoor scenarios. The remaining 10 percent is where pro hardware pays for itself.',
      bodyParas: [
        'Govee Permanent Outdoor House Lights are rated IP65 — dust-tight against sand and dry debris, and water-resistant against splashes and rain from any direction. For most Fresno homeowners that envelope is fine: summers are dry, winters bring tule fog and the occasional rain but rarely standing water.',
        'Where IP65 starts to limit use: pool decks where lights sit close to splashing water, patios with permanent sprinkler overspray, and any install location prone to direct hose pressure during seasonal cleaning. The aluminum-track Jellyfish system we install is rated IP67 (submersible to one meter for thirty minutes) which removes those limits entirely.',
        'On temperature: Govee is rated 14F to 122F operating. Fresno summer roof surfaces in direct sun routinely exceed 130F. Most installs are under the eave in shade, so this rarely surfaces — but it is the kind of edge case where pro-rated -40F to 140F hardware earns its keep over decades.',
        'Bottom line for outdoor use: Govee is genuinely competent in most Fresno conditions. The pro upgrade matters when you want to never think about it again.'
      ],
      faqs: [
        { q: 'Will Govee outdoor lights survive Fresno summer heat?', a: 'In shaded under-eave installs, generally yes. In direct sun on a black roofline, the rated envelope gets close to its ceiling. Pro-rated hardware has more margin.' }
      ]
    }
  ];

  brandPages.forEach(p => {
    const slug = p.slug;
    const canonical = `/${slug}`;
    const crumbs = [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: p.h1, url: canonical }];
    const heroImg = heroImgFor(slug);
    const jsonld = [
      breadcrumbs(crumbs),
      { '@context': 'https://schema.org', '@type': 'Article', headline: p.h1, description: p.desc, author: { '@type': 'Organization', name: BRAND }, publisher: { '@type': 'Organization', name: BRAND }, datePublished: '2026-03-15' },
      faqLD(p.faqs)
    ];
    const html = head({ title: p.title, desc: p.desc, canonical, kw: p.kw, ogImg: heroImg, jsonld }) +
      headerHTML(canonical) +
      `<main>` +
      breadcrumbBlock(crumbs) +
      heroBlock({ kicker: p.kicker, h1: p.h1, lead: p.lead, img: heroImg }) +
      trustBar() +
      `<section class="container article-body">
        ${p.bodyParas.map((para, i) => i === 0 ? `<p class="lead-para">${esc(para)}</p>` : `<p>${esc(para)}</p>`).join('')}
      </section>` +
      testimonialBlock(fresno, pickPhotos('residential', slug + 't', 1)[0]) +
      faqBlock(p.faqs) +
      ctaBlock() +
      `</main>` + footerHTML();
    out.push({ url: canonical, html });
  });

  return out;
}

function buildGalleries() {
  const out = [];
  const galleries = [
    { slug: 'gallery-christmas', cat: 'holiday', h1: 'Christmas Lighting Gallery', desc: 'Real installs — permanent Christmas lights across Fresno, Clovis, Madera, Visalia.', kw: 'permanent christmas lights gallery' },
    { slug: 'gallery-halloween', cat: 'holiday', h1: 'Halloween Lighting Gallery', desc: 'Permanent Halloween lighting installs — orange, purple, motion-triggered.', kw: 'permanent halloween lights gallery' },
    { slug: 'gallery-game-day', cat: 'gameday', h1: 'Game Day Lighting Gallery', desc: 'Team-color lighting installs — Bulldogs, Lakers, Warriors, Dodgers, 49ers.', kw: 'game day lighting gallery' },
    { slug: 'gallery-architectural', cat: 'accent', h1: 'Architectural Accent Lighting Gallery', desc: 'Warm-white architectural lighting installs across the Central Valley.', kw: 'architectural accent lighting gallery' },
    { slug: 'gallery-two-story', cat: 'residential', h1: 'Two-Story Home Lighting Gallery', desc: 'Two-story permanent lighting installs in Fresno County.', kw: 'two story permanent lights gallery' },
    { slug: 'gallery-modern-homes', cat: 'residential', h1: 'Modern Home Lighting Gallery', desc: 'Permanent lighting on modern Central Valley homes — clean lines, hidden track.', kw: 'modern home permanent lights' },
    { slug: 'gallery-ranch-homes', cat: 'residential', h1: 'Ranch Home Lighting Gallery', desc: 'Single-story ranch home permanent lighting installs.', kw: 'ranch home permanent lights' },
    { slug: 'gallery-commercial', cat: 'commercial', h1: 'Commercial Lighting Gallery', desc: 'Restaurants, hotels, storefronts, and HOAs across the Central Valley.', kw: 'commercial permanent lighting gallery' },
    { slug: 'gallery-restaurants', cat: 'restaurant', h1: 'Restaurant Lighting Gallery', desc: 'Restaurant exterior lighting installs across Fresno, Clovis, Visalia.', kw: 'restaurant lighting gallery' },
    { slug: 'gallery-hoa', cat: 'residential', h1: 'HOA Lighting Gallery', desc: 'HOA and apartment community permanent lighting installs.', kw: 'hoa permanent lighting gallery' },
    { slug: 'gallery-before-after', cat: 'residential', h1: 'Before & After Gallery', desc: 'Before-and-after photos of permanent outdoor lighting installs.', kw: 'permanent lights before after' },
    { slug: 'gallery-day-night', cat: 'residential', h1: 'Day & Night Gallery', desc: 'See exactly how invisible the track is by day — and how dramatic at night.', kw: 'permanent lights day night' }
  ];
  galleries.forEach(g => {
    // 9 photos for the gallery — full pool of category, padded with adjacent categories if short
    const primary = pickPhotos(g.cat, g.slug, Math.min(9, ASSETS[g.cat].length));
    const secondary = pickPhotos(g.cat === 'gameday' ? 'residential' : 'gameday', g.slug + 'b', 9 - primary.length);
    const pics = [...primary, ...secondary].slice(0, 9);
    const heroImg = pics[0];
    out.push(renderArticle({
      slug: g.slug, h1: g.h1, title: `${g.h1} | ${BRAND}`,
      desc: g.desc, kw: g.kw, kicker: 'Gallery',
      parent: { name: 'Galleries', url: '/galleries' },
      lead: g.desc,
      img: heroImg,
      body: `<section class="container gallery-grid">
        ${sectionHead({ eyebrow: g.h1.replace(' Gallery', ''), h2: 'Lit. Photographed.', em: 'Yours next.', intro: `Real installs from our ${shared.brand.installs}+ portfolio.` })}
        <div class="gallery-photos">
          ${pics.map((p, i) => `<figure class="gallery-photo${i === 0 ? ' gallery-photo-feature' : ''}"><img src="${p}" alt="${esc(g.h1)} — install ${i + 1}" loading="${i < 3 ? 'eager' : 'lazy'}" /></figure>`).join('')}
        </div>
      </section>
      <section class="container article-body">
        ${sectionHead({ eyebrow: 'Want this look?', h2: 'Free quote in', em: '24 hours.', intro: `We measure, design, and price in writing on the spot. From ${usd(shared.pricing.starterFrom)}. Lifetime track warranty. 60-day money-back guarantee.` })}
      </section>`
    }));
  });
  // Index
  out.push(renderArticle({
    slug: 'galleries', h1: 'Gallery: Real Installs',
    title: `Gallery | Real Permanent Lighting Installs | ${BRAND}`,
    desc: 'Real installs across Fresno County. Christmas, Halloween, game day, architectural, commercial, before/after.',
    kw: 'permanent outdoor lighting gallery', kicker: 'Galleries',
    lead: `${shared.brand.installs}+ installs across the Central Valley.`,
    img: pickPhotos('residential', 'galleries', 1)[0],
    body: `<section class="solutions container">
      ${sectionHead({ eyebrow: 'Galleries', h2: 'Real installs across', em: 'the Central Valley.', intro: `${shared.brand.installs}+ installs. Pick a category, see the work.` })}
      ${solutionsGrid(galleries.map((g) => ({ h: g.h1.replace(' Gallery', ''), p: g.desc.slice(0, 130), img: pickPhotos(g.cat, g.slug, 1)[0], alt: g.h1, href: `/${g.slug}`, linkLabel: 'View gallery' })))}
    </section>`
  }));
  return out;
}

// ============================================================
// WRITE PAGES
// ============================================================
console.log(`Generating ${pages.length} pages...`);
const writtenUrls = new Set(['/']);
let written = 0, skipped = 0;
pages.forEach(p => {
  if (writtenUrls.has(p.url)) { skipped++; return; }
  writePage(p.url, p.html);
  writtenUrls.add(p.url);
  written++;
});
console.log(`✓ Wrote ${written} pages (${skipped} duplicates skipped)`);

// ============================================================
// SITEMAP.XML — with lastmod, image sitemap extension
// ============================================================
const today = new Date().toISOString().split('T')[0];
const allUrls = ['/'].concat(Array.from(writtenUrls).filter(u => u !== '/'));
const priorityFor = (u) => {
  if (u === '/') return '1.0';
  if (/^\/(services|service-areas|commercial|pricing|quote|compare|blog|galleries|faq)$/.test(u)) return '0.9';
  if (/^\/(permanent-outdoor-lights-|cost-)/.test(u)) return '0.85';
  if (u.startsWith('/blog/')) return '0.7';
  if (u.startsWith('/gallery-')) return '0.6';
  return '0.8';
};
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priorityFor(u)}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(`✓ Wrote sitemap.xml (${allUrls.length} urls, lastmod ${today})`);

// ============================================================
// 404.HTML — custom not-found page (Vercel uses /404.html automatically)
// ============================================================
const notFoundHTML = head({
  title: `Page Not Found | ${BRAND}`,
  desc: 'The page you tried to reach is no longer here. Find what you need from the links below or call us directly.',
  canonical: '/404',
  jsonld: []
}) + headerHTML('/404') +
`<main>
  <section class="hero hero-sub" id="top" aria-label="404">
    <div class="hero-media">
      <img class="ken-burns" src="/images/03-accent.jpg" alt="" loading="eager" />
      <div class="hero-vignette"></div>
      <div class="hero-grain"></div>
      <div class="hero-glow"></div>
    </div>
    <div class="hero-content">
      <div class="hero-eyebrow">404 · Page not found</div>
      <h1 class="hero-title">
        <span class="hero-line-1">This page</span>
        <span class="hero-line-2"><em>went dark.</em></span>
        <span class="hero-line-3">Let's find what you need.</span>
      </h1>
      <p class="hero-est">The address you tried doesn't exist on this site. Try one of the links below — or call us directly and we'll point you the right way.</p>
      <div class="hero-actions">
        <a href="/" class="btn btn-primary">Back to homepage</a>
        <a href="tel:${TEL}" class="btn btn-text">${PHONE}</a>
      </div>
    </div>
  </section>` +
  trustBar() +
  `<section class="solutions container">
    ${sectionHead({ eyebrow: 'Try these instead', h2: 'Most-visited', em: 'pages.' })}
    ${solutionsGrid([
      { h: 'Pricing', p: 'Transparent published pricing. Starter from $950. Most homes $2,800-$5,800.', img: '/images/03-accent.jpg', alt: 'Pricing', href: '/pricing', linkLabel: 'See pricing' },
      { h: 'Services', p: 'Christmas, Halloween, accent, security, game-day, year-round.', img: '/images/04-holiday.jpg', alt: 'Services', href: '/services', linkLabel: 'All services' },
      { h: 'Service areas', p: 'Locally installed across Fresno, Clovis, Madera, Visalia and 8 more.', img: '/images/work/gameday/g1.jpg', alt: 'Service areas', href: '/service-areas', linkLabel: 'See coverage' },
      { h: 'Free quote', p: 'On-site estimate within 24 hours. Written, fixed pricing on the spot.', img: '/images/work/gameday/g3.jpg', alt: 'Free quote', href: '/quote', linkLabel: 'Get quote' },
      { h: 'Blog', p: 'Sixty plain-English articles on permanent outdoor lighting.', img: '/images/work/gameday/g8.jpg', alt: 'Blog', href: '/blog', linkLabel: 'Read the blog' },
      { h: 'Gallery', p: 'Real installs across the Central Valley.', img: '/images/work/gameday/g11.jpg', alt: 'Gallery', href: '/galleries', linkLabel: 'View gallery' }
    ])}
  </section>` + ctaBlock() + `</main>` + footerHTML();
fs.writeFileSync(path.join(ROOT, '404.html'), notFoundHTML);
console.log('✓ Wrote 404.html');

// ============================================================
// ROBOTS.TXT
// ============================================================
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);
console.log('✓ Wrote robots.txt');

console.log(`\nTotal: ${written + 1} pages (including homepage)`);
