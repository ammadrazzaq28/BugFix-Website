(function(){
  'use strict';
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer:fine) and (hover:hover)').matches;
  var $ = function(s){ return document.querySelector(s); };

  /* ── theme ── */
  var THEMES = ['teal','indigo','ember','violet','forest'];
  var root = document.documentElement;

  function setAccent(t){
    THEMES.forEach(function(x){ root.classList.remove('t-'+x); });
    root.classList.add('t-'+t);
    document.querySelectorAll('.sw button').forEach(function(b){
      b.setAttribute('aria-pressed', String(b.dataset.t === t));
    });
    try{ localStorage.setItem('hero-accent', t); }catch(e){}
  }
  document.querySelectorAll('.sw button').forEach(function(b){
    b.addEventListener('click', function(){ setAccent(b.dataset.t); });
  });

  var modeBtn = $('#mode');
  function setMode(dark){
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    modeBtn.setAttribute('aria-pressed', String(dark));
    modeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    try{ localStorage.setItem('hero-mode', dark ? 'dark' : 'light'); }catch(e){}
  }
  modeBtn.addEventListener('click', function(){ setMode(!root.classList.contains('dark')); });

  var sa=null, sm=null;
  try{ sa = localStorage.getItem('hero-accent'); sm = localStorage.getItem('hero-mode'); }catch(e){}
  setAccent(THEMES.indexOf(sa) > -1 ? sa : 'teal');
  setMode(sm ? sm === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);

  /* ── clock ── */
  var yrEl=document.getElementById('yr');
  if(yrEl) yrEl.textContent=String(new Date().getFullYear());

  function tick(){
    var d = new Date();
    $('#clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  tick(); setInterval(tick, 20000);

  /* ── scene transform: pointer parallax + scroll-linked exit ── */
  var stage = $('#stage'), scene = $('#scene'), hero = document.querySelector('.hero');
  var pdx = 0, pdy = 0, exit = 0;

  function applyScene(){
    scene.style.transform =
      'rotateX(' + (12 + pdy + exit*11) + 'deg)' +
      ' rotateY(' + (-14 + pdx) + 'deg)' +
      ' translateZ(' + (-exit*190) + 'px)' +
      ' scale(' + (1 - exit*.07) + ')';
    stage.style.opacity = String(1 - exit*.6);
  }

  if (fine && !R) {
    stage.addEventListener('pointermove', function(e){
      var r = stage.getBoundingClientRect();
      pdx = ((e.clientX - r.left)/r.width  - .5) * 15;
      pdy = ((e.clientY - r.top )/r.height - .5) * -9;
      applyScene();
    });
    stage.addEventListener('pointerleave', function(){ pdx = 0; pdy = 0; applyScene(); });
  }

  if (!R) {
    window.addEventListener('scroll', function(){
      var h = hero.offsetHeight * .85;
      exit = Math.max(0, Math.min(1, window.scrollY / h));
      applyScene();
    }, { passive:true });
  }

  /* ── build sequence: code on the left, site on the right, then the app ── */
  var url    = $('#url'),  snav  = document.querySelector('.snav');
  var lns    = document.querySelectorAll('.editor .ln');
  var caret  = $('#caret');
  var shs    = document.querySelectorAll('.sh');
  var sbtns  = document.querySelector('.sbtns');
  var scards = document.querySelectorAll('.scards i');
  var tiles  = document.querySelectorAll('.tile');
  var screen = $('#screen'), tabs = $('#tabs'), badge = $('#badge');
  var timers = [];

  function at(ms, fn){ timers.push(setTimeout(fn, ms)); }

  function reset(){
    timers.forEach(clearTimeout); timers = [];
    url.classList.remove('on');
    caret.classList.remove('on');
    lns.forEach(function(l){ l.classList.remove('on'); });
    snav.classList.remove('on');
    sbtns.classList.remove('on');
    shs.forEach(function(x){ x.classList.remove('on'); });
    scards.forEach(function(x){ x.classList.remove('on'); });
    tiles.forEach(function(t){ t.classList.remove('on'); });
    screen.classList.remove('on');
    tabs.classList.remove('on');
    badge.classList.remove('on');
  }

  function finalState(){
    url.classList.add('on');
    lns.forEach(function(l){ l.classList.add('on'); });
    snav.classList.add('on'); sbtns.classList.add('on');
    shs.forEach(function(x){ x.classList.add('on'); });
    scards.forEach(function(x){ x.classList.add('on'); });
    tiles.forEach(function(t){ t.classList.add('on'); });
    screen.classList.add('on'); tabs.classList.add('on'); badge.classList.add('on');
  }

  function run(){
    reset();
    if (R) { finalState(); return; }

    at(100, function(){ url.classList.add('on'); caret.classList.add('on'); });

    /* code lands line by line — the preview follows it */
    var STEP = 190, T0 = 700;
    lns.forEach(function(l,i){
      at(T0 + i*STEP, function(){
        l.classList.add('on');
        caret.style.top = (11 + (i+1) * 16.6) + 'px';     // caret walks down the file
      });
    });

    at(T0 + 3*STEP + 90, function(){ snav.classList.add('on'); });          // <Nav/>
    shs.forEach(function(x,i){ at(T0 + (4+i)*STEP + 90, function(){ x.classList.add('on'); }); });
    at(T0 + 6*STEP + 90, function(){ sbtns.classList.add('on'); });         // <CTA>
    scards.forEach(function(x,i){ at(T0 + 7*STEP + 90 + i*110, function(){ x.classList.add('on'); }); });

    var TAPP = T0 + 11*STEP + 250;
    at(TAPP,       function(){ caret.classList.remove('on'); screen.classList.add('on'); });
    tiles.forEach(function(t,i){ at(TAPP + 240 + i*150, function(){ t.classList.add('on'); }); });
    at(TAPP + 900,  function(){ tabs.classList.add('on'); });
    at(TAPP + 1250, function(){ badge.classList.add('on'); });

    at(TAPP + 6200, run);
  }


  /* ── scroll-driven rating ── */
  (function(){
    var proof  = $('#proof');
    if (!proof) return;
    var stars  = document.querySelectorAll('#stars .star');
    var fills  = document.querySelectorAll('#stars .star i');
    var scoreEl= $('#score'), pline = $('#pline'), pbar = $('#pbar i');
    var eyebrow= proof.querySelector('.peyebrow'), countEl = $('#rcount');
    var TARGET = 4.9, REVIEWS = 12480;
    var cur = 0, aim = 0, raf = null, inView = false;
    var wasFull = [false,false,false,false,false];

    function paint(p){
      var val = TARGET * p;
      scoreEl.textContent = val.toFixed(1);
      countEl.textContent = Math.round(REVIEWS * p).toLocaleString('en-US');
      for (var i = 0; i < fills.length; i++) {
        var fr = Math.max(0, Math.min(1, val - i));
        fills[i].style.width = (fr * 100) + '%';
        var full = fr >= 1;
        if (full && !wasFull[i]) stars[i].classList.add('pop');
        if (!full) stars[i].classList.remove('pop');
        wasFull[i] = full;
      }
      pbar.style.width = (p * 100) + '%';
      if (eyebrow) eyebrow.classList.toggle('on', p > .04);
      pline.classList.toggle('on', p > .80);
      proof.querySelector('.pin').classList.toggle('done', p > .985);
    }
    function loop(){
      cur += (aim - cur) * 0.14;
      if (Math.abs(aim - cur) < 0.0004) cur = aim;
      paint(cur);
      raf = (inView && cur !== aim) ? requestAnimationFrame(loop) : null;
    }
    function onScroll(){
      var r = proof.getBoundingClientRect();
      var travel = proof.offsetHeight - window.innerHeight;
      aim = travel > 0 ? Math.max(0, Math.min(1, (-r.top)/travel)) : 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }
    if (R) { paint(1); return; }
    new IntersectionObserver(function(en){
      inView = en[0].isIntersecting;
      if (inView) onScroll();
    }).observe(proof);
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  /* ── five stages, driven by scroll ── */
  (function(){
    var proc = $('#proc');
    if (!proc) return;
    var sgs   = document.querySelectorAll('#stages .sg');
    var cards = document.querySelectorAll('#artifact .acard');
    var spine = $('#spinefill'), bver = $('#bver');
    var VER   = ['1.0.0','1.1.0','1.2.0','1.3.0','2.0.0'];
    var N = sgs.length, last = -1;
    var cur = 0, aim = 0, raf = null, inView = false;

    function paint(p){
      var idx = Math.min(N - 1, Math.floor(p * N));
      spine.style.height = (p * 100) + '%';
      for (var i = 0; i < N; i++) {
        sgs[i].classList.toggle('done', i < idx);
        sgs[i].classList.toggle('now',  i === idx);
        cards[i].classList.toggle('on', i === idx);
      }
      if (idx !== last) { bver.textContent = VER[idx]; last = idx; }
    }
    function loop(){
      cur += (aim - cur) * 0.14;
      if (Math.abs(aim - cur) < 0.0004) cur = aim;
      paint(cur);
      raf = (inView && cur !== aim) ? requestAnimationFrame(loop) : null;
    }
    function onScroll(){
      var r = proc.getBoundingClientRect();
      var travel = proc.offsetHeight - window.innerHeight;
      aim = travel > 0 ? Math.max(0, Math.min(1, (-r.top)/travel)) : 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }
    if (R) { paint(0); return; }
    new IntersectionObserver(function(en){
      inView = en[0].isIntersecting;
      if (inView) onScroll();
    }).observe(proc);
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  /* ── production stack: two-way highlighting ── */
  (function(){
    var stk = $('#stk');
    if (!stk) return;
    var apps  = Array.prototype.slice.call(document.querySelectorAll('#apps .ap'));
    var techs = Array.prototype.slice.call(document.querySelectorAll('#sgrid .tchips button'));
    var readout = $('#readout');
    var IDLE = 'Hover a technology to see where it ships.';
    var pinnedTech = null, pinnedApp = null;
    var NAME = {};
    apps.forEach(function(a){ NAME[a.dataset.app] = a.textContent; });

    function clear(){
      apps.forEach(function(a){ a.classList.remove('lit','dim'); });
      techs.forEach(function(t){ t.classList.remove('dim'); });
    }
    function showTech(btn){
      var list = btn.dataset.apps.split(',');
      clear();
      apps.forEach(function(a){ a.classList.add(list.indexOf(a.dataset.app) > -1 ? 'lit' : 'dim'); });
      readout.classList.add('live');
      readout.textContent = btn.textContent + ' — shipping in ' +
        (list.length === apps.length ? 'all ' + apps.length + ' apps'
          : list.map(function(k){ return NAME[k]; }).join(', '));
    }
    function showApp(btn){
      var key = btn.dataset.app, n = 0;
      clear();
      techs.forEach(function(t){
        var has = t.dataset.apps.split(',').indexOf(key) > -1;
        if (has) n++; else t.classList.add('dim');
      });
      btn.classList.add('lit');
      readout.classList.add('live');
      readout.textContent = btn.textContent + ' — runs on ' + n + ' of these in production';
    }
    function rest(){
      clear();
      if (pinnedTech) { showTech(pinnedTech); return; }
      if (pinnedApp)  { showApp(pinnedApp);  return; }
      readout.classList.remove('live');
      readout.textContent = IDLE;
    }
    function wire(list, show, isTech){
      list.forEach(function(btn){
        btn.addEventListener('pointerenter', function(){ if (!pinnedTech && !pinnedApp) show(btn); });
        btn.addEventListener('focus',        function(){ show(btn); });
        btn.addEventListener('pointerleave', function(){ if (!pinnedTech && !pinnedApp) rest(); });
        btn.addEventListener('blur',         function(){ rest(); });
        btn.addEventListener('click', function(){
          var already = (isTech ? pinnedTech : pinnedApp) === btn;
          (isTech ? techs : apps).forEach(function(b){ b.classList.remove('pinned'); });
          pinnedTech = null; pinnedApp = null;
          if (!already) {
            btn.classList.add('pinned');
            if (isTech) pinnedTech = btn; else pinnedApp = btn;
          }
          rest();
        });
      });
    }
    wire(techs, showTech, true);
    wire(apps,  showApp,  false);

    var cascade = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting) return;
      cascade.disconnect();
      if (R) { stk.classList.add('in'); return; }
      techs.forEach(function(t,i){ t.style.transitionDelay = (i * 22) + 'ms'; });
      stk.classList.add('in');
      setTimeout(function(){
        techs.forEach(function(t){ t.style.transitionDelay = '0ms'; });
      }, techs.length * 22 + 500);
    }, { threshold:.15 });
    cascade.observe(stk);
  })();

  /* ── store reviews ── */
  (function(){
    var rev = $('#rev');
    if (!rev) return;
    var DATA = {
      ios: {
        score:'4.9', count:'12,480 ratings', hist:[92,6,1,0.5,0.5],
        rows:[
          { s:5, t:'Worth the price on the first scroll', d:'2 weeks ago', v:'v3.1.0',
            b:"Finally a wallpaper app that doesn't paywall the good ones on the first tap. Depth effect actually works with my clock.",
            m:'WallHub \u00b7 App Store \u00b7 United States' },
          { s:5, t:'The deep voice sounds like a person', d:'1 month ago', v:'v2.4.0',
            b:"I've tried six of these. This is the only one where it doesn't sound like a broken speaker.",
            m:'Voxa \u00b7 App Store \u00b7 United Kingdom',
            r:"Thanks \u2014 the formant stage was the whole reason we rebuilt the engine. More presets landing in 2.5." },
          { s:5, t:'Cleared 14GB in one pass', d:'3 weeks ago', v:'v1.8.2',
            b:'Found duplicates going back four years that Photos never flagged. No subscription nag every time I open it.',
            m:'Cleanify \u00b7 App Store \u00b7 Canada' }
        ]
      },
      and: {
        score:'4.7', count:'8,910 ratings', hist:[83,12,3,1,1],
        rows:[
          { s:5, t:'Got paid the same day', d:'5 days ago', v:'v4.0.1',
            b:"Made an invoice on my phone in the car park and got paid the same day. That's the whole review.",
            m:'Invoice Maker \u00b7 Google Play \u00b7 Australia' },
          { s:5, t:'Runs fine on a cheap phone', d:'2 weeks ago', v:'v3.1.0',
            b:'Scrolling is smooth on a three-year-old midrange. Most wallpaper apps choke on mine.',
            m:'WallHub \u00b7 Google Play \u00b7 India' },
          { s:4, t:'Good, wanted more widgets', d:'1 month ago', v:'v2.2.0',
            b:'Tracking is quick and the streak actually motivates me. Would like a smaller home screen widget.',
            m:'WellSum \u00b7 Google Play \u00b7 Germany',
            r:'Fair \u2014 a compact widget size is in the next update. Thanks for flagging it.' }
        ]
      }
    };
    var tabs = document.querySelectorAll('.ptab');
    var pill = $('#ppill'), list = $('#rlist');
    var snum = $('#snum'), scount = $('#scount'), bars = document.querySelectorAll('#hist .hbar i');
    var seen = false, currentP = 'ios';

    function stars(n){ var o=''; for (var i=0;i<n;i++) o += '<i></i>'; return o; }

    function render(p){
      var d = DATA[p];
      snum.textContent = d.score;
      scount.textContent = d.count;
      list.innerHTML = d.rows.map(function(r){
        return '<article class="r">' +
          '<div class="rtop"><span class="rs">' + stars(r.s) + '</span><time>' + r.d + '</time></div>' +
          '<h4 class="rh">' + r.t + '</h4>' +
          '<p class="rb">' + r.b + '</p>' +
          (r.r ? '<div class="reply"><b>BugFix Technologies</b><p>' + r.r + '</p></div>' : '') +
          '<div class="rmeta">' + r.m + ' \u00b7 ' + r.v + '</div>' +
        '</article>';
      }).join('');
      var rows = list.querySelectorAll('.r');
      bars.forEach(function(b){ b.style.width = '0'; });
      requestAnimationFrame(function(){
        d.hist.forEach(function(w,i){
          setTimeout(function(){ bars[i].style.width = w + '%'; }, R ? 0 : 90 + i*70);
        });
        rows.forEach(function(el,i){
          setTimeout(function(){ el.classList.add('on'); }, R ? 0 : 120 + i*90);
        });
      });
    }
    function movePill(btn){
      if (!btn) return;
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + (btn.offsetLeft - 3) + 'px)';
    }
    function select(p){
      currentP = p;
      tabs.forEach(function(t){
        var on = t.dataset.p === p;
        t.setAttribute('aria-selected', String(on));
        if (on) movePill(t);
      });
      render(p);
    }
    tabs.forEach(function(t){ t.addEventListener('click', function(){ select(t.dataset.p); }); });
    window.addEventListener('resize', function(){
      movePill(document.querySelector('.ptab[aria-selected="true"]'));
    });
    select('ios');
    bars.forEach(function(b){ b.style.width = '0'; });

    var ob = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting || seen) return;
      seen = true; ob.disconnect();
      render(currentP);
      movePill(document.querySelector('.ptab[aria-selected="true"]'));
    }, { threshold:.2 });
    ob.observe(rev);
  })();

  /* ── questions ── */
  (function(){
    var qa = $('#qa');
    if (!qa) return;
    var qs = Array.prototype.slice.call(document.querySelectorAll('#qlist .q'));
    var panel = $('#apanel'), fig = $('#afig'), unit = $('#aunit'), text = $('#atext');
    var A = [
      { f:'4\u201315', u:'weeks, depending on what the app needs',
        t:'Scope and prototype are weeks, not months. A small utility lands near the bottom of that range; a build with audio, billing and a backend sits near the top. Either way you see a TestFlight or internal-test build every two weeks.' },
      { f:'150+', u:'apps currently in our hands',
        t:"No \u2014 the portfolio is ours, but the same team takes client work. With that many apps in flight, you don't pay us to learn the stores on your budget." },
      { f:'3', u:'updates after launch, included',
        t:'Listing, ASO, review responses and the first three updates are part of ship. Launch day is not the finish.' },
      { f:'1', u:'working day to hear back',
        t:"California, USA. If the work isn't a fit we'll say so instead of billing you to find out." }
    ];
    var active = -1;
    function show(i){
      if (i === active) return;
      active = i;
      qs.forEach(function(b,k){ b.setAttribute('aria-selected', String(k === i)); });
      var d = A[i];
      if (R) { fig.textContent = d.f; unit.textContent = d.u; text.textContent = d.t; return; }
      panel.classList.add('swap');
      setTimeout(function(){
        fig.textContent = d.f; unit.textContent = d.u; text.textContent = d.t;
        panel.classList.remove('swap');
      }, 180);
    }
    qs.forEach(function(b,i){
      b.addEventListener('click', function(){ show(i); });
      b.addEventListener('keydown', function(e){
        var n = e.key === 'ArrowDown' ? i+1 : e.key === 'ArrowUp' ? i-1 : null;
        if (n === null) return;
        e.preventDefault();
        n = (n + qs.length) % qs.length;
        qs[n].focus(); show(n);
      });
    });
    show(0);
  })();

  /* ── start a project: live scope ── */
  (function(){
    var sec = $('#start');
    if (!sec) return;
    var groups = document.querySelectorAll('.opts');
    var wmin = $('#wmin'), wmax = $('#wmax'), sfig = document.querySelector('.sfig');
    var sPlat = $('#s-plat'), sBuilds = $('#s-builds');
    var PLAT = { ios:'iOS', and:'Android', both:'iOS + Android',
                 web:'Website', all:'Apps + website' };
    var lastMin = 4, lastMax = 6;

    function picked(name){
      return Array.prototype.slice.call(
        document.querySelectorAll('.opts[data-group="' + name + '"] .opt.sel'));
    }
    function recalc(){
      var type = picked('type')[0], plat = picked('plat')[0];
      var base = type ? +type.dataset.w : 4;
      var add  = plat ? +plat.dataset.w : 0;
      picked('needs').forEach(function(b){ add += +b.dataset.w; });
      var hi = Math.min(15, Math.max(6, base + 2 + add));
      var lo = Math.max(4, Math.min(base + Math.round(add * .7), hi - 2));
      if (lo !== lastMin || hi !== lastMax) {
        sfig.classList.remove('bump');
        void sfig.offsetWidth;
        if (!R) sfig.classList.add('bump');
        lastMin = lo; lastMax = hi;
      }
      wmin.textContent = lo;
      wmax.textContent = hi;
      sPlat.textContent = plat ? PLAT[plat.dataset.v] : '\u2014';
      sBuilds.textContent = Math.ceil(hi / 2);
    }
    groups.forEach(function(g){
      var multi = g.dataset.multi === 'true';
      g.querySelectorAll('.opt').forEach(function(b){
        b.addEventListener('click', function(){
          if (multi) {
            b.classList.toggle('sel');
          } else {
            g.querySelectorAll('.opt').forEach(function(x){ x.classList.remove('sel'); });
            b.classList.add('sel');
          }
          recalc();
        });
      });
    });
    recalc();

    var send = $('#c-send'), err = $('#c-err');
    var nm = $('#c-name'), mail = $('#c-mail'), msg = $('#c-msg');
    [mail, msg].forEach(function(el){
      el.addEventListener('input', function(){ err.classList.remove('on'); });
    });
    send.addEventListener('click', function(){
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.value.trim()) && msg.value.trim().length > 3;
      err.classList.toggle('on', !ok);
      if (!ok) { mail.focus(); return; }
      var needs = picked('needs').map(function(b){ return b.textContent; });
      var typeBtn = picked('type')[0];
      var body =
        'Platform: ' + sPlat.textContent + '\n' +
        'Build type: ' + (typeBtn ? typeBtn.textContent : '\u2014') + '\n' +
        'Needs: ' + (needs.length ? needs.join(', ') : 'none selected') + '\n' +
        'Scope estimate: ' + wmin.textContent + '\u2013' + wmax.textContent + ' weeks\n\n' +
        msg.value.trim() + '\n\n\u2014 ' + (nm.value.trim() || mail.value.trim());
      window.location.href = 'mailto:support@bugfixtechnologies.com'
        + '?subject=' + encodeURIComponent('New project enquiry')
        + '&body=' + encodeURIComponent(body);
    });
  })();

  /* ── top bar: progress, hide-on-scroll-down, sliding pill, scroll-spy ── */
  (function(){
    var nav = $('#nav'), fill = $('#topfill'), pill = $('#npill');
    var links = Array.prototype.slice.call(document.querySelectorAll('#nlinks a'));
    var burger = $('#burger'), sheet = $('#sheet');
    var lastY = 0, hovering = false;

    function movePill(el, show){
      if (!el) { pill.classList.remove('on'); return; }
      pill.style.width = el.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      pill.classList.toggle('on', show !== false);
    }
    function activeLink(){ return links.filter(function(a){ return a.classList.contains('act'); })[0]; }

    links.forEach(function(a){
      a.addEventListener('pointerenter', function(){ hovering = true; movePill(a); });
      a.addEventListener('focus',        function(){ hovering = true; movePill(a); });
    });
    $('#nlinks').addEventListener('pointerleave', function(){
      hovering = false; movePill(activeLink());
    });

    /* which section is on screen */
    var spy = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if (!e.isIntersecting) return;
        links.forEach(function(a){ a.classList.toggle('act', a.dataset.s === e.target.id); });
        if (!hovering) movePill(activeLink());
      });
    }, { rootMargin:'-45% 0px -50% 0px' });
    ['about','proc','stk','rev','qa','start'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    function onScroll(){
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = (max > 0 ? (y/max)*100 : 0) + '%';
      nav.classList.toggle('stuck', y > 20);
      if (!R) nav.classList.toggle('hide',
        y > 400 && y > lastY + 2 && sheet.hasAttribute('hidden'));
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', function(){ movePill(activeLink()); });
    onScroll();

    /* mobile sheet */
    function setSheet(open){
      sheet.toggleAttribute('hidden', !open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) nav.classList.remove('hide');
    }
    burger.addEventListener('click', function(){
      setSheet(burger.getAttribute('aria-expanded') !== 'true');
    });
    sheet.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ setSheet(false); });
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') setSheet(false);
    });
  })();

  /* ── about: split reveal ── */
  (function(){
    var split = $('#split');
    if (!split) return;
    var ob = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting) return;
      ob.disconnect();
      split.classList.add('in');
    }, { threshold:.25 });
    ob.observe(split);
  })();

  var io = new IntersectionObserver(function(en){
    en.forEach(function(e){ e.isIntersecting ? run() : (timers.forEach(clearTimeout), timers=[]); });
  }, { threshold:.25 });
  io.observe(stage);
})();
