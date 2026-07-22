/* ============================================================
   TWILIGHT ZONE PERMANENT LIGHTING — interactivity
   ============================================================ */
window.__scriptStart = Date.now();
window.addEventListener('error', e => {
  window.__scriptError = { msg: e.message, line: e.lineno, col: e.colno, src: e.filename };
});

// (loader removed)

// ---- MAGNETIC BUTTONS (cursor removed, magnetic kept) ----
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ---- HERO SPOTLIGHT (cursor-following light) ----
(function() {
  const hero = document.querySelector('.hero');
  const spot = document.getElementById('heroSpotlight');
  if (!hero || !spot) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spot.style.left = x + 'px';
    spot.style.top = y + 'px';
  });
})();

// ---- LOW-POWER / DATA-SAVER DETECTION ----
// Skip heavy video on slow connections, low battery, or when user opts to save data.
// Posters become the fallback — site stays fast and beautiful.
const lowPowerMode = (() => {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (c?.saveData) return true;                                  // Data Saver enabled
  if (c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g') return true; // Slow connection
  if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return true; // Save-Data hint
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; // Reduced motion
  return false;
})();
if (lowPowerMode) document.body.classList.add('low-power');

// Async battery check (Chrome only) — some Android devices report charging state
if (!lowPowerMode && navigator.getBattery) {
  navigator.getBattery().then(b => {
    if (!b.charging && b.level < 0.2) {
      document.body.classList.add('low-power');
      // Pause hero/commercial to save power
      ['heroVideo', 'commercialVideo'].forEach(id => {
        const v = document.getElementById(id);
        if (v) { v.pause(); v.removeAttribute('autoplay'); }
      });
    }
  }).catch(() => {});
}

// ---- HERO + COMMERCIAL VIDEO infinite autoplay + lazy load ----
(function() {
  const heroVideo = document.getElementById('heroVideo');
  const commercialVideo = document.getElementById('commercialVideo');
  const vids = [heroVideo, commercialVideo].filter(Boolean);
  if (!vids.length) return;

  // Lazy-load commercial: assign source only when section is approaching viewport
  if (commercialVideo && !lowPowerMode) {
    const source = commercialVideo.querySelector('source');
    const lazySrc = source?.dataset.lazySrc;
    if (lazySrc) {
      const lazyObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            source.src = lazySrc;
            commercialVideo.preload = 'auto';
            commercialVideo.load();
            commercialVideo.play().catch(() => {});
            lazyObs.disconnect();
          }
        });
      }, { rootMargin: '600px 0px' }); // Start loading 600px before reaching viewport
      lazyObs.observe(commercialVideo.parentElement);
    }
  } else if (commercialVideo && lowPowerMode) {
    // Low power: just show poster
    commercialVideo.removeAttribute('autoplay');
  }

  if (lowPowerMode) {
    // Don't try to play anything — posters carry the visual
    return;
  }

  const tryPlay = () => vids.forEach(v => v.play().catch(() => {}));
  tryPlay();

  ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
    window.addEventListener(evt, tryPlay, { once: true, passive: true });
  });

  // Force infinite playback — videos resume themselves if anything pauses them
  vids.forEach(v => {
    v.addEventListener('pause', () => {
      if (!v.ended || v.loop) {
        setTimeout(() => v.play().catch(() => {}), 60);
      }
    });
    v.addEventListener('ended', () => {
      v.currentTime = 0;
      v.play().catch(() => {});
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) v.play().catch(() => {});
    });
  });
})();

// ---- SERVICE WORKER (cache-first for instant repeat visits) ----
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ---- STICKY NAV ----
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- HAMBURGER ----
const hamburger = document.getElementById('hamburger');
hamburger?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'));
});

