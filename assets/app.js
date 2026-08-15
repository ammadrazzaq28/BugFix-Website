/* BugFix Technologies — site behaviour */
(function () {
  'use strict';

  var R = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ── preloader (first, so a later error cannot trap the screen) ── */
  var pre = document.getElementById('pre');
  function hidePre() {
    if (pre) pre.classList.add('done');
  }
  if (pre) {
    var fill = pre.querySelector('.pre-bar i');
    var pct = pre.querySelector('.pre-pct span');
    var n = 0;
    var t = setInterval(function () {
      n += R ? 50 : Math.random() * 22 + 12;
      if (n >= 100) {
        n = 100;
        clearInterval(t);
        setTimeout(hidePre, 80);
      }
      if (fill) fill.style.width = n + '%';
      if (pct) pct.textContent = String(Math.round(n));
    }, R ? 16 : 40);
    setTimeout(hidePre, 700);
  }

  /* ── Lahore clock ── */
  try {
    function tickClock() {
      var fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
      var clockT = fmt.format(new Date());
      ['clock', 'clock-m'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { el.textContent = clockT; el.setAttribute('datetime', clockT); }
      });
    }
    tickClock();
    setInterval(tickClock, 1000);
  } catch (err) {}

  /* ── theme ── */
  var THEME_KEY = 'bf-theme';
  var themeBtn = document.getElementById('theme');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
  }

  function setTheme(t, persist) {
    var h = document.documentElement;
    h.classList.remove('theme-light', 'theme-dark');
    h.classList.add('theme-' + t);
    h.style.colorScheme = t;
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0B0C0E' : '#FAF7F2');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    }
  }

  if (!document.documentElement.classList.contains('theme-dark') &&
      !document.documentElement.classList.contains('theme-light')) {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored !== 'light' && stored !== 'dark') {
      stored = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setTheme(stored, false);
  } else {
    setTheme(currentTheme(), false);
  }

  requestAnimationFrame(function () {
    document.documentElement.classList.add('theme-ready');
  });

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (saved !== 'light' && saved !== 'dark') setTheme(e.matches ? 'dark' : 'light', false);
    });
  } catch (e) {}

  /* ── sticky nav + scroll progress ── */
  var nav = document.querySelector('.nav');
  var bar = document.querySelector('.progress i');
  var prog = document.querySelector('.progress');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('stuck', y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(100, (y / max) * 100) : 0;
    if (bar) bar.style.width = p + '%';
    if (prog) prog.setAttribute('aria-valuenow', String(Math.round(p)));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── platform toggle ── */
  var tog = document.querySelector('.ptog');
  var pill = tog && tog.querySelector('.pill');
  var pbtns = tog ? tog.querySelectorAll('button') : [];

  function movePill(btn) {
    if (!btn || !pill) return;
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
  setPlatform('android');
  window.addEventListener('load', function () {
    if (tog) movePill(tog.querySelector('[aria-pressed="true"]'));
  });
  window.addEventListener('resize', function () {
    if (tog) movePill(tog.querySelector('[aria-pressed="true"]'));
    if (window.innerWidth > 900) setMenu(false);
  });

  /* ── hero parallax ── */
  var stage = document.getElementById('orbit');
  var scene = stage && stage.querySelector('.scene');
  if (stage && scene && fine && !R) {
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width - 0.5) * 12;
      var dy = ((e.clientY - r.top) / r.height - 0.5) * -8;
      scene.style.transform = 'rotateX(' + (18 + dy) + 'deg) rotateY(' + dx + 'deg) rotateZ(-8deg)';
    });
    stage.addEventListener('pointerleave', function () {
      scene.style.transform = 'rotateX(18deg) rotateY(0deg) rotateZ(-8deg)';
    });
  }

  /* ── featured waveform ── */
  function fillWave(el, count) {
    if (!el) return;
    for (var i = 0; i < count; i++) {
      var barEl = document.createElement('i');
      barEl.style.animationDelay = (i * 0.045).toFixed(2) + 's';
      barEl.style.animationDuration = (0.85 + (i % 5) * 0.12).toFixed(2) + 's';
      barEl.style.height = (18 + (i % 7) * 10) + '%';
      el.appendChild(barEl);
    }
  }
  fillWave(document.getElementById('featwave'), 22);

  /* ── card cursor glow ── */
  var cards = document.querySelectorAll('.app');
  Array.prototype.forEach.call(cards, function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ── custom cursor + magnetic CTAs ── */
  var cur = document.querySelector('.cur');
  if (fine && !R && cur) {
    document.body.classList.add('has-cur');
    window.addEventListener('pointermove', function (e) {
      cur.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var hit = e.target.closest('a,button,summary,label,.app,.feat');
      cur.classList.toggle('on', !!hit);
    });
  }

  if (fine && !R) {
    var mags = document.querySelectorAll('.mag');
    Array.prototype.forEach.call(mags, function (el) {
      var xTo = 0, yTo = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo = (e.clientX - r.left - r.width / 2) * 0.28;
        yTo = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + xTo + 'px,' + yTo + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ── mobile menu ── */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  var lastFocus = null;

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      lastFocus = document.activeElement;
      menu.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      menu.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ── count-up ── */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var start = performance.now();
    var dur = 1100;
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = (dec ? val.toFixed(dec) : String(Math.round(val))) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function runCounts(root) {
    var nums = root.querySelectorAll ? root.querySelectorAll('[data-count]') : [];
    Array.prototype.forEach.call(nums, countUp);
  }

  /* ── scroll reveal ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        runCounts(e.target);
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  var reveal = document.querySelectorAll('.rv, .step');
  Array.prototype.forEach.call(reveal, function (el) {
    if (R) {
      el.classList.add('in');
    } else {
      io.observe(el);
    }
  });

  /* ── FAQ accordion: one open ── */
  document.querySelectorAll('.faq').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      document.querySelectorAll('.faq').forEach(function (other) {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });

  /* ── contact form ── */
  var form = document.getElementById('cform');
  var err = document.getElementById('ferr');
  var submit = document.getElementById('fsubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('f-email').value.trim();
    var msg = document.getElementById('f-msg').value.trim();
    var valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && msg.length > 3;
    err.classList.toggle('on', !valid);
    if (!valid) {
      document.getElementById('f-email').focus();
      return;
    }
    submit.setAttribute('disabled', '');
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = 'Opening mail…';
    window.location.href = 'mailto:hello@bugfixtechnologies.com'
      + '?subject=' + encodeURIComponent('New project enquiry')
      + '&body=' + encodeURIComponent(msg + '\n\n— ' + email);
  });

  ['f-email', 'f-msg'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      err.classList.remove('on');
    });
  });
})();
