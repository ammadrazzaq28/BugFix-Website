/* BugFix Technologies — site behaviour */
(function () {
  'use strict';

  var R = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── preloader ── */
  var pre = document.getElementById('pre');
  if (pre) {
    var fill = pre.querySelector('.bar i');
    var pct = pre.querySelector('.pct');
    var n = 0;
    var t = setInterval(function () {
      n += R ? 40 : Math.random() * 16 + 6;
      if (n >= 100) {
        n = 100;
        clearInterval(t);
        setTimeout(function () { pre.classList.add('done'); }, 260);
      }
      fill.style.width = n + '%';
      pct.textContent = Math.round(n) + '%';
    }, R ? 20 : 90);
  }

  /* ── sticky nav ── */
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('stuck', window.scrollY > 12);
  }, { passive: true });

  /* ── platform toggle (signature control) ── */
  var tog = document.querySelector('.ptog');
  var pill = tog.querySelector('.pill');
  var pbtns = tog.querySelectorAll('button');

  function movePill(btn) {
    if (!btn) return;
    pill.style.width = btn.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (btn.offsetLeft - 3) + 'px)';
  }

  function setPlatform(p) {
    document.documentElement.classList.toggle('plat-android', p === 'android');
    Array.prototype.forEach.call(pbtns, function (b) {
      var on = b.dataset.plat === p;
      b.setAttribute('aria-pressed', String(on));
      if (on) movePill(b);
    });
    var labels = document.querySelectorAll('[data-ios][data-android]');
    Array.prototype.forEach.call(labels, function (el) {
      el.textContent = p === 'android' ? el.dataset.android : el.dataset.ios;
    });
  }

  Array.prototype.forEach.call(pbtns, function (b) {
    b.addEventListener('click', function () { setPlatform(b.dataset.plat); });
  });
  movePill(pbtns[0]);
  window.addEventListener('load', function () { movePill(pbtns[0]); });
  window.addEventListener('resize', function () {
    movePill(tog.querySelector('[aria-pressed="true"]'));
  });

  /* ── phone screen switcher ── */
  var swatches = document.querySelectorAll('.swatch button');
  Array.prototype.forEach.call(swatches, function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(swatches, function (x) {
        x.setAttribute('aria-pressed', 'false');
      });
      var views = document.querySelectorAll('.appview');
      Array.prototype.forEach.call(views, function (v) { v.classList.remove('on'); });
      b.setAttribute('aria-pressed', 'true');
      document.getElementById(b.dataset.app).classList.add('on');
    });
  });

  /* ── waveform bars ── */
  var wave = document.getElementById('wave');
  if (wave) {
    for (var i = 0; i < 30; i++) {
      var bar = document.createElement('i');
      bar.style.animationDelay = (i * 0.045).toFixed(2) + 's';
      bar.style.animationDuration = (0.85 + (i % 5) * 0.12).toFixed(2) + 's';
      wave.appendChild(bar);
    }
  }

  /* ── card cursor glow ── */
  var cards = document.querySelectorAll('.app');
  Array.prototype.forEach.call(cards, function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ── scroll reveal ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  var reveal = document.querySelectorAll('.rv, .step');
  Array.prototype.forEach.call(reveal, function (el) { io.observe(el); });

  /* ── contact form ── */
  var form = document.getElementById('cform');
  var err = document.getElementById('ferr');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('f-email').value.trim();
    var msg = document.getElementById('f-msg').value.trim();
    var valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && msg.length > 3;
    err.classList.toggle('on', !valid);
    if (valid) {
      window.location.href = 'mailto:hello@bugfixtechnologies.com'
        + '?subject=' + encodeURIComponent('New project enquiry')
        + '&body=' + encodeURIComponent(msg + '\n\n— ' + email);
    }
  });

  ['f-email', 'f-msg'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      err.classList.remove('on');
    });
  });
})();