// ---- TEMPERATURE SLIDER (drives clip-path split between cool/warm photos) ----
(function() {
  const tempRange = document.getElementById('tempRange');
  if (!tempRange) return;
  const photo = document.querySelector('.temp-photo');
  if (!photo) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyValue(v) {
    // Slider 0 → cool (warm hidden). Slider 100 → warm (warm fully shown).
    // CSS --temp is the LEFT edge of the warm image's clip; 100% = warm clipped completely.
    const pct = Math.max(0, Math.min(100, Number(v)));
    photo.style.setProperty('--temp', (100 - pct) + '%');
    tempRange.value = pct;
  }

  // Initial state: start fully warm (matches the "Warm for relaxation" lead phrase), then auto-sweep
  applyValue(100);

  let userInteracting = false;
  let resumeTimer = null;
  let rafId = null;
  let startEpoch = null;
  const PERIOD = 11000; // 11s per full cycle — slow + smooth, like a sun moving

  function tick(now) {
    if (startEpoch === null) startEpoch = now;
    const t = ((now - startEpoch) % PERIOD) / PERIOD;
    // Smooth eased oscillation starting at 100 (warm) → 0 (cool) → 100
    const v = 50 + Math.cos(t * Math.PI * 2) * 50;
    applyValue(v);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (REDUCED) return;
    if (rafId) return;
    startEpoch = null;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  tempRange.addEventListener('pointerdown', () => { userInteracting = true; stop(); });
  tempRange.addEventListener('input', () => {
    if (userInteracting) {
      applyValue(tempRange.value);
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { userInteracting = false; start(); }, 4000);
    } else {
      applyValue(tempRange.value);
    }
  });

  start();
})();

// ---- LIVE SCENE PICKER (photo crossfade) ----
(function() {
  const presets = document.querySelectorAll('.scene-btn');
  const photos = document.querySelectorAll('.scene-photo');
  const sceneName = document.getElementById('sceneName');
  if (!presets.length || !photos.length) return;

  if (sceneName) sceneName.style.transition = 'opacity .25s';

  function showScene(scene, label) {
    photos.forEach(p => p.classList.toggle('scene-photo-active', p.dataset.scene === scene));
    if (sceneName) {
      sceneName.style.opacity = '0';
      setTimeout(() => {
        sceneName.textContent = label;
        sceneName.style.opacity = '1';
      }, 200);
    }
  }

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      presets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showScene(btn.dataset.scene, btn.textContent.trim());
    });
  });
})();

// ---- LIGHTS ON/OFF TOGGLE ----
(function() {
  const toggle = document.getElementById('lightsToggle');
  const demo = document.getElementById('lightsDemo');
  if (!toggle || !demo) return;
  const night = demo.querySelector('.ld-night');
  const apply = () => {
    demo.classList.toggle('on', toggle.checked);
    if (night) night.style.opacity = toggle.checked ? '1' : '0';
  };
  toggle.addEventListener('change', apply);
  toggle.addEventListener('input', apply);
})();

// ---- 3D TILT CARDS ----
(function() {
  const tilts = document.querySelectorAll('[data-tilt]');
  if (window.matchMedia('(hover: none)').matches) return;

  tilts.forEach(card => {
    let rect = null;
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
      card.style.transition = 'transform .12s ease-out';
    });
    card.addEventListener('mousemove', e => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -6;
      const ry = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      card.style.transform = '';
      rect = null;
    });
  });
})();

// ---- DOT NAV ----
(function() {
  const dotNav = document.getElementById('dotNav');
  const dots = dotNav?.querySelectorAll('a');
  if (!dotNav || !dots.length) return;

  // Show after hero
  let visible = false;
  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > window.innerHeight * 0.5;
    if (shouldShow !== visible) {
      dotNav.classList.toggle('visible', shouldShow);
      visible = shouldShow;
    }
  }, { passive: true });

  // Track active section
  const sections = Array.from(dots).map(d => document.getElementById(d.dataset.target)).filter(Boolean);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.toggle('active', d.dataset.target === entry.target.id));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
})();

