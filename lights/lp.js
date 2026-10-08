// Real Google reviews only, copied verbatim from the client's Google Business Profile
// (https://maps.app.goo.gl/T2Cp8n6TEHoVX7Fd6). Re-checked on the live profile 2026-10-07: 5.0 from 10 reviews,
// all 5-star; 9 have text (Cody Richardson left a rating only). Never edit a reviewer's wording or typos.
// A cut is marked with '…' at a sentence boundary, words never changed (Daniel's ends before a superlative; William D.'s
// skips the sentences with 'best' and 'competitive'; SBABS's '…' is Google's own). Names are shown
// as first name + last initial. If the rating or count ever changes, update G_RATING/G_COUNT here and the
// three static badges in index.html (hero, S5, S7) and the hero proof card together.
const G_RATING = '5.0', G_COUNT = 10;
const REVIEWS = [
  { name: 'Daniel C.', rating: 5, text: 'Couldn’t be more happy with the quality and professionalism! I got my house done a couple months back and all my neighbors are asking me who did the lighting for me …' },
  { name: 'Chance C.', rating: 5, text: 'Twilight Zone Permanent Lighting I am amazed. After seeing how well my neighbor’s property came out I knew I had to get mine done. I love the professionalism and the communication they provided, overall love it!!' },
  { name: 'Anna B.', rating: 5, text: 'What an entirely smooth and easy experience! The 0% financing made it even better. Highly recommend!' },
  { name: 'SBABS', rating: 5, text: 'They left my house lit!😎 to perfection. Twilight Zone Permanent Lighting did a wonderful job. I did 2 years of research before committing to a company, and I am so glad I chose them. They were perfessional, communicative, and answered all my questions big and small. I would chose them again, no regrets …' },
  { name: 'William B.', rating: 5, text: 'Dude! These guys are what’s up! I know I acted late to get these lights installed but I called Twilight zone permanent lighting and they fit me in for an install to have it done by 4th of July! I greatly appreciate it! Amazing team and follow thru on process! I’m having them do my business next!' },
  { name: 'Sarah B.', rating: 5, text: 'TZ Lighting did an amazing Job on our home. We were extremely impressed with they\'re quality and customer service. we wanted jellyfish lights and they were very informative on their product. Very glad we moved forward with Twilight Zone. I recommend them to everyone!' },
  { name: 'William D.', rating: 5, text: 'Called them looking for information on my permanent lighting options. … I would highly recommend this company if you’re looking for a company that will meet your communicated expectations.' },
  { name: 'Javier C.', rating: 5, text: 'Love the lights would recommend to check these guys for all your lighting around the house.' },
  { name: 'William B.', rating: 5, text: 'Twilight zone definitely came in clutch for us! They took care of my house and my moms across the street in time for 4h of July! I liked the customer service and attention to detail in our initial conversation which is why it went with them and they definitely delivered!' },
];
const REVIEWS_PROFILE_URL = 'https://maps.app.goo.gl/T2Cp8n6TEHoVX7Fd6';
/* /lights landing page. Vanilla, no dependencies. */
(() => {
  'use strict';
  const d = document, W = window;
  const $ = (s, c) => (c || d).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || d).querySelectorAll(s));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SAVE = !!(navigator.connection && navigator.connection.saveData);
  const DESK = matchMedia('(min-width:1024px)');
  const onLoad = fn => { if (d.readyState === 'complete') fn(); else W.addEventListener('load', fn, { once: true }); };
  const onMQ = (mq, fn) => { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };
  const sy = () => W.pageYOffset || d.documentElement.scrollTop || 0;
  const docTop = el => el.getBoundingClientRect().top + sy();
  const inViewport = el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
  const visPx = el => { if (!el) return 0; const r = el.getBoundingClientRect(); return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); };
  // Decorative sections run inside guard(): a throw there must never stop the forms, the CTAs or tracking.
  const guard = fn => { try { fn(); } catch (e) { /* decorative only */ } };

  /* ---------- 1. Visibility engine: rect checks on scroll/resize/interval; IO only nudges it ---------- */
  const V = (() => {
    const L = new Set(); let raf = 0;
    const run = () => {
      raf = 0; const vh = innerHeight;
      for (const it of L) {
        const r = it.el.getBoundingClientRect();
        const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        let done = false;
        try { done = it.fn({ r, vh, vis, ratio: r.height ? vis / r.height : 0 }) === true; } catch (e) { /* keep the engine alive */ }
        if (done) L.delete(it);
      }
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(run); };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    addEventListener('orientationchange', tick);
    addEventListener('pageshow', tick);
    d.addEventListener('visibilitychange', tick);
    setInterval(() => { if (!d.hidden) tick(); }, 1000);
    const io = 'IntersectionObserver' in W ? new IntersectionObserver(tick, { threshold: [0, .1, .25, .35, .5, .6, 1] }) : null;
    return { watch(el, fn) { if (!el) return; L.add({ el, fn }); if (io) io.observe(el); tick(); }, tick };
  })();

  /* ---------- 2. Reveals, the S6 light strand and the one-time CTA light sweep ---------- */
  const reveal = el => V.watch(el, ({ r, vh, vis, ratio }) => {
    if (RM || ratio > .15 || vis > vh * .25 || r.bottom < 0) { el.classList.add('in'); return true; }
  });
  guard(() => {
    $$('[data-reveal]').forEach(reveal);
    $$('.strand').forEach(el => V.watch(el, ({ r, ratio }) => {
      if (RM || ratio >= .4 || r.bottom < 0) { el.classList.add('in'); return true; }
    }));
    $$('.cta-end .btn').forEach(el => V.watch(el, ({ ratio }) => {
      if (RM) return true;
      if (ratio >= .6) { el.classList.add('swept'); return true; }
    }));
  });

  /* ---------- 3. S3 scenes: decode-then-crossfade, last tap wins ---------- */
  guard(() => {
    const sStage = $('.scene-stage'); if (!sStage) return;
    const chips = $$('.chip'), live = $('#scene-live');
    const imgs = $$('.sc-img', sStage);
    let front = imgs[0], back = imgs[1], cur = 0, token = 0, tapped = false;
    const SIZES = front.getAttribute('sizes');
    // WebP for the swaps where the browser decodes it (the first scene ships as JPEG in the markup)
    let WEBP = false;
    const probe = new Image(); probe.onload = () => { WEBP = probe.width === 1; };
    probe.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    const srcset = k => {
      const p = '/lights/media/scenes/' + k;
      return WEBP ? p + '-720.webp 720w, ' + p + '-960.webp 960w, ' + p + '-1200.webp 1200w' : p + '-720.jpg 720w, ' + p + '-1200.jpg 1200w';
    };
    const warmed = new Set([chips[0].dataset.scene]);
    const warm = i => {
      if (SAVE) return;
      const k = chips[i].dataset.scene;
      if (warmed.has(k)) return;
      warmed.add(k);
      const im = new Image(); im.sizes = SIZES; im.srcset = srcset(k);
    };
    const loaded = img => new Promise(res => {
      if (img.complete && img.naturalWidth) return res();
      img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true });
    });
    const select = async i => {
      tapped = true;
      if (i === cur) return;
      const t = ++token; cur = i;
      const chip = chips[i], k = chip.dataset.scene;
      chips.forEach((c, j) => c.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
      // fetch + decode off-DOM first, so the back layer is only touched once bytes are ready
      warmed.add(k);
      const set = srcset(k);
      const pre = new Image(); pre.sizes = SIZES; pre.srcset = set;
      try { await pre.decode(); } catch (e) { await loaded(pre); }
      if (t !== token) return;
      const b = back;
      b.classList.add('prep');
      b.sizes = SIZES; b.srcset = set;
      try { await b.decode(); } catch (e) { if (t !== token) return; await loaded(b); }
      if (t !== token) return;
      const f = front;
      b.alt = chip.dataset.alt; b.removeAttribute('aria-hidden');
      f.alt = ''; f.setAttribute('aria-hidden', 'true');
      b.classList.remove('is-back');
      f.classList.remove('is-front'); f.classList.remove('prep'); f.classList.add('is-back');
      void b.offsetWidth;
      b.classList.remove('prep'); b.classList.add('is-front');
      front = b; back = f;
      sStage.style.setProperty('--g1', chip.dataset.g1);
      sStage.style.setProperty('--g2', chip.dataset.g2);
      if (live) live.textContent = 'Showing ' + $('.chip-l', chip).textContent;
    };
    chips.forEach((c, i) => {
      c.addEventListener('click', () => select(i));
      c.addEventListener('pointerenter', () => warm(i));
      c.addEventListener('touchstart', () => warm(i), { passive: true });
      c.addEventListener('focus', () => warm(i));
    });
    // swipe on the stage; pan-y keeps vertical scrolling native
    let sx = 0, sy0 = 0, pid = null;
    sStage.addEventListener('pointerdown', e => { pid = e.pointerId; sx = e.clientX; sy0 = e.clientY; }, { passive: true });
    sStage.addEventListener('pointercancel', () => { pid = null; });
    sStage.addEventListener('pointerup', e => {
      if (e.pointerId !== pid) return; pid = null;
      const dx = e.clientX - sx, dy = e.clientY - sy0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) select((cur + (dx < 0 ? 1 : -1) + chips.length) % chips.length);
    });
    // one ring pulse on Christmas after 1.5 s of >= 60% visibility with no tap
    if (!RM && chips[1]) {
      let pt = 0;
      V.watch(sStage, ({ ratio }) => {
        if (tapped) { clearTimeout(pt); return true; }
        if (ratio >= .6 && !d.hidden) { if (!pt) pt = setTimeout(() => { if (!tapped) chips[1].classList.add('pulse'); tapped = true; }, 1500); }
        else if (pt) { clearTimeout(pt); pt = 0; }
      });
    }
  });

  /* ---------- 4. S4 moments: one video plays at a time, visibility-driven; the still never plays ---------- */
  guard(() => {
    const sec = $('#moments'), track = $('.m-track');
    const cards = $$('.moment', track || d); if (!sec || !track || !cards.length) return;
    const vids = cards.map(c => c.dataset.kind === 'video' ? $('video', c) : null);
    const btns = cards.map(c => $('.reel-btn', c));
    const desc = btns.map(b => b ? (b.getAttribute('aria-label') || '').replace(/^Play video: /, '') : '');
    const AUTO = !RM && !SAVE;
    const flag = () => cards.map(() => false);
    const userPaused = flag(), manual = flag(), blocked = flag(), pending = flag();
    let active = 0, secOK = false, secVis = false, lockUntil = 0;
    const label = (i, playing) => { if (btns[i]) btns[i].setAttribute('aria-label', (playing ? 'Pause video: ' : 'Play video: ') + desc[i]); };
    // posters wait until the section is near, so they never compete with the hero image at startup
    const posters = () => vids.forEach(v => { if (v && v.dataset.poster && !v.getAttribute('poster')) v.poster = v.dataset.poster; });
    const ensureSrc = i => {
      const v = vids[i];
      if (v.getAttribute('src')) return;
      posters();
      if (!AUTO) v.removeAttribute('autoplay');
      v.muted = true; v.playsInline = true; v.src = v.dataset.src;
    };
    const play = i => {
      const v = vids[i]; if (!v) return;
      ensureSrc(i); v.muted = true;
      pending[i] = true;
      const p = v.play();
      if (p && p.catch) p.catch(err => {
        pending[i] = false;
        if (err && err.name === 'NotAllowedError') blocked[i] = true;   // e.g. Low Power Mode: show the glyph, wait for a tap
        cards[i].classList.remove('is-playing'); label(i, false);
      });
    };
    const pause = i => { const v = vids[i]; if (!v) return; pending[i] = false; if (!v.paused) v.pause(); };
    vids.forEach((v, i) => {
      if (!v) return;
      v.addEventListener('playing', () => { pending[i] = false; cards[i].classList.add('is-playing'); label(i, true); });
      v.addEventListener('pause', () => { pending[i] = false; cards[i].classList.remove('is-playing'); label(i, false); });
      // inline guard: never let an in-app browser take this over full screen
      v.addEventListener('webkitbeginfullscreen', () => { try { v.webkitExitFullscreen(); } catch (e) { /* ignore */ } });
    });
    const sync = () => {
      cards.forEach((_, i) => {
        if (!vids[i]) return;
        const here = !d.hidden && i === active;
        const auto = here && secOK && AUTO && !blocked[i] && !userPaused[i];
        const man = here && secVis && manual[i] && !userPaused[i];      // a tapped video keeps going while any of the section shows
        if (auto || man) { if (vids[i].paused && !pending[i]) play(i); }
        else { pause(i); if (!(here && secVis)) manual[i] = false; }
      });
    };
    const setActive = i => { if (i !== active) { active = i; sync(); } };
    const calcActive = () => {
      if (DESK.matches || performance.now() < lockUntil) return;
      const tr = track.getBoundingClientRect(), c = tr.left + tr.width / 2;
      let near = active, nd = Infinity;
      cards.forEach((el, i) => { const b = el.getBoundingClientRect(), dd = Math.abs(b.left + b.width / 2 - c); if (dd < nd) { nd = dd; near = i; } });
      setActive(near);
    };
    let raf = 0;
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; calcActive(); }); }, { passive: true });
    track.addEventListener('scrollend', () => { lockUntil = 0; calcActive(); });
    cards.forEach((el, i) => {
      ['pointerenter', 'focusin'].forEach(ev => el.addEventListener(ev, () => { if (DESK.matches) setActive(i); }));
      el.addEventListener('click', () => { if (DESK.matches) setActive(i); });
    });
    btns.forEach((b, i) => b && b.addEventListener('click', () => {
      const v = vids[i];
      if (!v.paused && !v.ended) { userPaused[i] = true; manual[i] = false; pause(i); return; }
      userPaused[i] = false; manual[i] = true; blocked[i] = false;
      if (!DESK.matches && track.scrollWidth > track.clientWidth) {
        lockUntil = performance.now() + 700;
        track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: RM ? 'auto' : 'smooth' });
      }
      active = i;
      play(i);   // inside the tap, so it works even where autoplay is blocked
      sync();
    }));
    onMQ(DESK, () => { if (DESK.matches) setActive(0); else calcActive(); });
    V.watch(sec, ({ r, vh }) => { if (r.top < vh * 1.5) { posters(); return true; } });
    V.watch(sec, ({ ratio }) => {
      secOK = ratio >= .35;
      secVis = ratio > .05;
      sync();
    });
  });

  /* ---------- 5. Short lead forms (hero + closing) ---------- */
  // Every submit goes two ways at once: Web3Forms emails the lead to us immediately, and /api/lead forwards it
  // to the CRM webhook (Zapier/Make → Jobber) once LEAD_WEBHOOK_URL is set in Vercel. The Pixel Lead fires only
  // after at least one of them confirms, with an eventID so a later Conversions API event can be de-duplicated.
  const W3_KEY = 'f5778338-9a6d-4c6c-be5c-ba7c88980649';
  const qs = new URLSearchParams(location.search);
  const cookie = n => { const m = d.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; };
  const attribution = () => {
    const o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(k => { const v = qs.get(k); if (v) o[k] = v.slice(0, 200); });
    const fbp = cookie('_fbp'), fbc = cookie('_fbc') || (o.fbclid ? 'fb.1.' + Date.now() + '.' + o.fbclid : '');
    if (fbp) o.fbp = fbp; if (fbc) o.fbc = fbc;
    return o;
  };
  const digits = s => String(s || '').replace(/\D/g, '');
  const forms = {};
  $$('form.lf[data-slot]').forEach(form => {
    const slot = form.dataset.slot, card = form.closest('.f-card'), done = $('.lf-done', card), err = $('.lf-err', form), go = $('.lf-go', form);
    forms[slot] = { slot, card, form, host: form, ready: true, started: false, load() {} };
    card.classList.add('is-ready');
    const showErr = html => { err.innerHTML = html; err.hidden = false; };
    const mark = (el, bad) => { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); };
    form.addEventListener('input', e => { if (e.target.name) mark(e.target.closest('fieldset') || e.target, false); err.hidden = true; });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (go.disabled) return;
      const f = form.elements, val = n => (f[n] && f[n].value || '').trim();
      const tl = form.querySelector('input[name=timeline]:checked');
      const bad = [];
      if (val('name').length < 2) bad.push(f.name);
      if (digits(val('phone')).length < 10) bad.push(f.phone);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) bad.push(f.email);
      if (val('address').length < 6) bad.push(f.address);
      $$('input', form).forEach(i => mark(i, false)); mark($('.lf-when', form), false);
      bad.forEach(i => mark(i, true));
      if (!tl) { mark($('.lf-when', form), true); bad.push($('.lf-when input', form)); }
      if (bad.length) { showErr('Please fill in the highlighted fields.'); try { bad[0].focus(); } catch (x) { /* ignore */ } return; }
      if (val('company')) { form.hidden = true; done.hidden = false; return; } // bot

      const name = val('name'), parts = name.split(/\s+/), first = parts[0], last = parts.slice(1).join(' ');
      const eventId = 'lead.' + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 9);
      const lead = Object.assign({
        source: 'meta-lp-' + slot, name, firstName: first, lastName: last,
        phone: val('phone'), email: val('email'), address: val('address'), timeline: tl.value,
        page: location.href.split('#')[0].slice(0, 300), referrer: d.referrer.slice(0, 300), eventId
      }, attribution());

      go.disabled = true; const label = go.firstElementChild.textContent; go.firstElementChild.textContent = 'Sending…';
      const w3 = fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({
          access_key: W3_KEY, from_name: 'Vaultio', subject: 'New Lead from ' + first + ' - Twilight Zone',
          'Name': name, 'Phone': lead.phone, 'Email': lead.email, 'Address': lead.address, 'How soon': lead.timeline,
          'Form': 'Meta ads landing page (' + slot + ')'
        }, lead))
      }).then(r => r.json()).then(r => !!(r && r.success)).catch(() => false);
      const api = fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
        .then(r => r.ok ? r.json() : null).then(r => !!(r && r.ok && r.queued)).catch(() => false);
      const [okMail, okCrm] = await Promise.all([w3, api]);

      if (okMail || okCrm) {
        // Hand off to /lights/thank-you, which fires the Pixel Lead once (and is usable as a URL conversion).
        // If sessionStorage is unavailable, fire Lead here and fall back to the inline success state.
        let handedOff = false;
        try {
          sessionStorage.setItem('tz_lead', JSON.stringify({ first, eventId, src: 'meta-lp-' + slot, timeline: lead.timeline, fired: 0 }));
          handedOff = true;
        } catch (x) { /* storage blocked */ }
        if (handedOff) { location.assign('/lights/thank-you'); return; }
        if (window.fbq) fbq('track', 'Lead', { content_name: 'meta-lp-' + slot, timeline: lead.timeline }, { eventID: eventId });
        const who = $('.lf-who', done); if (who) who.textContent = first ? ', ' + first : '';
        form.hidden = true; done.hidden = false;
        try { done.focus({ preventScroll: true }); } catch (x) { /* ignore */ }
        Object.keys(forms).forEach(k => { if (k !== slot) forms[k].card.classList.add('is-sibling-done'); });
      } else {
        go.disabled = false; go.firstElementChild.textContent = label;
        showErr('Something went wrong sending your request. Please call <a href="tel:+15592037700">(559) 203-7700</a> and we’ll get you scheduled.');
      }
    });
  });
  const loadClose = () => {};

  // Set only once both forms are wired: if anything above throws, the CSS call fallback stays armed.
  d.documentElement.classList.add('lp-ready');

  /* ---------- 6. Quote CTAs: smooth scroll to the nearest form; arrows and hrefs stay honest ---------- */
  const dock = $('.dock');
  const dockQ = dock ? $('.js-quote', dock) : null;
  const ctas = $$('a.js-quote').filter(a => a !== dockQ);
  // 'hero' only when the hero card is above the reference point and nearer than the closing card
  const pick = y => {
    const h = forms.hero, c = forms.close;
    if (!h) return 'close';
    if (!c) return 'hero';
    const ht = docTop(h.card), ct = docTop(c.card);
    return (ht < y && (y - ht) < (ct - y)) ? 'hero' : 'close';
  };
  const setDir = (a, slot) => {
    const dir = slot === 'hero' ? 'up' : 'down', href = slot === 'hero' ? '#hero-form' : '#quote';
    if (a.dataset.dir !== dir) a.dataset.dir = dir;
    if (a.getAttribute('href') !== href) a.setAttribute('href', href);
  };
  // the dock floats, so its reference is the scroll position; a section CTA's reference is its own spot.
  // While a section CTA is on screen the dock borrows that CTA's spot, so both always point the same way.
  let dockCta = null;
  const refY = a => a === dockQ ? (dockCta ? docTop(dockCta) : sy()) : docTop(a);
  const dirs = () => {
    ctas.forEach(a => { if (a.getClientRects().length) setDir(a, pick(refY(a))); });
    if (dockQ) setDir(dockQ, pick(refY(dockQ)));
  };
  const smoothOK = () => !RM && ('scrollBehavior' in d.documentElement.style);
  const goForm = slot => {
    const f = forms[slot]; if (!f) return;
    if (slot === 'close') loadClose(); else f.load();
    const top = slot === 'hero'
      ? (DESK.matches ? 0 : docTop(f.card) - 12)
      : docTop($('.c-inner') || f.card) - (DESK.matches ? 32 : 16);
    W.scrollTo({ top: Math.max(0, Math.round(top)), behavior: smoothOK() ? 'smooth' : 'auto' });
    const target = slot === 'hero' ? ($('#hero-form-t') || f.card) : f.card;
    try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    if (!RM) { f.card.classList.remove('is-target'); void f.card.offsetWidth; f.card.classList.add('is-target'); }
  };
  Object.keys(forms).forEach(k => forms[k].card.addEventListener('animationend', e => {
    if (e.animationName === 'ring') forms[k].card.classList.remove('is-target');
  }));
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a.js-quote'); if (!a) return;
    e.preventDefault();
    const slot = pick(refY(a));
    setDir(a, slot);
    goForm(slot);
  });
  dirs();
  onLoad(dirs);
  let rz = 0;
  W.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(dirs, 150); });

  /* ---------- 7. S5 reviews: renders only real entries from REVIEWS; otherwise stays hidden ---------- */
  guard(() => {
    const sec = $('#reviews'); if (!sec) return;
    const list = $('.rv-list', sec), more = $('.rv-more', sec), allWrap = $('.rv-all', sec);
    const rows = (Array.isArray(REVIEWS) ? REVIEWS : []).filter(r => r
      && typeof r.name === 'string' && r.name.trim()
      && typeof r.text === 'string' && r.text.trim()
      && typeof r.rating === 'number' && isFinite(r.rating)).slice(0, 12);
    if (!rows.length || !list) return;
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, cls) => { const n = d.createElement(tag); if (cls) n.className = cls; return n; };
    const svgUse = (id, cls) => {
      const s = d.createElementNS(NS, 'svg'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      if (cls) s.setAttribute('class', cls);
      const u = d.createElementNS(NS, 'use'); u.setAttribute('href', id); s.appendChild(u); return s;
    };
    const texts = [];
    rows.forEach((r, i) => {
      const name = r.name.trim(), n = Math.min(5, Math.max(1, Math.round(r.rating)));
      const li = el('li', 'rv-card'); li.style.setProperty('--i', String(i % 3));
      const head = el('div', 'rv-head');
      const av = el('span', 'rv-av'); av.setAttribute('aria-hidden', 'true'); av.textContent = (Array.from(name)[0] || '').toUpperCase();
      const who = el('div');
      const nm = el('p', 'rv-name'); nm.textContent = name; who.appendChild(nm);
      const src = el('p', 'rv-when'); src.textContent = 'Google review'; who.appendChild(src);
      head.appendChild(av); head.appendChild(who);
      const st = el('div', 'rv-stars'); st.setAttribute('role', 'img'); st.setAttribute('aria-label', 'Rated ' + n + ' out of 5');
      for (let k = 0; k < 5; k++) st.appendChild(svgUse('#i-star', k < n ? 'on' : 'off'));
      const tx = el('p', 'rv-text is-clamped'); tx.id = 'rv-t' + i; tx.textContent = r.text.trim();
      li.appendChild(head); li.appendChild(st); li.appendChild(tx);
      list.appendChild(li);
      texts.push(tx);
    });
    sec.hidden = false;

    // a More/Less toggle only where the clamp actually cuts text (measured; re-checked on resize)
    const toggles = () => texts.forEach(tx => {
      if (!tx.clientHeight) return;                       // card not shown yet: measured when it is
      const tog = tx.parentNode.querySelector('.rv-tog');
      const cut = tx.scrollHeight > tx.clientHeight + 1;
      if (tog) { if (tx.classList.contains('is-clamped') && !cut) tog.remove(); return; }
      if (!tx.classList.contains('is-clamped') || !cut) return;
      const b = el('button', 'rv-tog'); b.type = 'button'; b.textContent = 'More';
      b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', tx.id);
      b.addEventListener('click', () => {
        const open = tx.classList.toggle('is-clamped') === false;
        b.textContent = open ? 'Less' : 'More'; b.setAttribute('aria-expanded', open ? 'true' : 'false');
        dirs();
      });
      tx.parentNode.appendChild(b);
    });

    // Show the first 3 (6 on desktop); one disclosure button reveals the rest in place.
    list.id = list.id || 'rv-list';
    list.classList.add('is-lim');
    const first = () => DESK.matches ? 6 : 3;
    if (allWrap && rows.length > 3) {
      const b = el('button', 'rv-all-btn'); b.type = 'button';
      b.setAttribute('aria-controls', list.id); b.setAttribute('aria-expanded', 'false');
      const label = () => {
        const open = list.classList.contains('is-all'), n = rows.length - first();
        b.textContent = open ? 'Show fewer reviews' : 'Show ' + n + ' more review' + (n === 1 ? '' : 's');
        allWrap.hidden = !open && n <= 0;
      };
      b.addEventListener('click', () => {
        const open = !list.classList.contains('is-all');
        list.classList.toggle('is-all', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        label(); toggles(); dirs();
        if (!open) { const r = b.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) b.scrollIntoView({ block: 'center' }); }
      });
      allWrap.appendChild(b); label();
      onMQ(DESK, () => { label(); toggles(); dirs(); });
    }

    // The outbound profile link sits after the section CTA, as a small text link.
    if (/^https:\/\//.test(REVIEWS_PROFILE_URL) && more) {
      const a = el('a', 'rv-link'); a.href = REVIEWS_PROFILE_URL; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.setAttribute('data-cta', 'reviews-all-google');
      const sp = el('span'); sp.textContent = 'See all ' + G_COUNT + ' reviews on Google'; a.appendChild(sp);
      const sr = el('span', 'sr-only'); sr.textContent = ' (opens in a new tab)'; a.appendChild(sr);
      a.appendChild(svgUse('#i-ext', 'ic'));
      more.appendChild(a);
    }

    // The hero badge now reads the reviews on this page instead of leaving for Google Maps
    // (its markup keeps the profile URL as the no-JS fallback).
    const hb = $('.hero .g-proof'), rh = $('#reviews-h');
    if (hb) {
      hb.setAttribute('href', '#reviews'); hb.removeAttribute('target'); hb.removeAttribute('rel');
      hb.setAttribute('aria-label', G_RATING + ' stars, ' + G_COUNT + ' Google reviews: read them on this page');
      hb.addEventListener('click', e => {
        e.preventDefault();
        W.scrollTo({ top: Math.max(0, Math.round(docTop(sec) - (DESK.matches ? 0 : 4))), behavior: smoothOK() ? 'smooth' : 'auto' });
        if (rh) { rh.setAttribute('tabindex', '-1'); try { rh.focus({ preventScroll: true }); } catch (err) { /* ignore */ } }
      });
    }

    toggles();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(toggles);
    let rt = 0;
    W.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(toggles, 150); });
    list.setAttribute('data-reveal', 'kids');
    reveal(list);
    dirs();
  });

  /* ---------- 8. Tracking (Meta Pixel). PageView comes from the head snippet only. ---------- */
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (a && window.fbq) fbq('track', 'Contact', { content_name: a.dataset.cta || 'phone' });
  }, true);
  Object.keys(forms).forEach(k => {
    const f = forms[k];
    V.watch(f.card, ({ vis, vh }) => {
      if (f.ready && vis >= Math.min(240, .35 * vh)) {
        if (window.fbq) fbq('trackCustom', 'QuoteFormView', { form: k });
        return true;
      }
    });
  });
  // First interaction with a form = QuoteFormStart (once per form).
  const started = {};
  Object.keys(forms).forEach(k => forms[k].form.addEventListener('focusin', () => {
    if (started[k]) return; started[k] = true;
    if (window.fbq) fbq('trackCustom', 'QuoteFormStart', { form: k });
  }));

  /* ---------- 9. Dock (<1024): hidden while either form shows, over the footer and on desktop ---------- */
  // A section CTA in view no longer hides the dock (that made it flap mid-page): the dock stays put and its quote
  // button goes quiet (no gradient, .is-quiet) so two primary gradient buttons never compete, and it borrows the
  // CTA's direction. Show/hide only commits after the new state has held for DWELL ms, so the dock can never flash.
  guard(() => {
    const foot = $('.foot'); if (!dock || !foot) return;
    const hc = forms.hero ? forms.hero.card : null, cc = forms.close ? forms.close.card : null;
    const DWELL = 250;
    let shown = false, lastDirs = 0, pend = null, pendAt = 0, pendT = 0;
    const apply = want => {
      shown = want;
      dock.classList.toggle('is-on', want);
      if (want) { dock.removeAttribute('inert'); dock.removeAttribute('aria-hidden'); }
      else { dock.setAttribute('inert', ''); dock.setAttribute('aria-hidden', 'true'); }
    };
    V.watch(foot, ({ r, vh }) => {
      // the most visible section CTA, if any (hysteresis: keep the current one until it is nearly gone)
      let best = null, bestV = 0;
      ctas.forEach(a => { const v = visPx(a); if (v > bestV) { best = a; bestV = v; } });
      const cur = dockCta && visPx(dockCta) > 8 ? dockCta : null;
      const next = cur || (bestV > 24 ? best : null);
      if (next !== dockCta) { dockCta = next; dock.classList.toggle('is-quiet', !!next); }
      // the dock arrow follows its reference every tick; the section CTAs only need a refresh about once a second
      const now = performance.now();
      if (now - lastDirs > 1000) { lastDirs = now; dirs(); } else if (dockQ) setDir(dockQ, pick(refY(dockQ)));
      const formOn = shown ? (visPx(hc) > 48 || visPx(cc) > 48) : (visPx(hc) > 0 || visPx(cc) > 0);
      const footOn = r.top < vh;
      const want = !DESK.matches && !formOn && !footOn;
      if (want === shown) { if (pend !== null) { pend = null; clearTimeout(pendT); } return; }
      if (pend !== want) { pend = want; pendAt = now; clearTimeout(pendT); pendT = setTimeout(V.tick, DWELL + 20); return; }
      if (now - pendAt >= DWELL) { pend = null; apply(want); }
    });
  });
})();
