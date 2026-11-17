/* MAGA GALA · sipario, polvere d'oro e conto alla rovescia */
(function () {
  'use strict';
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

  /* ---------- conto alla rovescia: un aggiornamento al secondo, animato solo se si vede ---------- */
  var conto = document.querySelector('[data-conto]');
  if (conto) {
    var meta = new Date(conto.dataset.a).getTime();
    var u = {};
    ['g', 'o', 'm', 's'].forEach(function (k) { u[k] = conto.querySelector('[data-u="' + k + '"]'); });
    var due = function (n) { return (n < 10 ? '0' : '') + n; };
    var visibile = true;
    var segna = function (anima) {
      var d = Math.max(0, Math.floor((meta - Date.now()) / 1000));
      var a = anima && visibile && !riduci && !document.hidden;
      mvCifre(u.g, String(Math.floor(d / 86400)), a);
      mvCifre(u.o, due(Math.floor(d % 86400 / 3600)), a);
      mvCifre(u.m, due(Math.floor(d % 3600 / 60)), a);
      mvCifre(u.s, due(d % 60), a);
    };
    segna(false); setInterval(function () { segna(true); }, 1000);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (v) { visibile = v[0].isIntersecting; }).observe(conto);
    }
  }

  /* ---------- sipario guidato dallo scroll ---------- */
  var sipario = document.querySelector('[data-sipario]');
  if (sipario && !riduci) {
    var corrente = 0.22, obiettivo = 0.22, raf = 0;
    var leggi = function () {
      var r = sipario.getBoundingClientRect();
      var corsa = r.height - window.innerHeight;
      var p = corsa > 40 ? Math.min(1, Math.max(0, -r.top / corsa)) : 0;
      obiettivo = 0.22 + p * 0.78;
      if (!raf) raf = requestAnimationFrame(passo);
    };
    var passo = function () {
      raf = 0;
      corrente += (obiettivo - corrente) * 0.14;
      if (Math.abs(obiettivo - corrente) < 0.001) corrente = obiettivo;
      sipario.style.setProperty('--apri', corrente.toFixed(4));
      if (corrente !== obiettivo) raf = requestAnimationFrame(passo);
    };
    /* all'arrivo il sipario parte chiuso e si socchiude */
    sipario.style.setProperty('--apri', '0');
    corrente = 0;
    setTimeout(leggi, 350);
    window.addEventListener('scroll', leggi, { passive: true });
    window.addEventListener('resize', leggi);
  }

  /* ---------- polvere d'oro ---------- */
  var tela = document.querySelector('[data-polvere]');
  if (!tela || !tela.getContext) return;
  var ctx = tela.getContext('2d');
  var granelli = [], W = 0, H = 0, scala = 1;
  function misura() {
    scala = Math.min(window.devicePixelRatio || 1, 2);
    W = tela.clientWidth; H = tela.clientHeight;
    tela.width = Math.round(W * scala); tela.height = Math.round(H * scala);
    ctx.setTransform(scala, 0, 0, scala, 0, 0);
    var n = Math.round(Math.min(140, W * H / 9000));
    granelli = [];
    for (var i = 0; i < n; i++) granelli.push(nuovo(true));
  }
  function nuovo(ovunque) {
    return {
      x: Math.random() * W,
      y: ovunque ? Math.random() * H : H + 10,
      r: 0.5 + Math.random() * 1.8,
      v: 0.15 + Math.random() * 0.5,
      o: Math.random() * Math.PI * 2,
      f: 0.2 + Math.random() * 0.8
    };
  }
  function disegna(t) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < granelli.length; i++) {
      var g = granelli[i];
      var luce = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 * g.f + g.o));
      ctx.globalAlpha = luce * 0.85;
      ctx.fillStyle = g.r > 1.6 ? '#FFE3A1' : '#E9C77B';
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.2832); ctx.fill();
      if (!riduci) {
        g.y -= g.v; g.x += Math.sin(t / 1400 + g.o) * 0.25;
        if (g.y < -10) granelli[i] = nuovo(false);
      }
    }
    ctx.globalAlpha = 1;
  }
  var vivo = true, rafP = 0;
  function giro(t) { rafP = 0; disegna(t); if (vivo && !riduci) rafP = requestAnimationFrame(giro); }
  misura();
  disegna(0);
  if (riduci) return;
  rafP = requestAnimationFrame(giro);
  window.addEventListener('resize', function () { misura(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) {
      vivo = v[0].isIntersecting;
      if (vivo && !rafP) rafP = requestAnimationFrame(giro);
    }).observe(tela);
  }
})();