// ---- COUNT-UP ANIMATIONS ----
(function() {
  const msNums = document.querySelectorAll('.ms-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const span = el.querySelector('span');
      const text = el.firstChild.nodeValue || el.textContent;
      const match = text.match(/^([\d,]+)/);
      if (!match) { obs.unobserve(el); return; }
      const target = Number(match[1].replace(/,/g, ''));
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(target * eased);
        const formatted = current.toLocaleString('en-US');
        if (span) el.firstChild.nodeValue = formatted;
        else el.textContent = formatted;
        if (t < 1) requestAnimationFrame(tick);
        else if (span) el.firstChild.nodeValue = target.toLocaleString('en-US');
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  msNums.forEach(el => obs.observe(el));
})();

// ---- REVEAL ON SCROLL ----
(function() {
  const els = document.querySelectorAll(
    '.sol-card, .afs-card, .cv, .t-card, .trusted-text, .trusted-card, .temp-image, .temp-text, .ns-text, .ns-form, .ch-content, .sa-tile, .faq-item, .ms-item, .ms-row, .scene-stage, .scene-head, .hidden-head, .ba-slider'
  );
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });
  els.forEach((el, i) => {
    el.classList.add('reveal');
    const sibs = el.parentElement?.children;
    if (sibs) {
      const idx = Array.from(sibs).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
    }
    io.observe(el);
  });
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
  }, 1500);
})();

// ---- PARALLAX ----
(function() {
  const imgs = document.querySelectorAll('.parallax-img');
  let ticking = false;
  function apply() {
    imgs.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const winH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > winH) return;
      const progress = ((rect.top + rect.height / 2) - winH / 2) / winH;
      const offset = progress * 60;
      img.style.transform = `scale(1.1) translate3d(0, ${-offset}px, 0)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(apply); ticking = true; }
  }, { passive: true });
  apply();
})();

// ---- STATEMENT SCROLL-DRIVEN SCALE ----
(function() {
  const el = document.querySelector('[data-scale-on-scroll]');
  if (!el) return;
  let ticking = false;
  function apply() {
    const rect = el.getBoundingClientRect();
    const winH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > winH) { ticking = false; return; }
    // 0 → 1 progress as section center crosses viewport center
    const center = rect.top + rect.height / 2;
    const dist = (winH / 2 - center) / winH; // -0.5 to +0.5
    const scale = 0.9 + Math.max(0, Math.min(1, 0.5 + dist)) * 0.2;
    el.style.transform = `scale(${scale})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(apply); ticking = true; }
  }, { passive: true });
  apply();
})();

// ---- LEAD FORM SUBMIT (posts directly to Web3Forms + confetti + in-page thanks) ----
const WEB3FORMS_ACCESS_KEY = 'f5778338-9a6d-4c6c-be5c-ba7c88980649';

async function submitLead(form, opts = {}) {
  const btn = form.querySelector('button[type="submit"]');
  const originalLabel = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
  }

  // Collect form fields
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = typeof v === 'string' ? v : ''; });

  // Honeypot: bots fill "company" — silent-succeed so they don't retry
  if ((data.company || '').trim() !== '') {
    if (btn) { btn.textContent = '✓ Got it!'; btn.disabled = false; }
    if (opts.thanksId) {
      const thanks = document.getElementById(opts.thanksId);
      if (thanks) { form.hidden = true; thanks.hidden = false; }
    }
    return;
  }

  // Basic phone sanity — 7+ digits
  if (((data.phone || '').replace(/\D/g, '').length) < 7) {
    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.setAttribute('role', 'alert');
      err.style.cssText = 'color:#fca5a5;font-size:14px;margin-top:10px';
      form.appendChild(err);
    }
    err.textContent = 'Please enter a valid phone number.';
    return;
  }

  const source = form.dataset.formSource || 'unknown';
  const page = window.location.pathname;

  // Web3Forms payload — free plan is client-side POST only
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `New ${source === 'hero' ? 'quick quote' : 'quote request'} from ${data.firstName || 'a visitor'} — Twilight Zone`,
    from_name: 'Twilight Zone Lead Form',
    // Named fields — Web3Forms will include these in the email body
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || 'CA',
    zip: data.zip || '',
    source,
    page,
    referrer: document.referrer || '',
    submittedAt: new Date().toISOString()
  };

  let result;
  try {
    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    result = await resp.json().catch(() => ({ success: false }));
    result.ok = resp.ok && result.success === true;
  } catch (err) {
    result = { ok: false, error: 'network' };
  }

  if (result && result.ok) {
    if (btn) {
      btn.textContent = '✓ Got it!';
      btn.style.background = '#22c55e';
      btn.style.color = '#fff';
    }
    fireConfetti();
    // GA4 / GTM hook (fires only if dataLayer exists)
    if (window.dataLayer) window.dataLayer.push({ event: 'lead_submitted', form_source: data.source });

    // In-page thanks state
    if (opts.thanksId) {
      const thanks = document.getElementById(opts.thanksId);
      if (thanks) {
        form.hidden = true;
        thanks.hidden = false;
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (btn) {
      // Inline: just show success on the button for a few seconds, then reset
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.textContent = originalLabel;
        btn.style.background = '';
        btn.style.color = '';
      }, 4000);
    }
  } else {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
    // Soft inline error — give them the phone fallback
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.setAttribute('role', 'alert');
      err.style.cssText = 'color:#fca5a5;font-size:14px;margin-top:10px';
      form.appendChild(err);
    }
    err.innerHTML = 'Something hiccupped on our end. Try again, or call <a href="tel:+15593732220" style="color:#fff;text-decoration:underline">(559) 373-2220</a>.';
  }
}

