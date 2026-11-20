// Meta-ads landing pages: one per ad angle at /go/<angle>/. Run: node ads/tz-permanent-2026/build-lp.js
// Real photos only (client's Google Business Profile + customer review photos). Reviews are quoted word for word.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const LIC = 'CA Lic. #1160266 (Valley Wash Pros Inc)';

const ANGLES = {
  'every-holiday': { h1: 'One installation. <em>Every holiday.</em>', hero: 'home-christmas', alt: 'A Fresno area home with red and green permanent roofline lights at night', first: '' },
  'never-hang': { h1: 'Never hang Christmas lights <em>again.</em>', hero: 'home-warm', alt: 'A home at dusk with warm white permanent lights along the roofline', first: '' },
  'zero-hassle': { h1: '$0 annual hanging <em>hassle.</em>', hero: 'home-two-story', alt: 'A two story home with permanent white lights on every roofline', first: '' },
  'one-tap': { h1: 'One tap. <em>Any color.</em>', hero: 'home-dusk', alt: 'A single story home at night with color permanent lights under the eaves', first: '' },
  'drive-home': { h1: 'Be the house people notice <em>driving home.</em>', hero: 'home-white', alt: 'A home at dusk with white permanent lights on the peaks and eaves', first: '' },
};

const pic = (name, alt, attrs = '') => `<picture><source type="image/webp" srcset="/go/media/${name}.webp"><img src="/go/media/${name}.jpg" alt="${alt}" ${attrs}></picture>`;
const ic = id => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;

const page = (slug, a) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${a.h1.replace(/<[^>]+>/g, '')} | Twilight Zone Permanent Lighting</title>
<meta name="description" content="Permanent roofline lighting installed in one day in Fresno and Clovis. Get a free on site quote. ${LIC}.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#050505">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="preload" as="image" type="image/webp" href="/go/media/${a.hero}.webp" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/go/lp.css">
</head>
<body data-angle="${slug}">
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
<symbol id="i-day" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>
<symbol id="i-quote" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/></symbol>
<symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></symbol>
</svg>

