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
const head = ({ title, desc, canonical, kw = '', ogImg = '/images/03-accent.jpg', jsonld = [] }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
${kw ? `<meta name="keywords" content="${esc(kw)}" />` : ''}
<meta name="author" content="${esc(BRAND)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
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
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${SITE}${ogImg}" />
<meta name="theme-color" content="#050505" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css" />
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>`;

const headerHTML = () => `
<div class="header-stack" id="headerStack">
<div class="ann-bar" role="banner">
  <div class="ann-track">
    <span><i class="ann-pulse"></i> BOOKING SPRING 2026 — 7 INSTALL SLOTS REMAIN</span>
    <span><i class="ann-pulse"></i> 60-DAY MONEY-BACK · LIFETIME WARRANTY · STARTING AT <strong>$950</strong></span>
    <span><i class="ann-pulse"></i> FRESNO · CLOVIS · MADERA · VISALIA · HANFORD · SELMA · SANGER</span>
    <span><i class="ann-pulse"></i> BOOKING SPRING 2026 — 7 INSTALL SLOTS REMAIN</span>
    <span><i class="ann-pulse"></i> 60-DAY MONEY-BACK · LIFETIME WARRANTY · STARTING AT <strong>$950</strong></span>
  </div>
</div>
<header class="nav" id="nav">
  <div class="nav-inner">
    <a href="/" class="brand" aria-label="${esc(BRAND)} — Home">
      <img class="brand-logo" src="/images/logo-300.png" srcset="/images/logo-300.png 1x, /images/logo-600.png 2x" alt="${esc(BRAND)}" width="153" height="102" fetchpriority="high" />
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/services">Services</a>
      <a href="/service-areas">Areas</a>
      <a href="/commercial">Commercial</a>
      <a href="/pricing">Pricing</a>
      <a href="/compare">Compare</a>
      <a href="/faq">FAQ</a>
      <a href="tel:${TEL}" class="nav-phone">${PHONE}</a>
    </nav>
    <div class="nav-cta">
      <a href="/quote" class="btn btn-primary">Get Quote</a>
      <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
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
      <div><h5>Service Areas</h5><ul>${cities.slice(0,8).map(c => `<li><a href="/permanent-outdoor-lights-${c.slug}">${esc(c.name)}</a></li>`).join('')}</ul></div>
      <div><h5>Services</h5><ul>${services.slice(0,8).map(s => `<li><a href="/${s.slug}">${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</a></li>`).join('')}</ul></div>
      <div><h5>Company</h5><ul><li><a href="/pricing">Pricing</a></li><li><a href="/process">Process</a></li><li><a href="/reviews">Reviews</a></li><li><a href="/faq">FAQ</a></li><li><a href="/quote">Free Quote</a></li><li><a href="tel:${TEL}">${PHONE}</a></li></ul></div>
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
<script src="/script.js"></script>
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
const heroBlock = ({ kicker, h1, lead, ctaPrice, img }) => `
<section class="hero hero-page">
  <div class="hero-media"><img src="${(img || '/images/03-accent.jpg').replace(/^images\//,'/images/')}" alt="${esc(h1)}" loading="eager" fetchpriority="high" /></div>
  <div class="hero-overlay"></div>
  <div class="hero-content container">
    ${kicker ? `<div class="hero-kicker">${esc(kicker)}</div>` : ''}
    <h1 class="hero-h1">${esc(h1)}</h1>
    <p class="hero-lead">${esc(lead)}</p>
    <div class="hero-cta">
      <a href="/quote" class="btn btn-primary btn-lg">Free Quote in 24 Hours</a>
      <a href="tel:${TEL}" class="btn btn-ghost btn-lg">${PHONE}</a>
    </div>
    ${ctaPrice ? `<div class="hero-meta">From <strong>${usd(ctaPrice)}</strong> · 0% APR financing · 60-day money-back · Lifetime warranty</div>` : ''}
  </div>
</section>`;

const trustBar = () => `
<section class="trustbar">
  <div class="container trustbar-grid">
    ${shared.guarantees.map(g => `<div class="trust-item"><strong>${esc(g.title)}</strong><span>${esc(g.desc)}</span></div>`).join('')}
  </div>
</section>`;

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

const ctaBlock = () => `
<section class="cta-band">
  <div class="container">
    <h2>Ready for a quote?</h2>
    <p>Free on-site estimate within 24 hours. Written, fixed pricing on the spot. No obligation.</p>
    <div class="cta-row">
      <a href="/quote" class="btn btn-primary btn-lg">Get Free Quote</a>
      <a href="tel:${TEL}" class="btn btn-ghost btn-lg">Call ${PHONE}</a>
    </div>
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
  <h2>The hardware</h2>
  <div class="spec-grid">
    <div><dt>LED chip</dt><dd>${esc(shared.tech.ledType)}</dd></div>
    <div><dt>Colors</dt><dd>${esc(shared.tech.colors)}</dd></div>
    <div><dt>Patterns</dt><dd>${shared.tech.patterns}+ presets</dd></div>
    <div><dt>Lifespan</dt><dd>${esc(shared.tech.lifespan)}</dd></div>
    <div><dt>Weather</dt><dd>${esc(shared.tech.weatherRating)} · ${esc(shared.tech.tempRange)}</dd></div>
    <div><dt>Smart home</dt><dd>${shared.tech.appCompat.join(', ')}</dd></div>
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
  const html = head({ title, desc, canonical, kw: localKw, ogImg: service.image, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `${city.name}, CA`, h1, lead: `${service.lead} ${city.intro}`, ctaPrice: service.fromPrice, img: service.image }) +
    trustBar() +
    `<section class="container intro-block">
      <h2>${esc(service.h1.split(' Installation')[0])} for ${esc(city.name)} homes</h2>
      <p>${esc(service.intro)} ${esc(city.name)} sits at ${city.geo || `${city.lat}, ${city.lng}`}, with summer highs averaging ${city.climate.summerHigh}°F — exactly the conditions our IP67-rated aluminum track is engineered for. We've installed across ${city.neighborhoods.slice(0, 5).map(esc).join(', ')}, and serve every ZIP in the city: ${city.zips.map(esc).join(', ')}.</p>
      <p>${esc(city.testimonialName)} of ${esc(city.neighborhoods[0])} put it this way: "${esc(city.testimonialQuote)}"</p>
    </section>` +
    `<section class="container use-cases">
      <h2>Where ${esc(city.name)} homeowners use this</h2>
      <div class="use-grid">
        ${useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}
      </div>
    </section>` +
    techSpecsBlock() +
    `<section class="container neighborhood-list">
      <h2>${esc(city.name)} neighborhoods we serve</h2>
      <div class="nbhd-pills">
        ${city.neighborhoods.map(n => `<span class="pill">${esc(n)}</span>`).join('')}
      </div>
      <p class="muted">ZIPs: ${city.zips.map(esc).join(' · ')}</p>
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
  const html = head({ title, desc, canonical, kw: service.primaryKw, ogImg: service.image, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: 'Service', h1, lead: service.lead, ctaPrice: service.fromPrice, img: service.image }) +
    trustBar() +
    `<section class="container intro-block"><h2>About this service</h2><p>${esc(service.intro)}</p></section>` +
    `<section class="container use-cases"><h2>Where this is used</h2><div class="use-grid">${service.useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div></section>` +
    `<section class="container specs-block"><h2>Specs</h2><ul class="spec-list">${service.specs.map(s => `<li><strong>${esc(s.label)}:</strong> ${esc(s.value)}</li>`).join('')}</ul></section>` +
    techSpecsBlock() +
    `<section class="container city-grid">
      <h2>${esc(service.h1.split(' Installation')[0])} by city</h2>
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
  const html = head({ title, desc, canonical, kw: `permanent outdoor lights ${city.name.toLowerCase()}`, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `Serving ${city.name}, CA`, h1, lead: city.intro, ctaPrice: 950, img: '/images/03-accent.jpg' }) +
    trustBar() +
    `<section class="container intro-block">
      <h2>Why ${esc(city.name)} homeowners choose us</h2>
      <p>${esc(city.intro)} Population ${city.population.toLocaleString()}. Drive time from our Fresno shop: ${city.driveTime} minutes. We've installed across ${city.neighborhoods.slice(0, 5).map(esc).join(', ')}.</p>
      <p>"${esc(city.testimonialQuote)}" — ${esc(city.testimonialName)}, ${esc(city.neighborhoods[0])}.</p>
    </section>` +
    `<section class="container service-grid">
      <h2>Lighting services in ${esc(city.name)}</h2>
      <div class="service-cards">
        ${services.slice(0, 9).map(s => `<a href="/${s.slug}-${city.slug}" class="svc-card"><h4>${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</h4><p>${esc(s.lead.slice(0, 110))}</p><span class="from">From ${usd(s.fromPrice)}</span></a>`).join('')}
      </div>
    </section>` +
    `<section class="container neighborhood-list">
      <h2>Neighborhoods we serve in ${esc(city.name)}</h2>
      <div class="nbhd-pills">${city.neighborhoods.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div>
      <p class="muted">ZIPs: ${city.zips.map(esc).join(' · ')}</p>
    </section>` +
    `<section class="container climate-block">
      <h2>Built for ${esc(city.name)} weather</h2>
      <p>Summer highs in ${esc(city.name)} regularly hit ${city.climate.summerHigh}°F. ${esc(city.climate.notes)} Our IP67-rated track and -40°F to 140°F LED chips are engineered for it.</p>
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
  const html = head({ title: v.title, desc: v.metaDesc, canonical, kw: v.primaryKw, ogImg: v.image, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: 'Commercial', h1: v.h1, lead: v.lead, ctaPrice: v.fromPrice, img: v.image }) +
    trustBar() +
    `<section class="container intro-block"><h2>About this service</h2><p>${esc(v.intro)}</p></section>` +
    `<section class="container use-cases"><h2>Use cases</h2><div class="use-grid">${v.useCases.map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div></section>` +
    `<section class="container stats-block"><h2>By the numbers</h2><div class="stat-grid">${v.stats.map(s => `<div class="stat-card"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div></section>` +
    `<section class="container city-grid"><h2>By city</h2><div class="city-pills">${cities.map(c => `<a href="/${v.slug}-${c.slug}" class="pill">${esc(c.name)}</a>`).join('')}</div></section>` +
    techSpecsBlock() +
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
  const html = head({ title, desc, canonical, kw: `${v.primaryKw} ${city.name.toLowerCase()}`, ogImg: v.image, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: `${city.name} · Commercial`, h1, lead: `${v.lead} Serving ${city.name} businesses across ${city.neighborhoods.slice(0, 3).join(', ')}.`, ctaPrice: v.fromPrice, img: v.image }) +
    trustBar() +
    `<section class="container intro-block"><h2>${esc(baseName)} for ${esc(city.name)}</h2><p>${esc(v.intro)} In ${esc(city.name)} specifically, we work with operators across ${city.neighborhoods.slice(0, 4).map(esc).join(', ')}, with same-day response from our Fresno shop (${city.driveTime}-minute drive).</p></section>` +
    `<section class="container use-cases"><h2>Use cases in ${esc(city.name)}</h2><div class="use-grid">${v.useCases.slice(0, 6).map(u => `<div class="use-card"><h4>${esc(u.title || u)}</h4><p>${esc(u.desc || '')}</p></div>`).join('')}</div></section>` +
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
  const html = head({ title: c.title, desc: c.metaDesc, canonical, kw: c.primaryKw, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    `<section class="hero hero-page hero-compact">
       <div class="hero-overlay"></div>
       <div class="hero-content container">
         <div class="hero-kicker">Comparison</div>
         <h1 class="hero-h1">${esc(c.h1)}</h1>
         <p class="hero-lead">${esc(c.lead)}</p>
       </div>
     </section>` +
    trustBar() +
    `<section class="container compare-table-section">
       <h2>Side-by-side</h2>
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
  const html = head({ title, desc, canonical, kw, jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker: 'Pricing', h1, lead }) +
    trustBar() +
    sections.map(s => `<section class="container cost-section"><h2>${esc(s.h)}</h2>${s.body.map(p => `<p>${esc(p)}</p>`).join('')}${s.table ? `<table class="price-table"><thead><tr>${s.table.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}</section>`).join('') +
    guaranteeBlock() +
    faqBlock(faqs) +
    ctaBlock() +
    `</main>` + footerHTML();
  return { url: canonical, html };
}

// ---------- TEMPLATE: Generic Article (guides, neighborhoods, gallery) ----------
function renderArticle({ slug, h1, title, desc, kw, kicker, lead, parent, body, faqs = [], img }) {
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
  const html = head({ title, desc, canonical, kw, ogImg: img || '/images/03-accent.jpg', jsonld }) +
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    heroBlock({ kicker, h1, lead, img }) +
    trustBar() +
    body +
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

  const html = head({ title: post.title, desc: post.desc, canonical, kw: post.kw, jsonld }) +
    headerHTML() +
    `<main class="blog-post">` +
    breadcrumbBlock(crumbs) +
    `<section class="post-hero">
       <div class="container post-hero-inner">
         <div class="post-kicker">${esc(post.kicker)} · ${readingMin} min read</div>
         <h1 class="post-h1">${esc(post.h1)}</h1>
         <p class="post-lead">${esc(post.lead)}</p>
       </div>
     </section>` +
    `<article class="post-body container">
       ${post.body.map(s => `<section class="post-section"><h2>${esc(s.h)}</h2>${s.p.map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}
     </article>` +
    (post.faqs && post.faqs.length ? faqBlock(post.faqs) : '') +
    (related.length ? `<section class="container related-posts">
       <h2>Related reads</h2>
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
    headerHTML() +
    `<main>` +
    breadcrumbBlock(crumbs) +
    `<section class="post-hero">
       <div class="container post-hero-inner">
         <div class="post-kicker">${posts.length} articles · written by installers</div>
         <h1 class="post-h1">Permanent Outdoor Lighting Blog</h1>
         <p class="post-lead">Plain-English answers to the questions homeowners actually ask before, during, and after a permanent lighting install.</p>
       </div>
     </section>` +
    Object.keys(intentLabels).map(intent => {
      const list = grouped[intent] || [];
      if (!list.length) return '';
      return `<section class="container blog-bucket">
        <h2>${esc(intentLabels[intent])}</h2>
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
    body: `<section class="container service-grid"><h2>Residential</h2><div class="service-cards">${services.map(s => `<a href="/${s.slug}" class="svc-card"><h4>${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</h4><p>${esc(s.lead.slice(0, 110))}</p><span class="from">From ${usd(s.fromPrice)}</span></a>`).join('')}</div></section>
    <section class="container service-grid"><h2>Commercial</h2><div class="service-cards">${verticals.map(v => `<a href="/${v.slug}" class="svc-card"><h4>${esc(v.h1.split(' Installation')[0].split(' in ')[0])}</h4><p>${esc(v.lead.slice(0, 110))}</p><span class="from">From ${usd(v.fromPrice)}</span></a>`).join('')}</div></section>`
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
    body: `<section class="container city-grid"><h2>Cities we serve</h2><div class="service-cards">${cities.map(c => `<a href="/permanent-outdoor-lights-${c.slug}" class="svc-card"><h4>${esc(c.name)}, CA</h4><p>${esc((c.intro || '').slice(0, 130))}</p><span class="from">${c.driveTime} min from Fresno</span></a>`).join('')}</div></section>`
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
    body: `<section class="container service-grid"><h2>Verticals</h2><div class="service-cards">${verticals.map(v => `<a href="/${v.slug}" class="svc-card"><h4>${esc(v.h1.split(' Installation')[0].split(' in ')[0])}</h4><p>${esc(v.lead.slice(0, 130))}</p><span class="from">From ${usd(v.fromPrice)}</span></a>`).join('')}</div></section>`
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
    body: `<section class="container service-grid"><div class="service-cards">${comparisons.map(c => `<a href="/${c.slug}" class="svc-card"><h4>${esc(c.competitor)}</h4><p>${esc(c.lead.slice(0, 140))}</p></a>`).join('')}</div></section>`
  }));
  // /pricing
  out.push(renderArticle({
    slug: 'pricing',
    h1: 'Pricing: Permanent Outdoor Lighting',
    title: `Pricing | From $950 | ${BRAND}`,
    desc: 'Transparent published pricing. Starter from $950, Standard $2,800, Premium $5,800, Estate $7,500. Financing from $89/month at 0% APR.',
    kw: 'permanent outdoor lighting pricing',
    kicker: 'Pricing',
    lead: 'Most installers won\'t publish numbers. We do.',
    body: `<section class="container price-tiers"><h2>Tiers</h2>
      <div class="tier-grid">
        <div class="tier"><h3>Starter</h3><p class="price">${usd(shared.pricing.starterFrom)}</p><p>Single facade, ~30 ft, full app control. Lifetime track warranty.</p></div>
        <div class="tier"><h3>Standard</h3><p class="price">${usd(shared.pricing.standardFrom)}</p><p>Full front + sides, ~80 ft, single story. Most popular.</p></div>
        <div class="tier"><h3>Premium</h3><p class="price">${usd(shared.pricing.premiumFrom)}</p><p>Full perimeter, two-story homes.</p></div>
        <div class="tier"><h3>Estate</h3><p class="price">${usd(shared.pricing.estateFrom)}+</p><p>Multi-zone, complex rooflines, custom design.</p></div>
      </div></section>`
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
    body: `<section class="container quote-form-block"><h2>Two ways to start</h2>
      <p><strong>Call:</strong> <a href="tel:${TEL}">${PHONE}</a> — answered live, 8am-6pm Mon-Fri, 9am-4pm Sat.</p>
      <p><strong>Or fill out the form on our homepage</strong> and we'll be on-site within 24 hours.</p></section>`
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
    body: '',
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
  out.push(renderArticle({
    slug: 'process',
    h1: 'Our Install Process',
    title: `Install Process | ${BRAND}`,
    desc: 'Five-step install process for permanent outdoor lighting — quote, design, install, app setup, walkthrough.',
    kw: 'permanent lighting install process', kicker: 'How it works', lead: 'Five steps. One day on site for most homes.',
    body: `<section class="container"><ol class="process-steps">
      <li><strong>Free on-site quote (24 hr).</strong> We measure, plan, and price in writing.</li>
      <li><strong>Design + track color.</strong> Match your trim — white, bronze, brown, black.</li>
      <li><strong>Install (6-8 hr).</strong> W-2 crew, in-house, no subs.</li>
      <li><strong>Wiring + control box.</strong> Concealed, weatherproof, app-paired.</li>
      <li><strong>Walkthrough.</strong> Patterns, schedules, smart-home integration. Done.</li>
    </ol></section>`
  }));
  out.push(renderArticle({
    slug: 'reviews',
    h1: `${shared.brand.reviews}+ Reviews at ${shared.brand.rating}★`,
    title: `Reviews | ${shared.brand.rating} Stars | ${BRAND}`,
    desc: `${shared.brand.reviews}+ Google reviews at ${shared.brand.rating} stars. Real feedback from real Central Valley homeowners.`,
    kw: 'twilight zone lighting reviews', kicker: 'Reviews', lead: `${shared.brand.reviews}+ reviews at ${shared.brand.rating}★ on Google.`,
    body: `<section class="container review-grid"><div class="review-cards">${cities.slice(0, 9).map(c => `<div class="review-card"><div class="stars">★★★★★</div><p>"${esc(c.testimonialQuote)}"</p><cite>— ${esc(c.testimonialName)}, ${esc(c.name)}</cite></div>`).join('')}</div></section>`
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
      out.push(renderArticle({
        slug: `permanent-outdoor-lights-${c.slug}-${nslug}`,
        h1: `Permanent Outdoor Lighting in ${n}, ${c.name}`,
        title: `Permanent Outdoor Lights ${n} ${c.name} CA | ${BRAND}`,
        desc: `Permanent outdoor lighting installer for ${n} in ${c.name}, CA. From $950. Lifetime warranty. ${shared.brand.installs}+ Central Valley installs.`,
        kw: `permanent outdoor lights ${n.toLowerCase()} ${c.name.toLowerCase()}`,
        kicker: `${c.name} · Neighborhood`,
        parent: { name: c.name, url: `/permanent-outdoor-lights-${c.slug}` },
        lead: `Local installer for ${n} homeowners — same crew that runs all of ${c.name}.`,
        body: `<section class="container article-body">
          <h2>About ${esc(n)}</h2>
          <p>${esc(n)} is one of ${esc(c.name)}'s established neighborhoods. We've installed permanent outdoor lighting across ${esc(n)} and the surrounding ${esc(c.neighborhoods.slice(0, 4).join(', '))} corridor. Drive time from our Fresno shop is roughly ${c.driveTime} minutes.</p>
          <h2>What ${esc(n)} homes typically run</h2>
          <p>Most ${esc(n)} single-story homes land Standard tier (${usd(shared.pricing.standardFrom)}-${usd(shared.pricing.premiumFrom)}). Two-story homes Premium tier (${usd(shared.pricing.premiumFrom)}-${usd(shared.pricing.estateFrom)}). Tract starter homes can come in at Starter (${usd(shared.pricing.starterFrom)}).</p>
          <h2>Why local matters</h2>
          <p>If something goes sideways in year four, you call us — not a 1-800 number. W-2 crew, in-house, California Lic. #${shared.brand.license}.</p>
        </section>` +
        `<section class="container service-grid"><h2>Services available in ${esc(n)}</h2><div class="service-cards">${services.slice(0, 6).map(s => `<a href="/${s.slug}-${c.slug}" class="svc-card"><h4>${esc(s.h1.split(' Installation')[0].split(' in ')[0])}</h4><p>From ${usd(s.fromPrice)}</p></a>`).join('')}</div></section>`,
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
function buildGalleries() {
  const out = [];
  const galleries = [
    { slug: 'gallery-christmas', h1: 'Christmas Lighting Gallery', desc: 'Real installs — permanent Christmas lights across Fresno, Clovis, Madera, Visalia.', kw: 'permanent christmas lights gallery' },
    { slug: 'gallery-halloween', h1: 'Halloween Lighting Gallery', desc: 'Permanent Halloween lighting installs — orange, purple, motion-triggered.', kw: 'permanent halloween lights gallery' },
    { slug: 'gallery-game-day', h1: 'Game Day Lighting Gallery', desc: 'Team-color lighting installs — Bulldogs, Lakers, Warriors, Dodgers, 49ers.', kw: 'game day lighting gallery' },
    { slug: 'gallery-architectural', h1: 'Architectural Accent Lighting Gallery', desc: 'Warm-white architectural lighting installs across the Central Valley.', kw: 'architectural accent lighting gallery' },
    { slug: 'gallery-two-story', h1: 'Two-Story Home Lighting Gallery', desc: 'Two-story permanent lighting installs in Fresno County.', kw: 'two story permanent lights gallery' },
    { slug: 'gallery-modern-homes', h1: 'Modern Home Lighting Gallery', desc: 'Permanent lighting on modern Central Valley homes — clean lines, hidden track.', kw: 'modern home permanent lights' },
    { slug: 'gallery-ranch-homes', h1: 'Ranch Home Lighting Gallery', desc: 'Single-story ranch home permanent lighting installs.', kw: 'ranch home permanent lights' },
    { slug: 'gallery-commercial', h1: 'Commercial Lighting Gallery', desc: 'Restaurants, hotels, storefronts, and HOAs across the Central Valley.', kw: 'commercial permanent lighting gallery' },
    { slug: 'gallery-restaurants', h1: 'Restaurant Lighting Gallery', desc: 'Restaurant exterior lighting installs across Fresno, Clovis, Visalia.', kw: 'restaurant lighting gallery' },
    { slug: 'gallery-hoa', h1: 'HOA Lighting Gallery', desc: 'HOA and apartment community permanent lighting installs.', kw: 'hoa permanent lighting gallery' },
    { slug: 'gallery-before-after', h1: 'Before & After Gallery', desc: 'Before-and-after photos of permanent outdoor lighting installs.', kw: 'permanent lights before after' },
    { slug: 'gallery-day-night', h1: 'Day & Night Gallery', desc: 'See exactly how invisible the track is by day — and how dramatic at night.', kw: 'permanent lights day night' }
  ];
  galleries.forEach(g => out.push(renderArticle({
    slug: g.slug, h1: g.h1, title: `${g.h1} | ${BRAND}`,
    desc: g.desc, kw: g.kw, kicker: 'Gallery',
    parent: { name: 'Galleries', url: '/galleries' },
    lead: g.desc,
    body: `<section class="container gallery-grid">
      <div class="gallery-photos">
        ${[1,2,3,4,5,6,7,8,9].map(i => `<figure class="gallery-photo"><img src="/images/0${(i % 9) + 1}-accent.jpg" alt="${esc(g.h1)} — install ${i}" loading="lazy" /></figure>`).join('')}
      </div>
    </section>
    <section class="container article-body">
      <h2>Want this look?</h2>
      <p>Free on-site quote in 24 hours. We measure, design, and price in writing on the spot. From ${usd(shared.pricing.starterFrom)}. Lifetime track warranty. 60-day money-back guarantee.</p>
    </section>`
  })));
  // Index
  out.push(renderArticle({
    slug: 'galleries', h1: 'Gallery: Real Installs',
    title: `Gallery | Real Permanent Lighting Installs | ${BRAND}`,
    desc: 'Real installs across Fresno County. Christmas, Halloween, game day, architectural, commercial, before/after.',
    kw: 'permanent outdoor lighting gallery', kicker: 'Galleries',
    lead: `${shared.brand.installs}+ installs across the Central Valley.`,
    body: `<section class="container service-grid"><div class="service-cards">${galleries.map(g => `<a href="/${g.slug}" class="svc-card"><h4>${esc(g.h1)}</h4><p>${esc(g.desc.slice(0, 110))}</p></a>`).join('')}</div></section>`
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
// SITEMAP.XML
// ============================================================
const allUrls = ['/'].concat(Array.from(writtenUrls).filter(u => u !== '/'));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url><loc>${SITE}${u}</loc><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(`✓ Wrote sitemap.xml (${allUrls.length} urls)`);

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
