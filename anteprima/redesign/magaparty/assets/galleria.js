/* Galleria: filtri per serata e visore (frecce, tastiera, swipe, Esc per chiudere). */
(function () {
  'use strict';
  var griglia = document.querySelector('.gal-griglia');
  if (!griglia) return;
  var foto = [].slice.call(griglia.querySelectorAll('button'));
  var filtri = [].slice.call(document.querySelectorAll('.gal-filtri button'));
  filtri.forEach(function (b) {
    b.addEventListener('click', function () {
      var s = b.dataset.serata;
      filtri.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      foto.forEach(function (f) { f.hidden = s !== 'tutte' && f.dataset.serata !== s; });
    });
  });

  var chiesta = new URLSearchParams(location.search).get('serata');
  filtri.forEach(function (b) { if (b.dataset.serata === chiesta) b.click(); });

  var v = document.createElement('div');
  v.className = 'gal-visore'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Foto a tutto schermo');
  v.innerHTML = '<img alt=""><p></p><button class="gal-chiudi" aria-label="Chiudi">✕</button><button class="gal-prima" aria-label="Foto precedente">‹</button><button class="gal-dopo" aria-label="Foto successiva">›</button>';
  document.body.appendChild(v);
  var img = v.querySelector('img'), dida = v.querySelector('p'), ora = 0, da = null;
  function visibili() { return foto.filter(function (f) { return !f.hidden; }); }
  function mostra(f) {
    var l = visibili(); ora = l.indexOf(f);
    img.src = f.dataset.grande; img.alt = f.querySelector('img').alt;
    dida.textContent = f.dataset.nome + ' · ' + (ora + 1) + ' di ' + l.length;
  }
  function apri(f) { da = document.activeElement; mostra(f); v.classList.add('aperto'); v.querySelector('.gal-chiudi').focus(); document.documentElement.style.overflow = 'hidden'; }
  function chiudi() { v.classList.remove('aperto'); document.documentElement.style.overflow = ''; if (da) da.focus(); }
  function passo(d) { var l = visibili(); mostra(l[(ora + d + l.length) % l.length]); }
  foto.forEach(function (f) { f.addEventListener('click', function () { apri(f); }); });
  v.querySelector('.gal-chiudi').addEventListener('click', chiudi);
  v.querySelector('.gal-prima').addEventListener('click', function () { passo(-1); });
  v.querySelector('.gal-dopo').addEventListener('click', function () { passo(1); });
  v.addEventListener('click', function (e) { if (e.target === v) chiudi(); });
  document.addEventListener('keydown', function (e) {
    if (!v.classList.contains('aperto')) return;
    if (e.key === 'Escape') chiudi(); else if (e.key === 'ArrowLeft') passo(-1); else if (e.key === 'ArrowRight') passo(1);
  });
  var x0 = null;
  v.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  v.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) passo(dx < 0 ? 1 : -1); x0 = null; });
})();