<header class="hero">
  <div class="hero-img">${pic(a.hero, a.alt, 'width="1300" height="975" fetchpriority="high"')}</div>
  <img class="logo" src="/lights/media/logo-240.png" width="240" height="160" alt="Twilight Zone Permanent Lighting">
  <div class="hero-copy">
    <a class="stars" href="#reviews"><b>5.0</b><span aria-hidden="true">★★★★★</span> 15 Google reviews</a>
    <h1>${a.h1}</h1>
    <p class="sub">Permanent roofline lights, installed in one day. Fresno and Clovis.</p>
  </div>
  <div class="card" id="quote">
    <form class="quiz" novalidate aria-label="Free quote">
      <div class="bar" aria-hidden="true"><i></i></div>
      <p class="pn" aria-live="polite">Free quote · Step 1 of 5</p>

      <fieldset class="step" data-q="scope"><legend>What do you want lit?</legend>
        <div class="tiles pics">
          <label><input type="radio" name="scope" value="Front of the house">${pic('home-warm', '', 'loading="lazy"')}<span>Front of the house</span></label>
          <label><input type="radio" name="scope" value="Whole roofline">${pic('home-two-story', '', 'loading="lazy"')}<span>Whole roofline</span></label>
          <label><input type="radio" name="scope" value="Roofline plus patio or yard">${pic('home-dusk', '', 'loading="lazy"')}<span>Roofline plus patio</span></label>
          <label><input type="radio" name="scope" value="Not sure yet">${pic('track-day', '', 'loading="lazy"')}<span>Not sure yet</span></label>
        </div>
      </fieldset>

      <fieldset class="step" data-q="stories" hidden><legend tabindex="-1">How tall is your home?</legend>
        <div class="tiles"><label><input type="radio" name="stories" value="One story"><span>One story</span></label><label><input type="radio" name="stories" value="Two story"><span>Two story</span></label><label><input type="radio" name="stories" value="Three story or more"><span>Three or more</span></label></div>
      </fieldset>

      <fieldset class="step" data-q="timeline" hidden><legend tabindex="-1">When do you want them on?</legend>
        <div class="tiles"><label><input type="radio" name="timeline" value="As soon as possible"><span>As soon as possible</span></label><label><input type="radio" name="timeline" value="Within a month"><span>Within a month</span></label><label><input type="radio" name="timeline" value="Just getting pricing"><span>Just getting pricing</span></label></div>
      </fieldset>

      <div class="step" data-step="address" hidden>
        <p class="legend" tabindex="-1">Where is the home?</p>
        <label class="f"><span>Street address</span><input name="address" type="text" autocomplete="street-address" maxlength="200" enterkeyhint="next"></label>
        <div class="two"><label class="f"><span>City</span><input name="city" type="text" autocomplete="address-level2" maxlength="80" enterkeyhint="next"></label><label class="f"><span>ZIP</span><input name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" enterkeyhint="go"></label></div>
        <button class="btn next" type="button">Next ${ic('i-arrow')}</button>
      </div>

      <div class="step" data-step="contact" hidden>
        <p class="legend" tabindex="-1">Last step. Where do we send your quote?</p>
        <label class="f"><span>Full name</span><input name="name" type="text" autocomplete="name" maxlength="80" enterkeyhint="next"></label>
        <label class="f"><span>Phone</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="32" enterkeyhint="next"></label>
        <label class="f"><span>Email</span><input name="email" type="email" inputmode="email" autocomplete="email" maxlength="200" enterkeyhint="go"></label>
        <div class="hp" aria-hidden="true"><label>Company<input name="company" type="text" tabindex="-1" autocomplete="off"></label></div>
        <button class="btn" type="submit"><span>Get my free quote</span>${ic('i-arrow')}</button>
        <p class="fine">By submitting, you agree Twilight Zone may contact you by call, text or email about your quote. Msg and data rates may apply. <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p>
      </div>
      <p class="err" role="alert" hidden></p>
      <button class="back" type="button" hidden>← Back</button>
    </form>
  </div>
  <ul class="chips" aria-label="What every install includes">
    <li>${ic('i-check')}16M+ colors</li>
    <li>${ic('i-check')}Lifetime track warranty</li>
    <li>${ic('i-check')}7 day satisfaction guarantee</li>
    <li>${ic('i-check')}Bonded and insured</li>
  </ul>
</header>

<main>
<section class="strip" aria-label="Real installs">
  <div class="track">
    ${[['home-christmas', 'Red and green holiday lights on a customer home'], ['home-two-story', 'White permanent lights on a two story home'], ['crew-truck', 'The Twilight Zone crew installing lights beside the company truck'], ['home-warm', 'Warm white roofline lights at dusk'], ['install-ladder', 'An installer fitting track under an eave'], ['home-dusk', 'Color lights under the eaves of a single story home'], ['crew-install', 'Two installers on ladders at a customer home'], ['home-white', 'White lights along the peaks of a home at dusk']].map(([n, alt]) => pic(n, alt, 'loading="lazy" width="600" height="450"')).join('\n    ')}
  </div>
  <p class="cap">Real homes lit by our crew in the Fresno area</p>
</section>

<section class="day">
  ${pic('track-day', 'Close view of the light track tucked under a white eave in daylight', 'loading="lazy" width="900" height="1200"')}
  <div><h2>By day, you barely <em>see it.</em></h2><p>The track tucks under your eave and matches your trim.</p></div>
</section>

