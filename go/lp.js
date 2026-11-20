/* Twilight Zone ad landing pages (/go/<angle>/): quiz form, lead delivery, tracking. */
(function () {
  'use strict';
  var d = document, W = window, W3_KEY = 'f5778338-9a6d-4c6c-be5c-ba7c88980649';
  var angle = d.body.getAttribute('data-angle') || 'go';
  var form = d.querySelector('form.quiz'), card = d.getElementById('quote');
  var steps = [].slice.call(form.querySelectorAll('.step')), last = steps.length - 1, idx = 0;
  var bar = form.querySelector('.bar i'), pn = form.querySelector('.pn'), back = form.querySelector('.back'), err = form.querySelector('.err');
  var go = form.querySelector('button[type=submit]');
  var track = function (ev, p) { if (W.fbq) fbq('trackCustom', ev, p || {}); };
  var val = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
  var pick = function (n) { var c = form.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ''; };
  var mark = function (el, bad) { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); };

  function show(i, focus) {
    idx = i;
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    bar.style.width = Math.max(8, Math.round((i + 1) / steps.length * 100)) + '%';
    pn.textContent = (i === last ? 'Last step' : i === 0 ? 'Free quote' : i >= 2 ? 'Almost there' : 'Nice') + ' · Step ' + (i + 1) + ' of ' + steps.length;
    back.hidden = i === 0; err.hidden = true;
    if (focus) {
      var r = card.getBoundingClientRect(); if (r.top < 0) W.scrollTo(0, W.pageYOffset + r.top - 10);
      var t = steps[i].querySelector('legend, .legend'); try { t && t.focus({ preventScroll: true }); } catch (x) {}
    }
  }
  back.addEventListener('click', function () { if (idx > 0) show(idx - 1, true); });

  var started = false;
  form.addEventListener('change', function (e) {
    var fs = e.target.closest('fieldset.step'); if (!fs) return;
    if (!started) { started = true; track('LeadFormStart', { angle: angle }); }
    var i = steps.indexOf(fs);
    setTimeout(function () { if (idx === i) show(i + 1, true); }, 260);
  });
  form.addEventListener('input', function (e) { if (e.target.name) mark(e.target, false); err.hidden = true; });

  function fail(bad, msg) { bad.forEach(function (i) { mark(i, true); }); err.textContent = msg; err.hidden = false; try { bad[0].focus(); } catch (x) {} return false; }
  function addressOK() {
    var f = form.elements, bad = [];
    if (val('address').length < 5) bad.push(f.address);
    if (val('city').length < 2) bad.push(f.city);
    if (!/^\d{5}$/.test(val('zip'))) bad.push(f.zip);
    return bad.length ? fail(bad, 'Please add your street, city and 5 digit ZIP.') : true;
  }
  form.querySelector('.next').addEventListener('click', function () { if (addressOK()) { track('LeadFormContact', { angle: angle }); show(last, true); } });
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || e.target.type === 'radio') return;
    var ins = [].slice.call(steps[idx].querySelectorAll('input:not([tabindex="-1"])')), k = ins.indexOf(e.target);
    if (k > -1 && k < ins.length - 1) { e.preventDefault(); ins[k + 1].focus(); }
    else if (idx !== last) { e.preventDefault(); form.querySelector('.next').click(); }
  });

  // Fresno, Madera, Kings and Tulare county ZIPs. Others still send, flagged for the office.
  var inArea = function (z) { return /^(936|937|932)/.test(z); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (go.disabled) return;
    if (idx !== last) return;
    var miss = ['scope', 'stories', 'timeline'].filter(function (q) { return !pick(q); });
    if (miss.length) { show(steps.indexOf(form.querySelector('[data-q="' + miss[0] + '"]')), true); return; }
    if (!addressOK()) { show(last - 1, false); err.hidden = false; return; }
    var f = form.elements, bad = [];
    if (val('name').length < 2) bad.push(f.name);
    if (val('phone').replace(/\D/g, '').length < 10) bad.push(f.phone);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) bad.push(f.email);
    if (bad.length) return fail(bad, 'Please fill in your name, phone and email.');
    if (val('company')) { location.assign('/lights/thank-you'); return; } // bot trap

    var name = val('name'), parts = name.split(/\s+/), first = parts[0];
    var A = W.tzAttribution ? W.tzAttribution() : { fields: {}, params: {} };
    var eventId = 'lead.' + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 9);
    var area = inArea(val('zip')) ? 'In service area' : 'OUTSIDE Fresno area, confirm before quoting';
    var lead = {
      source: 'meta-go-' + angle, name: name, firstName: first, lastName: parts.slice(1).join(' '),
      phone: val('phone'), email: val('email'), address: val('address'), city: val('city'), state: 'CA', zip: val('zip'),
      timeline: pick('timeline'), scope: pick('scope'), stories: pick('stories'), service_area: area,
      page: location.href.split('#')[0].slice(0, 300), referrer: d.referrer.slice(0, 300), eventId: eventId, attribution: A.fields
    };
    Object.keys(A.params).forEach(function (k) { if (!lead[k]) lead[k] = A.params[k]; });
    var mail = { access_key: W3_KEY, from_name: 'Vaultio', subject: 'New Lead: Twilight Zone Permanent Lighting (' + first + ')',
      'Name': name, 'Phone': lead.phone, 'Email': lead.email, 'Address': lead.address + ', ' + lead.city + ', CA ' + lead.zip,
      'Wants lit': lead.scope, 'Home': lead.stories, 'Timing': lead.timeline, 'Service area': area, 'Form': 'Ad landing page: ' + angle };
    Object.keys(A.fields).forEach(function (k) { mail[k] = A.fields[k]; });
    Object.keys(A.params).forEach(function (k) { mail[k] = A.params[k]; });

    go.disabled = true; var label = go.firstElementChild.textContent; go.firstElementChild.textContent = 'Sending…';
    var post = function (url, body) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }).catch(function () { return null; }); };
    Promise.all([post('https://api.web3forms.com/submit', mail).then(function (r) { return !!(r && r.success); }), post('/api/lead', lead).then(function (r) { return !!(r && r.ok && r.queued); })]).then(function (ok) {
      if (ok[0] || ok[1]) {
        if (inArea(lead.zip)) track('QualifiedLead', { angle: angle });
        var handed = false;
        try { sessionStorage.setItem('tz_lead', JSON.stringify({ first: first, eventId: eventId, src: 'meta-go-' + angle, timeline: lead.timeline, fired: 0 })); handed = true; } catch (x) {}
        if (!handed && W.fbq) fbq('track', 'Lead', { content_name: 'meta-go-' + angle }, { eventID: eventId });
        location.assign('/lights/thank-you');
      } else {
        go.disabled = false; go.firstElementChild.textContent = label;
        err.textContent = 'Something went wrong sending your request. Please try again in a moment.'; err.hidden = false;
      }
    });
  });

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.js-quote'); if (!a) return;
    e.preventDefault(); W.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + W.pageYOffset - 10), behavior: 'smooth' });
  });
  var sticky = d.querySelector('.sticky'), foot = d.querySelector('.foot');
  function tick() { var r = card.getBoundingClientRect(); sticky.classList.toggle('on', r.bottom < 0 && foot.getBoundingClientRect().top > innerHeight); }
  W.addEventListener('scroll', tick, { passive: true }); tick();
  show(0, false);
})();