const quoteForm = document.getElementById('quoteForm');
quoteForm?.addEventListener('submit', e => {
  e.preventDefault();
  submitLead(quoteForm, { thanksId: 'quoteThanks' });
});

// ---- CONFETTI ----
function fireConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('firing');
  const ctx = canvas.getContext('2d');
  const colors = ['#a855f7', '#d946ef', '#c084fc', '#f0abfc', '#fbbf24', '#fff'];
  const particles = [];
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.7,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 18 - 6,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      life: 1
    });
  }
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.rot += p.vrot;
      p.life -= 0.012;
      if (p.life > 0) {
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 1.4);
        ctx.restore();
      }
    });
    if (alive > 0) requestAnimationFrame(tick);
    else canvas.classList.remove('firing');
  }
  tick();
}

// ---- LOGO EASTER EGG (rainbow flash) ----
(function() {
  const brand = document.getElementById('brandLink');
  if (!brand) return;
  let clicks = 0, timer = null;
  brand.addEventListener('click', e => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => clicks = 0, 1000);
    if (clicks >= 3) {
      e.preventDefault();
      clicks = 0;
      const colors = ['#ef4444','#f59e0b','#fbbf24','#22c55e','#3b82f6','#a855f7','#ec4899'];
      const bulbs = document.querySelectorAll('.scene-house .b');
      colors.forEach((c, i) => {
        setTimeout(() => {
          bulbs.forEach((b, bi) => {
            b.style.fill = c;
            b.style.filter = `drop-shadow(0 0 12px ${c}) drop-shadow(0 0 24px ${c})`;
          });
        }, i * 150);
      });
      fireConfetti();
    }
  });
})();