<section class="get">
  <h2>What you <em>get</em></h2>
  <ul>
    <li>${ic('i-day')}<b>Installed in one day</b><span>Our own crew does every climb.</span></li>
    <li>${ic('i-phone')}<b>16M+ colors from your phone</b><span>Christmas, Halloween, game day, warm white. 200+ presets.</span></li>
    <li>${ic('i-shield')}<b>Lifetime track warranty</b><span>Plus 5 years on LEDs and labor.</span></li>
    <li>${ic('i-check')}<b>7 day satisfaction guarantee</b><span>Not happy in the first 7 days? We pull it and refund you in full.</span></li>
    <li>${ic('i-quote')}<b>Free on site quote</b><span>From $950. Most homes run $2,800 to $5,800.</span></li>
  </ul>
  <a class="btn js-quote" href="#quote">Get my free quote ${ic('i-arrow')}</a>
</section>

<section class="steps">
  <h2>Three <em>steps</em></h2>
  <ol><li>${ic('i-home')}<b>Tell us about your home</b></li><li>${ic('i-quote')}<b>Get a written quote on site</b></li><li>${ic('i-bolt')}<b>We install, you tap</b></li></ol>
</section>

<section class="reviews" id="reviews">
  <h2>From our <em>Google reviews</em></h2>
  <ul>
    <li><p>“They completed the installation in just one day and took the time to walk us through the app and show us how to use all the different lighting features.”</p><cite>Gustavo R. <span aria-hidden="true">★★★★★</span></cite></li>
    <li><p>“They even took time after the work was completed to show me how to use the lighting app and run the lights.”</p><cite>Antonio S. <span aria-hidden="true">★★★★★</span></cite></li>
    <li><p>“After seeing how well my neighbor’s property came out I knew I had to get mine done.”</p><cite>Chance C. <span aria-hidden="true">★★★★★</span></cite></li>
  </ul>
</section>

<section class="owner">
  ${pic('crew-truck', 'The Twilight Zone crew and truck at a customer home', 'loading="lazy" width="1200" height="800"')}
  <p><b>Raphael Samarin, owner.</b> Our own crew measures, installs and shows you the app. Based in Clovis. ${LIC}. Bonded and insured.</p>
</section>

<section class="faq">
  <h2>Quick <em>answers</em></h2>
  <details><summary>What does it cost?</summary><p>Installs start at $950. Most homes run $2,800 to $5,800, depending on the feet of roofline. You get a written price at the on site quote.</p></details>
  <details><summary>How long does the install take?</summary><p>Most homes are done in one day.</p></details>
  <details><summary>Where do you work?</summary><p>Fresno, Clovis and nearby Central Valley towns. Enter your address above and we will confirm.</p></details>
  <details><summary>What is included?</summary><p>Track color matched to your trim, the lights, the controller, the phone app with 16M+ colors and 200+ presets, a lifetime warranty on the track and 5 years on LEDs and labor.</p></details>
  <details><summary>What if I do not like it?</summary><p>You have 7 days. If you are not happy, we pull the lights and refund you in full.</p></details>
  <details><summary>Are you licensed and insured?</summary><p>Yes. ${LIC}. Bonded and insured. Financing is available on approved credit, ask at your quote.</p></details>
</section>

<section class="final">
  ${pic('home-christmas', 'A customer home lit red and green for Christmas', 'loading="lazy" width="1300" height="1456"')}
  <div><h2>${a.h1}</h2><a class="btn js-quote" href="#quote">Get my free quote ${ic('i-arrow')}</a></div>
</section>
</main>

<footer class="foot"><p>© 2026 Twilight Zone Permanent Lighting · 755 N Peach Ave, Ste C16, Clovis, CA 93611 · ${LIC} · <a href="/privacy" target="_blank" rel="noopener">Privacy</a></p></footer>
<a class="sticky js-quote" href="#quote">Get my free quote ${ic('i-arrow')}</a>
<script src="/go/lp.js" defer></script>
</body>
</html>
`;

for (const [slug, a] of Object.entries(ANGLES)) {
  const dir = path.join(ROOT, 'go', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(slug, a));
}
console.log('wrote', Object.keys(ANGLES).length, 'landing pages to /go/');
