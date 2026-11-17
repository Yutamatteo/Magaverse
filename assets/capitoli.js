/* MAGAVERSE · capitoli a tutto schermo: scrive --p (0 → 1) mentre si scorre,
   fa "scattare" il lampo nel capitolo di Halloween e la polvere d'oro nel Gala. */
(function () {
  'use strict';
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var capitoli = Array.prototype.slice.call(document.querySelectorAll('[data-capitolo]'));
  if (!capitoli.length) return;

  if (!riduci) {
    var raf = 0;
    var aggiorna = function () {
      raf = 0;
      var H = window.innerHeight;
      capitoli.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.bottom < -H || r.top > 2 * H) return;
        var corsa = r.height - H;
        var p = corsa > 40 ? (-r.top) / corsa : (H - r.top) / (H + r.height);
        p = Math.max(0, Math.min(1, p));
        c.style.setProperty('--p', p.toFixed(4));
        var lampo = c.querySelector('.cap-lampo');
        if (lampo) {
          var passo = Math.floor(p * 7);
          if (c.__passo !== undefined && passo !== c.__passo && lampo.animate) {
            lampo.animate([{ opacity: .55 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' });
          }
          c.__passo = passo;
        }
      });
    };
    var chiedi = function () { if (!raf) raf = requestAnimationFrame(aggiorna); };
    window.addEventListener('scroll', chiedi, { passive: true });
    window.addEventListener('resize', chiedi);
    aggiorna();
  }

  /* polvere d'oro (solo nel capitolo del Gala) */
  capitoli.forEach(function (c) {
    var tela = c.querySelector('canvas.polvere');
    if (!tela || !tela.getContext) return;
    var ctx = tela.getContext('2d'), granelli = [], W = 0, H = 0, vivo = false, rafP = 0;
    var nuovo = function (ovunque) {
      return { x: Math.random() * W, y: ovunque ? Math.random() * H : H + 10, r: .5 + Math.random() * 1.8,
               v: .15 + Math.random() * .5, o: Math.random() * 6.28, f: .2 + Math.random() * .8 };
    };
    var misura = function () {
      var s = Math.min(window.devicePixelRatio || 1, 2);
      W = tela.clientWidth; H = tela.clientHeight;
      tela.width = Math.round(W * s); tela.height = Math.round(H * s);
      ctx.setTransform(s, 0, 0, s, 0, 0);
      granelli = []; for (var i = 0, n = Math.round(Math.min(130, W * H / 9000)); i < n; i++) granelli.push(nuovo(true));
    };
    var disegna = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < granelli.length; i++) {
        var g = granelli[i];
        ctx.globalAlpha = (.35 + .65 * Math.abs(Math.sin(t / 900 * g.f + g.o))) * .85;
        ctx.fillStyle = g.r > 1.6 ? '#FFE3A1' : '#E9C77B';
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.2832); ctx.fill();
        if (!riduci) { g.y -= g.v; g.x += Math.sin(t / 1400 + g.o) * .25; if (g.y < -10) granelli[i] = nuovo(false); }
      }
      ctx.globalAlpha = 1;
    };
    var giro = function (t) { rafP = 0; disegna(t); if (vivo) rafP = requestAnimationFrame(giro); };
    misura(); disegna(0);
    window.addEventListener('resize', misura);
    if (riduci || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (v) { vivo = v[0].isIntersecting; if (vivo && !rafP) rafP = requestAnimationFrame(giro); }).observe(c);
  });
})();
