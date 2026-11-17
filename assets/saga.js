/* MAGAVERSE · La stagione come un unico grande sfondo.
   Per ogni pannello di testo c'è una scena nello sfondo fisso. Mentre il pannello sale,
   la sua scena entra dal basso esattamente sotto il suo bordo superiore (--in), poi
   scorre al suo interno (--p: 0 → 1). Le scene già coperte vengono nascoste. */
(function () {
  'use strict';
  var saga = document.querySelector('[data-saga]');
  if (!saga) return;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scene = [].slice.call(saga.querySelectorAll('.scena'));
  var pannelli = [].slice.call(saga.querySelectorAll('.saga-pannello'));
  var voci = [].slice.call(saga.querySelectorAll('.saga-mappa li'));
  var n = Math.min(scene.length, pannelli.length);
  var attiva = -1, raf = 0;

  /* le foto di ogni scena: quale è "su" dipende da quanto hai scorso nel pannello */
  scene.forEach(function (s) { s.__foto = [].slice.call(s.querySelectorAll('.scena-foto img')); s.__k = -1; });

  function lampo(s, p) {
    var l = s.querySelector('.cap-lampo');
    if (!l || riduci) return;
    var passo = Math.floor(p * 7);
    if (s.__passo !== undefined && passo !== s.__passo && l.animate) l.animate([{ opacity: .5 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' });
    s.__passo = passo;
  }

  function aggiorna() {
    raf = 0;
    var H = window.innerHeight, ora = 0;
    for (var i = 0; i < n; i++) {
      var r = pannelli[i].getBoundingClientRect(), s = scene[i];
      var dentro = Math.max(0, Math.min(H, r.top));           /* bordo della scena che entra */
      var corsa = Math.max(1, r.height - H);
      var p = Math.max(0, Math.min(1, -r.top / corsa));
      if (r.top < H * .55) ora = i;
      if (i > 0) {
        s.style.setProperty('--in', (dentro / H * 100).toFixed(3) + '%');
        s.style.setProperty('--bordo', dentro > 2 && dentro < H - 2 ? '.9' : '0');
      }
      s.style.setProperty('--p', p.toFixed(4));
      var fs = s.__foto;
      if (fs.length) {
        var k = Math.min(fs.length - 1, Math.floor(p * fs.length * .999));
        if (k !== s.__k) { fs.forEach(function (f, j) { f.classList.toggle('su', j === k); }); s.__k = k; }
      }
      lampo(s, p);
    }
    /* visibili solo la scena che copre lo schermo e quella che sta entrando */
    for (var j = 0; j < n; j++) {
      var su = scene[j], rp = pannelli[j].getBoundingClientRect();
      var coperta = j + 1 < n && pannelli[j + 1].getBoundingClientRect().top <= 0;
      var arrivata = j === 0 || rp.top < H;
      su.classList.toggle('viva', arrivata && !coperta);
    }
    if (ora !== attiva) {
      attiva = ora;
      saga.style.setProperty('--tinta', getComputedStyle(pannelli[ora]).getPropertyValue('--tinta'));
      voci.forEach(function (v, j) { v.classList.toggle('ora', j === ora); v.classList.toggle('fatta', j < ora); });
    }
  }
  function chiedi() { if (!raf) raf = requestAnimationFrame(aggiorna); }
  window.addEventListener('scroll', chiedi, { passive: true });
  window.addEventListener('resize', chiedi);
  aggiorna();

  /* toccando una voce della striscia si va a quella serata */
  voci.forEach(function (v, j) {
    v.addEventListener('click', function () {
      var t = pannelli[j].getBoundingClientRect().top + window.scrollY + 2;
      window.scrollTo({ top: t, behavior: riduci ? 'auto' : 'smooth' });
    });
  });

  /* polvere d'oro sul sipario del Gala */
  var tela = saga.querySelector('canvas.polvere');
  if (tela && tela.getContext) {
    var ctx = tela.getContext('2d'), gr = [], W = 0, Ht = 0, vivo = false, rp2 = 0;
    var nuovo = function (ovunque) {
      return { x: Math.random() * W, y: ovunque ? Math.random() * Ht : Ht + 10, r: .5 + Math.random() * 1.8,
               v: .15 + Math.random() * .5, o: Math.random() * 6.28, f: .2 + Math.random() * .8 };
    };
    var misura = function () {
      var sc = Math.min(window.devicePixelRatio || 1, 2);
      W = tela.clientWidth; Ht = tela.clientHeight;
      tela.width = Math.round(W * sc); tela.height = Math.round(Ht * sc);
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      gr = []; for (var i = 0, m = Math.round(Math.min(130, W * Ht / 9000)); i < m; i++) gr.push(nuovo(true));
    };
    var disegna = function (t) {
      ctx.clearRect(0, 0, W, Ht);
      for (var i = 0; i < gr.length; i++) {
        var g = gr[i];
        ctx.globalAlpha = (.35 + .65 * Math.abs(Math.sin(t / 900 * g.f + g.o))) * .85;
        ctx.fillStyle = g.r > 1.6 ? '#FFE3A1' : '#E9C77B';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.2832); ctx.fill();
        if (!riduci) { g.y -= g.v; g.x += Math.sin(t / 1400 + g.o) * .25; if (g.y < -10) gr[i] = nuovo(false); }
      }
      ctx.globalAlpha = 1;
    };
    var giro = function (t) { rp2 = 0; disegna(t); if (vivo) rp2 = requestAnimationFrame(giro); };
    misura(); disegna(0);
    window.addEventListener('resize', misura);
    var scenaGala = tela.closest('.scena');
    if (!riduci && 'IntersectionObserver' in window) {
      setInterval(function () {
        var ok = scenaGala.classList.contains('viva');
        if (ok && !vivo) { vivo = true; if (!rp2) rp2 = requestAnimationFrame(giro); }
        else if (!ok) vivo = false;
      }, 400);
    }
  }
})();