// ---- REEL CAROUSEL (Our Work) ----
(function() {
  const track = document.getElementById('reelTrack');
  const prevBtn = document.getElementById('reelPrev');
  const nextBtn = document.getElementById('reelNext');
  const counterEl = document.getElementById('reelCurrent');
  const progressEl = document.getElementById('reelProgress');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.reel-card'));
  const total = cards.length;

  function getCardWidth() {
    if (cards.length < 2) return cards[0]?.offsetWidth || 0;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function currentIndex() {
    const cw = getCardWidth();
    if (!cw) return 0;
    return Math.round(track.scrollLeft / cw);
  }

  function updateUI() {
    const i = currentIndex();
    const display = String(Math.min(i + 1, total)).padStart(2, '0');
    if (counterEl) counterEl.textContent = display;
    if (prevBtn) prevBtn.disabled = i <= 0;
    if (nextBtn) nextBtn.disabled = i >= total - 1;
    // Highlight active card
    cards.forEach((c, idx) => c.classList.toggle('is-active', idx === i));
    // Progress bar: based on scrollLeft / max scrollable
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
    if (progressEl) progressEl.style.width = `${Math.max(20, Math.min(100, pct + 20))}%`;
  }

  function scrollToIndex(i) {
    const cw = getCardWidth();
    track.scrollTo({ left: i * cw, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollToIndex(Math.max(0, currentIndex() - 1)));
  nextBtn?.addEventListener('click', () => scrollToIndex(Math.min(total - 1, currentIndex() + 1)));

  let scrollTimer = null;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateUI, 80);
    // Update progress in real-time
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
    if (progressEl) progressEl.style.width = `${Math.max(20, Math.min(100, pct + 20))}%`;
  }, { passive: true });

  // Drag-to-scroll
  let isDown = false, startX = 0, startScroll = 0, moved = false;
  track.addEventListener('mousedown', e => {
    isDown = true;
    moved = false;
    startX = e.pageX;
    startScroll = track.scrollLeft;
    track.classList.add('dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  document.addEventListener('mouseup', e => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('dragging');
    if (moved) {
      // Snap to nearest after drag
      const cw = getCardWidth();
      const i = Math.round(track.scrollLeft / cw);
      scrollToIndex(Math.max(0, Math.min(total - 1, i)));
    }
  });
  // Prevent click after drag
  track.addEventListener('click', e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);

  // Touch is handled by native scroll-snap on touch devices

  // Keyboard
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToIndex(Math.max(0, currentIndex() - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(Math.min(total - 1, currentIndex() + 1)); }
  });

  // Autoplay videos in viewport, pause out of viewport
  const videos = Array.from(track.querySelectorAll('video'));
  const vobs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (v.paused) v.play().catch(() => {});
      } else {
        if (!v.paused) v.pause();
      }
    });
  }, { threshold: 0.5, root: track.parentElement });
  videos.forEach(v => vobs.observe(v));

  // Mute toggle (one at a time — only currently-active video plays sound)
  track.querySelectorAll('.reel-mute').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest('.reel-card');
      const video = card.querySelector('video');
      const wantMuted = video.muted ? false : true;
      // If unmuting this one, mute all others
      if (!wantMuted) {
        videos.forEach(v => v.muted = true);
        track.querySelectorAll('.reel-mute').forEach(b => b.dataset.muted = 'true');
      }
      video.muted = wantMuted;
      btn.dataset.muted = wantMuted ? 'true' : 'false';
      // Update icon: toggle the muted/unmuted SVG visually via swap
      btn.innerHTML = wantMuted
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>';
    });
  });

  // Resize updates
  window.addEventListener('resize', updateUI, { passive: true });
  setTimeout(updateUI, 200);
})();

// ---- INSTA-QUOTE CALCULATOR ----
(function() {
  const range = document.getElementById('calcRange');
  const zonesRange = document.getElementById('calcZonesRange');
  const feetEl = document.getElementById('calcFeet');
  const zonesEl = document.getElementById('calcZones');
  const priceEl = document.getElementById('calcPrice');
  const monthlyEl = document.getElementById('calcMonthly');
  const tierEl = document.getElementById('calcTier');
  const storiesGroup = document.getElementById('calcStories');
  const landscapeChk = document.getElementById('calcLandscape');
  const musicChk = document.getElementById('calcMusic');
  if (!range) return;

  let stories = 1;

  function calc() {
    const feet = Number(range.value);
    const zones = Number(zonesRange.value);
    const landscape = landscapeChk.checked ? 800 : 0;
    const music = musicChk.checked ? 300 : 0;

    // Base cost: $32/ft single-story, $42/ft two-story, $55/ft estate
    const perFoot = stories === 1 ? 32 : stories === 2 ? 42 : 55;
    const baseFromFeet = feet * perFoot;

    // Zone multiplier
    const zoneAdd = (zones - 1) * 180;

    // Subtotal
    const sub = baseFromFeet + zoneAdd + landscape + music;

    // Floor at $950 (Starter minimum) — small homes still get the Starter price
    const low = Math.max(950, Math.round(sub / 50) * 50);
    const high = Math.max(low + 250, Math.round(sub * 1.18 / 50) * 50);

    feetEl.textContent = feet + ' ft';
    zonesEl.textContent = zones;
    priceEl.textContent = `$${low.toLocaleString()} – $${high.toLocaleString()}`;

    // Monthly: 12-month 0% APR on the low end
    const monthly = Math.round(low / 12);
    monthlyEl.textContent = `$${monthly}/mo`;

    // Tier label (check highest first)
    let tier = 'Starter tier';
    if (low >= 7500) tier = 'Estate tier';
    else if (low >= 5800) tier = 'Premium tier';
    else if (low >= 2800) tier = 'Standard tier';
    tierEl.textContent = tier;
  }

  range.addEventListener('input', calc);
  zonesRange.addEventListener('input', calc);
  landscapeChk.addEventListener('change', calc);
  musicChk.addEventListener('change', calc);

  storiesGroup?.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      storiesGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      stories = Number(btn.dataset.stories);
      calc();
    });
  });

  calc();
})();

