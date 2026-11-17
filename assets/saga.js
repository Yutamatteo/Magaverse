/* MAGAVERSE · La stagione come un unico muro di foto.
   Scorrendo, il muro si sposta sulla serata di cui stai leggendo e la accende;
   le altre restano in ombra. Alla fine il sipario del Gala copre tutto. */
(function () {
  'use strict';
  var saga = document.querySelector('[data-saga]');
  if (!saga) return;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pannelli = [].slice.call(saga.querySelectorAll('.saga-pannello'));
  var voci = [].slice.call(saga.querySelectorAll('.saga-mappa li'));
  var scene = [].slice.call(saga.querySelectorAll('.scena[data-pannello]'));
  var parete = saga.querySelector('.parete');
  var colonne = parete ? [].slice.call(parete.children) : [];
  var gruppi = pannelli.filter(function (p) { return +p.dataset.g >= 0; }).length;
  var n = pannelli.length, attiva = -1, raf = 0, altG = 0;

  /* centro verticale (nel muro) di ogni serata, misurato sulla colonna centrale */
  var centri = [];
  function misura() {
    if (!parete) return;
    var col = colonne[Math.min(2, colonne.length - 1)];
    if (window.innerWidth <= 760) col = colonne[1];
    centri = [];
    for (var g = 0; g < gruppi; g++) {
      var imgs = col.querySelectorAll('img[data-g="' + g + '"]');
      if (!imgs.length) continue;
      var a = imgs[0], b = imgs[imgs.length - 1];
      centri[g] = col.offsetTop + (a.offsetTop + b.offsetTop + b.offsetHeight) / 2;
    }
    altG = centri.length > 1 ? centri[1] - centri[0] : 0;
  }

  function aggiorna() {
    raf = 0;
    var H = window.innerHeight;
    var f = Math.max(0, Math.min(n - 1, -pannelli[0].getBoundingClientRect().top / H));
    var ora = Math.min(n - 1, Math.round(f));
    if (parete && altG) {
      var fg = Math.min(f, gruppi - 1), i0 = Math.floor(fg), i1 = Math.min(gruppi - 1, i0 + 1);
      var c = centri[i0] + (centri[i1] - centri[i0]) * (fg - i0);
      parete.style.setProperty('--y', (H / 2 - c).toFixed(1) + 'px');
      parete.style.setProperty('--dy', (f * 26).toFixed(1) + 'px');
    }
    scene.forEach(function (s) {
      var k = +s.dataset.pannello;
      s.style.setProperty('--p', Math.max(0, Math.min(1, (f - k + 1) / 2)).toFixed(3));
    });
    if (ora !== attiva) {
      attiva = ora;
      var g = +pannelli[ora].dataset.g;
      if (parete && g >= 0) parete.dataset.ora = g;
      scene.forEach(function (s) { s.classList.toggle('on', +s.dataset.pannello === ora); });
      saga.style.setProperty('--tinta', getComputedStyle(pannelli[ora]).getPropertyValue('--tinta'));
      voci.forEach(function (v, j) { v.classList.toggle('ora', j === ora); });
    }
  }
  function chiedi() { if (!raf) raf = requestAnimationFrame(aggiorna); }
  window.addEventListener('scroll', chiedi, { passive: true });
  window.addEventListener('resize', function () { misura(); chiedi(); });
  window.addEventListener('load', function () { misura(); chiedi(); });
  misura(); aggiorna();

  voci.forEach(function (v, j) {
    v.addEventListener('click', function () {
      window.scrollTo({ top: pannelli[j].getBoundingClientRect().top + window.scrollY, behavior: riduci ? 'auto' : 'smooth' });
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
        var ok = scenaGala.classList.contains('on');
        if (ok && !vivo) { vivo = true; if (!rp2) rp2 = requestAnimationFrame(giro); }
        else if (!ok) vivo = false;
      }, 400);
    }
  }
})();
/* conto alla rovescia del Gala (solo la data di Capodanno: il resto è ancora segreto) */
(function () {
  var c = document.querySelector('[data-conto]');
  if (!c) return;
  var fine = new Date(c.dataset.conto).getTime();
  function tic() {
    var d = Math.max(0, fine - Date.now()), m = Math.floor(d / 60000);
    c.querySelector('[data-u="g"]').textContent = Math.floor(m / 1440);
    c.querySelector('[data-u="h"]').textContent = Math.floor(m / 60) % 24;
    c.querySelector('[data-u="m"]').textContent = m % 60;
  }
  tic(); setInterval(tic, 30000);
})();
