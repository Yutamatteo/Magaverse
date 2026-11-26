/* =========================================================
   MAGAVERSE · MOVIMENTO
   Piccolo motore senza librerie. Si attiva con attributi:
     data-rise            titolo: le parole salgono da sotto
     data-reveal          comparsa allo scroll ("foto", "carta")
     data-reveal-gruppo   i figli con data-reveal entrano in fila
     data-parallax="0.1"  l'immagine scorre più lenta della pagina
     data-tilt            la card si inclina verso il puntatore
                          (sul telefono segue lo scroll)
     data-luci            <svg> che diventa un filo di lampadine
     data-conta           numero che sale fino al suo valore
     data-nastro          nastro: accelera con lo scroll
     data-binario         fila orizzontale: la card al centro avanza
     data-barra           barra in alto: diventa piena dopo lo scroll
   Con "movimento ridotto" resta tutto fermo e visibile.
   ========================================================= */
(function () {
  'use strict';
  var radice = document.documentElement;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var tutti = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  window.__mvOk = true;

  /* ---------- parole che salgono ---------- */
  function spezza(el) {
    if (el.classList.contains('mv-spezzato')) return;
    var i = 0;
    (function scendi(nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parti = n.textContent.split(/(\s+)/), pezzi = document.createDocumentFragment();
          parti.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { pezzi.appendChild(document.createTextNode(' ')); return; }
            var fuori = document.createElement('span'); fuori.className = 'mv-p';
            var dentro = document.createElement('span'); dentro.className = 'mv-pi';
            dentro.style.setProperty('--i', i++); dentro.textContent = p;
            fuori.appendChild(dentro); pezzi.appendChild(fuori);
          });
          nodo.replaceChild(pezzi, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { scendi(n); }
      });
    })(el);
    el.classList.add('mv-spezzato');
  }
  if (!riduci) tutti('[data-rise]').forEach(spezza);

  /* ---------- comparsa ---------- */
  tutti('[data-reveal-gruppo]').forEach(function (g) {
    tutti('[data-reveal]', g).forEach(function (el, i) {
      el.style.setProperty('--i', i);
      el.style.setProperty('--verso', i % 2 ? -1 : 1);
    });
  });
  var daVedere = tutti('[data-rise], [data-reveal], .tessera3d');
  function visto(el) { el.classList.add('mv-vista'); }
  if (riduci || !('IntersectionObserver' in window)) {
    daVedere.forEach(visto);
  } else {
    var occhio = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { visto(v.target); occhio.unobserve(v.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    var pronto = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var via = function () { daVedere.forEach(function (el) { occhio.observe(el); }); };
    var scaduto = setTimeout(via, 700);
    pronto.then(function () { clearTimeout(scaduto); window.requestAnimationFrame(via); });
  }

  /* ---------- luci a filo ---------- */
  var COLORI = ['#FFC23D', '#FF6A2B', '#1FB5A6', '#FF4FA3', '#F4EADB'];
  function tendiLuci(svg) {
    var W = svg.clientWidth, H = svg.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var fili = [{ a: [-24, H * 0.16], b: [W + 24, H * 0.34], calo: H * 0.3 }];
    if (W > 760) fili.push({ a: [-24, H * 0.56], b: [W + 24, H * 0.05], calo: H * 0.26 });
    var passo = W < 520 ? 44 : 58, n = 0;
    var out = '<defs>' + COLORI.map(function (c, k) {
      return '<radialGradient id="mv-al' + k + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".95"/><stop offset=".3" stop-color="' + c + '" stop-opacity=".4"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
    }).join('') + '</defs>';
    fili.forEach(function (f) {
      var cx = (f.a[0] + f.b[0]) / 2, cy = (f.a[1] + f.b[1]) / 2 + f.calo * 2;
      out += '<g class="gruppo"><path class="filo" d="M' + f.a[0] + ' ' + f.a[1].toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + f.b[0] + ' ' + f.b[1].toFixed(1) + '"/>';
      var N = Math.max(5, Math.round(W / passo));
      for (var i = 0; i < N; i++) {
        var t = (i + 0.5) / N, u = 1 - t;
        var x = u * u * f.a[0] + 2 * u * t * cx + t * t * f.b[0];
        var y = u * u * f.a[1] + 2 * u * t * cy + t * t * f.b[1];
        var k = n % COLORI.length;
        out += '<g class="lampa" style="--i:' + n + ';--c:' + COLORI[k] + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' +
          '<line y2="6"/><circle class="alone" cy="11" r="19" fill="url(#mv-al' + k + ')"/><circle class="vetro" cy="11" r="4.6"/></g>';
        n++;
      }
      out += '</g>';
    });
    svg.innerHTML = out;
  }
  tutti('svg[data-luci]').forEach(function (svg) {
    tendiLuci(svg);
    var ultimaW = svg.clientWidth, attesa = 0;
    window.addEventListener('resize', function () {
      clearTimeout(attesa);
      attesa = setTimeout(function () { if (Math.abs(svg.clientWidth - ultimaW) > 20) { ultimaW = svg.clientWidth; tendiLuci(svg); } }, 180);
    });
    if (svg.hasAttribute('data-luci-subito')) setTimeout(function () { svg.classList.add('accese'); }, riduci ? 0 : 900);
  });

  /* ---------- barra in alto ---------- */
  var barra = document.querySelector('[data-barra]');
  function aggiornaBarra() { if (barra) barra.classList.toggle('e-piena', window.scrollY > window.innerHeight * 0.9); }

  /* ---------- contatori ---------- */
  function conta(el) {
    var testo = el.textContent, m = testo.match(/[\d.,]+/);
    if (!m) return;
    var fine_ = parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
    if (isNaN(fine_) || riduci) return;
    var pre = testo.slice(0, m.index), post = testo.slice(m.index + m[0].length), t0 = 0, durata = 1300;
    el.textContent = pre + '0' + post;
    function passo(ora) {
      if (!t0) t0 = ora;
      var p = Math.min(1, (ora - t0) / durata), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(fine_ * e).toLocaleString('it-IT') + post;
      if (p < 1) window.requestAnimationFrame(passo);
    }
    window.requestAnimationFrame(passo);
  }
  var contatori = tutti('[data-conta]');
  if (contatori.length && 'IntersectionObserver' in window && !riduci) {
    var occhioC = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { conta(v.target); occhioC.unobserve(v.target); } });
    }, { threshold: 0.6 });
    contatori.forEach(function (el) { occhioC.observe(el); });
  }

  if (riduci) { aggiornaBarra(); window.addEventListener('scroll', aggiornaBarra, { passive: true }); return; }

  /* ---------- tutto ciò che segue lo scroll ---------- */
  /* se il browser sa legare le animazioni allo scorrimento, il parallasse lo fa il CSS
     (sul compositore, gratis); qui resta solo come ripiego per i browser più vecchi */
  var parallasseCSS = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()') && !riduci;
  if (parallasseCSS) document.documentElement.classList.add('mv-parallasse-css');
  var parallassi = parallasseCSS ? [] : tutti('[data-parallax]').map(function (el) { return { el: el, f: parseFloat(el.dataset.parallax) || 0.1, s: el.dataset.scala || '1.14' }; });
  var inclinati = tutti('[data-tilt]');
  /* allo scroll (telefono) si inclinano solo gli elementi che lo mostrano davvero:
     le locandine della home Magaparty si inclinano solo col mouse, quindi misurarle
     a ogni fotogramma era lavoro buttato. La cornice del Gala lo fa il CSS (motion.css). */
  var inclinatiScroll = inclinati.filter(function (el) {
    if (el.classList.contains('mp-evento')) return false;
    if (parallasseCSS && el.classList.contains('ultimo-cornice')) return false;
    return true;
  });
  var nastri = tutti('[data-nastro]');
  var ultimoY = window.scrollY, velocita = 0, raf = 0;

  function sulloScroll() {
    raf = 0;
    var H = window.innerHeight, y = window.scrollY;
    velocita = y - ultimoY; ultimoY = y;
    aggiornaBarra();
    parallassi.forEach(function (p) {
      var r = p.el.parentElement.getBoundingClientRect();
      if (r.bottom < -80 || r.top > H + 80) return;
      var c = (r.top + r.height / 2 - H / 2) / H;
      p.el.style.transform = 'translate3d(0,' + (-c * p.f * 100).toFixed(2) + '%,0) scale(' + p.s + ')';
    });
    if (!fine) {
      inclinatiScroll.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H) return;
        var c = Math.max(-1, Math.min(1, (r.top + r.height / 2 - H / 2) / (H / 2)));
        el.style.setProperty('--rx', (c * 9).toFixed(2));
        el.style.setProperty('--ry', (c * -7).toFixed(2));
        el.style.setProperty('--mx', (0.5 - c * 0.5).toFixed(3));
        el.style.setProperty('--my', (0.5 + c * 0.4).toFixed(3));
      });
    }
    nastri.forEach(function (n) {
      var a = n.__anim || (n.getAnimations ? n.getAnimations()[0] : null);
      if (!a) return; n.__anim = a;
      var spinta = Math.max(-5, Math.min(5, velocita * 0.09));
      a.playbackRate = (spinta < 0 ? -1 : 1) * (1 + Math.abs(spinta));
      clearTimeout(n.__calma);
      n.__calma = setTimeout(function () { a.playbackRate = 1; }, 220);
    });
  }
  function chiedi() { if (!raf) raf = window.requestAnimationFrame(sulloScroll); }
  window.addEventListener('scroll', chiedi, { passive: true });
  window.addEventListener('resize', chiedi);
  sulloScroll();

  /* ---------- inclinazione col puntatore ---------- */
  if (fine) {
    inclinati.forEach(function (el) {
      var forza = parseFloat(el.dataset.tilt) || 9;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('mv-in-mano');
        el.style.setProperty('--rx', ((0.5 - y) * forza).toFixed(2));
        el.style.setProperty('--ry', ((x - 0.5) * forza * 1.2).toFixed(2));
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('mv-in-mano');
        el.style.setProperty('--rx', 0); el.style.setProperty('--ry', 0);
        el.style.setProperty('--mx', 0.5); el.style.setProperty('--my', 0.5);
      });
    });
  }

  /* ---------- MagaCard col giroscopio (solo telefono) ----------
     Un solo elemento (la prima .tessera3d). I sensori scrivono solo due numeri; lo stile
     si aggiorna al massimo una volta per fotogramma. Ascolto spento quando la tessera
     esce dallo schermo o la scheda è nascosta. Su iPhone serve un tocco sulla tessera
     per chiedere il permesso; finché non c'è, resta l'inclinazione con lo scroll. */
  var tessGiro = document.querySelector('.tessera3d');
  if (tessGiro && !fine && !riduci && 'DeviceOrientationEvent' in window && 'IntersectionObserver' in window) {
    var serveOk = typeof DeviceOrientationEvent.requestPermission === 'function';
    /* si ascolta subito: dove il permesso non serve (Android) i dati arrivano da soli,
       su iPhone non arriva nulla finché non si tocca la tessera */
    var permesso = true, chiesto = false, ascolta = false, inVista = false, rafG = 0;
    var beta = null, gamma = 0, beta0 = null, gx = 0, gy = 0, presa = false;
    var sulSensore = function (e) {
      if (e.beta == null) return;
      beta = e.beta; gamma = e.gamma || 0;
      if (!presa) { /* primo dato vero: da qui la tessera la muove il telefono, non lo scroll */
        presa = true;
        inclinatiScroll = inclinatiScroll.filter(function (el) { return el !== tessGiro; });
        tessGiro.classList.add('mv-in-mano');
      }
      if (beta0 === null) beta0 = beta;
      if (!rafG) rafG = window.requestAnimationFrame(muoviTessera);
    };
    var muoviTessera = function () {
      rafG = 0;
      if (beta === null) return;
      beta0 += (beta - beta0) * 0.01; /* il "dritto" segue piano come tieni il telefono */
      var tx = Math.max(-1, Math.min(1, (beta - beta0) / 25));
      var ty = Math.max(-1, Math.min(1, gamma / 25));
      gx += (tx - gx) * 0.25; gy += (ty - gy) * 0.25;
      tessGiro.style.setProperty('--rx', (-gx * 12).toFixed(2));
      tessGiro.style.setProperty('--ry', (gy * 14).toFixed(2));
      tessGiro.style.setProperty('--mx', (0.5 + gy * 0.45).toFixed(3));
      tessGiro.style.setProperty('--my', (0.5 + gx * 0.4).toFixed(3));
    };
    var accendi = function (si) {
      si = si && permesso && inVista && !document.hidden;
      if (si === ascolta) return;
      ascolta = si;
      if (si) {
        beta0 = null;
        window.addEventListener('deviceorientation', sulSensore, { passive: true });
      } else {
        window.removeEventListener('deviceorientation', sulSensore);
        if (rafG) { window.cancelAnimationFrame(rafG); rafG = 0; }
      }
    };
    new IntersectionObserver(function (v) { inVista = v[0].isIntersecting; accendi(true); }).observe(tessGiro);
    document.addEventListener('visibilitychange', function () { accendi(true); });
    if (serveOk) {
      tessGiro.addEventListener('click', function () {
        if (chiesto || presa) return;
        chiesto = true;
        DeviceOrientationEvent.requestPermission().then(function (r) {
          if (r === 'granted') { ascolta = false; accendi(true); }
        }).catch(function () { chiesto = false; });
      });
    }
  }

  /* ---------- fila orizzontale: la card al centro avanza ---------- */
  tutti('[data-binario]').forEach(function (binario) {
    var carte = Array.prototype.slice.call(binario.children), rafB = 0;
    function metti() {
      rafB = 0;
      if (binario.scrollWidth <= binario.clientWidth + 4) { carte.forEach(function (c) { c.style.removeProperty('--d'); }); return; }
      var r = binario.getBoundingClientRect(), centro = r.left + r.width / 2;
      carte.forEach(function (c) {
        var cr = c.getBoundingClientRect();
        var d = Math.max(-1, Math.min(1, (cr.left + cr.width / 2 - centro) / r.width));
        c.style.setProperty('--d', d.toFixed(3));
        c.style.setProperty('--ad', Math.abs(d).toFixed(3));
      });
    }
    binario.addEventListener('scroll', function () { if (!rafB) rafB = window.requestAnimationFrame(metti); }, { passive: true });
    window.addEventListener('resize', metti);
    metti();
  });
})();