// ---- HERO INLINE LEAD FORM ----
(function() {
  const form = document.getElementById('heroForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitLead(form);
  });
})();

// ---- LIVE SLOTS COUNTDOWN (urgency) ----
(function() {
  const slotEl = document.getElementById('slotsRemain');
  if (!slotEl) return;
  // Decrement every ~90 seconds for a sense of activity (cap at 4)
  let remaining = Number(slotEl.textContent) || 7;
  setInterval(() => {
    if (remaining > 4 && Math.random() < 0.5) {
      remaining--;
      slotEl.textContent = remaining;
    }
  }, 90000);
})();

// ---- SMOOTH ANCHOR SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});

// ---- LAZY-LOAD VIDEOS (reel-moment blocks) via IntersectionObserver ----
// Sources have data-src instead of src; swap when scrolled near viewport.
(() => {
  const lazies = document.querySelectorAll('[data-lazy-video]');
  if (!lazies.length || !('IntersectionObserver' in window)) {
    // No-IO fallback: load all immediately
    lazies.forEach((wrap) => {
      wrap.querySelectorAll('source[data-src]').forEach((s) => {
        s.src = s.dataset.src;
        s.removeAttribute('data-src');
      });
      const v = wrap.querySelector('video');
      if (v) v.load();
    });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const wrap = e.target;
      wrap.querySelectorAll('source[data-src]').forEach((s) => {
        s.src = s.dataset.src;
        s.removeAttribute('data-src');
      });
      const v = wrap.querySelector('video');
      if (v) {
        v.load();
        const tryPlay = v.play();
        if (tryPlay && tryPlay.catch) tryPlay.catch(() => {});
      }
      io.unobserve(wrap);
    });
  }, { rootMargin: '300px 0px', threshold: 0.01 });
  lazies.forEach((el) => io.observe(el));
})();

// ---- REGISTER SERVICE WORKER (idempotent) ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ---- SERVICE-AREA MAP/LIST HOVER SYNC ----
(() => {
  const pins = document.querySelectorAll('.sa-hot');
  const cities = document.querySelectorAll('.sa-county a[data-city]');
  if (!pins.length || !cities.length) return;
  const sync = (slug, on) => {
    pins.forEach(p => p.classList.toggle('is-active', on && p.dataset.pin === slug));
    cities.forEach(c => c.classList.toggle('is-active', on && c.dataset.city === slug));
  };
  pins.forEach(p => {
    p.addEventListener('mouseenter', () => sync(p.dataset.pin, true));
    p.addEventListener('mouseleave', () => sync(p.dataset.pin, false));
  });
  cities.forEach(c => {
    c.addEventListener('mouseenter', () => sync(c.dataset.city, true));
    c.addEventListener('mouseleave', () => sync(c.dataset.city, false));
  });
})();

// ---- SCROLL-REVEAL FALLBACK (works in all browsers, including Safari < 18) ----
// Native animation-timeline: view() is gated by @supports in CSS; this JS handles
// the rest. Adds .is-in-view class when section enters viewport.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll(
    '.solutions, .scene, .reel, .process, .temp-section, .hidden-section, ' +
    '.app-features-section, .pricing, .calculator-section, .compare-section, ' +
    '.testimonials-section, .service-area, .faq, .next-steps, ' +
    '.sol-card, .reel-card, .proc-card, .afs-card, .tier, .t-card, .faq-item, ' +
    '.solutions-head, .scene-head, .process-head, .pricing-head, .reel-head, ' +
    '.afs-head, .compare-head, .testimonials-head, .sa-head, .faq-head, ' +
    '.section-head, .install-photo, .blog-card, .related-card'
  );
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in-view');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  targets.forEach(el => io.observe(el));
})();
