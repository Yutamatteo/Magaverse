/* MAGAVERSE · La stagione come parete di foto.
   Nessun lavoro durante lo scorrimento: un IntersectionObserver segna ogni serata
   come "vista" quando entra (parte l'animazione di entrata, una volta sola).
   La polvere d'oro del Gala gira solo mentre il Gala è sullo schermo. */
(function () {
  'use strict';
  var saga = document.querySelector('[data-saga]');
  if (!saga) return;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var notti = [].slice.call(saga.querySelectorAll('.notte'));

  /* ritardi sparsi per i tasselli, calcolati una volta */
  notti.forEach(function (n) {
    [].forEach.call(n.querySelectorAll('.notte-muro img'), function (img, k) {
      img.style.setProperty('--r', ((k * 7) % 18) * 24 + 'ms');
    });
  });

  if (!('IntersectionObserver' in window) || riduci) {
    notti.forEach(function (n) { n.classList.add('vista'); });
  } else {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('vista'); io.unobserve(v.target); }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.12 });
    notti.forEach(function (n) { io.observe(n); });
  }

  /* polvere d'oro sul sipario del Gala */
  var tela = saga.querySelector('canvas.polvere');
  if (tela && tela.getContext && !riduci) {
    var ctx = tela.getContext('2d'), gr = [], W = 0, Ht = 0, vivo = false, rp = 0, ultimo = 0;
    var nuovo = function (ovunque) {
      return { x: Math.random() * W, y: ovunque ? Math.random() * Ht : Ht + 10, r: .5 + Math.random() * 1.8,
               v: .15 + Math.random() * .5, o: Math.random() * 6.28, f: .2 + Math.random() * .8 };
    };
    var misura = function () {
      var sc = Math.min(window.devicePixelRatio || 1, 1.5);
      W = tela.clientWidth; Ht = tela.clientHeight;
      tela.width = Math.round(W * sc); tela.height = Math.round(Ht * sc);
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      gr = []; for (var i = 0, m = Math.round(Math.min(90, W * Ht / 12000)); i < m; i++) gr.push(nuovo(true));
    };
    var giro = function (t) {
      rp = 0;
      if (t - ultimo > 30) {           /* 30 fotogrammi al secondo bastano per la polvere */
        ultimo = t;
        ctx.clearRect(0, 0, W, Ht);
        for (var i = 0; i < gr.length; i++) {
          var g = gr[i];
          ctx.globalAlpha = (.35 + .65 * Math.abs(Math.sin(t / 900 * g.f + g.o))) * .85;
          ctx.fillStyle = g.r > 1.6 ? '#FFE3A1' : '#E9C77B';
          ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.2832); ctx.fill();
          g.y -= g.v * 2; g.x += Math.sin(t / 1400 + g.o) * .4; if (g.y < -10) gr[i] = nuovo(false);
        }
        ctx.globalAlpha = 1;
      }
      if (vivo) rp = requestAnimationFrame(giro);
    };
    misura();
    window.addEventListener('resize', misura);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (v) {
        vivo = v[0].isIntersecting;
        if (vivo && !rp) rp = requestAnimationFrame(giro);
      }).observe(tela);
    }
  }
})();

/* conto alla rovescia del Gala (solo la data di Capodanno: il resto è ancora segreto).
   Un aggiornamento al secondo; le cifre ruotano solo quando il Gala è sullo schermo. */
(function () {
  var c = document.querySelector('[data-conto]');
  if (!c) return;
  var riduci = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* cifre che ruotano: ogni cifra cambiata scende via e la nuova arriva dall'alto (solo transform/opacity) */
  var mvCifre = function (el, testo, anima) {
    if (el.getAttribute('data-v') === testo) return;
    var celle = el.querySelectorAll('.cf-cella');
    if (!anima || celle.length !== testo.length) {
      el.textContent = '';
      for (var i = 0; i < testo.length; i++) {
        var c = document.createElement('span'); c.className = 'cf-cella';
        var s = document.createElement('span'); s.className = 'cf'; s.textContent = testo[i];
        c.appendChild(s); el.appendChild(c);
      }
    } else {
      var prima = el.getAttribute('data-v');
      for (var k = 0; k < testo.length; k++) {
        if (prima[k] === testo[k]) continue;
        var cella = celle[k];
        [].forEach.call(cella.querySelectorAll('.esce'), function (x) { x.remove(); });
        var vecchia = cella.lastElementChild;
        if (vecchia) {
          vecchia.className = 'cf esce';
          vecchia.addEventListener('animationend', function () { this.remove(); });
        }
        var nuova = document.createElement('span'); nuova.className = 'cf entra'; nuova.textContent = testo[k];
        cella.appendChild(nuova);
      }
    }
    el.setAttribute('data-v', testo);
  };

  var fine = new Date(c.dataset.conto).getTime(), visibile = false;
  var u = { g: c.querySelector('[data-u="g"]'), h: c.querySelector('[data-u="h"]'), m: c.querySelector('[data-u="m"]') };
  function tic(anima) {
    var d = Math.max(0, fine - Date.now()), m = Math.floor(d / 60000);
    var a = anima && visibile && !riduci && !document.hidden;
    mvCifre(u.g, String(Math.floor(m / 1440)), a);
    mvCifre(u.h, String(Math.floor(m / 60) % 24), a);
    mvCifre(u.m, String(m % 60), a);
  }
  tic(false); setInterval(function () { tic(true); }, 1000);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) { visibile = v[0].isIntersecting; }).observe(c);
  } else { visibile = true; }
})();
