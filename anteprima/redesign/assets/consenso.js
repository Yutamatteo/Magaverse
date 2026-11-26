/* Consenso cookie (Garante 10/06/2021). Nessuna libreria.
   Scelta in localStorage "mv_consenso" = {v:1, marketing:bool, data:ISO}, richiesta di nuovo dopo 6 mesi.
   Il Meta Pixel si carica SOLO se marketing=true. API: window.mvConsenso = {marketing, apri, quando}. */
(function () {
  'use strict';
  var CHIAVE = 'mv_consenso', PIXEL_ID = '1205712864989093', MESI = 6;
  var ascoltatori = [], pixelCaricato = false, banner = null, dialogo = null, ultimoFocus = null;

  function leggi() {
    try {
      var s = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
      if (!s || s.v !== 1 || typeof s.marketing !== 'boolean') return null;
      var d = new Date(s.data); if (isNaN(d)) return null;
      var scad = new Date(d); scad.setMonth(scad.getMonth() + MESI);
      return scad > new Date() ? s : null;
    } catch (e) { return null; }
  }
  function salva(marketing) {
    var prima = leggi();
    try { localStorage.setItem(CHIAVE, JSON.stringify({ v: 1, marketing: !!marketing, data: new Date().toISOString() })); } catch (e) {}
    if (!marketing && (pixelCaricato || (prima && prima.marketing))) {
      try { if (window.fbq) window.fbq('consent', 'revoke'); } catch (e) {}
    }
    applica();
    ascoltatori.forEach(function (cb) { try { cb(!!marketing); } catch (e) {} });
  }

  function caricaPixel() {
    if (pixelCaricato) return;
    pixelCaricato = true;
    var f = window, b = document, n;
    if (!f.fbq) {
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      var t = b.createElement('script'); t.async = true; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      b.head.appendChild(t);
    }
    f.fbq('init', PIXEL_ID);
    f.fbq('track', 'PageView');
  }
  function applica() { var s = leggi(); if (s && s.marketing) caricaPixel(); }

  window.mvConsenso = {
    marketing: function () { var s = leggi(); return !!(s && s.marketing); },
    apri: function () { mostraPreferenze(); },
    quando: function (cb) {
      if (typeof cb !== 'function') return;
      ascoltatori.push(cb);
      var s = leggi(); if (s) { try { cb(s.marketing); } catch (e) {} }
    }
  };

  // ---- interfaccia ----
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = (document.currentScript && document.currentScript.src || '/anteprima/redesign/assets/consenso.js').replace(/consenso\.js.*$/, 'consenso.css');
  document.head.appendChild(css);

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html; // solo testi fissi scritti qui, mai dati utente
    return e;
  }
  function radice() { var m = document.querySelector('script[src*="consenso.js"]'); return m ? m.src.split('assets/consenso.js')[0] : '/'; } // niente regex qui: build_preview.py riscrive i percorsi che iniziano con /assets dopo una parentesi
  var R = radice();
  var LINK = '<a href="' + R + 'cookie.html">Informativa cookie</a> · <a href="' + R + 'privacy.html">Privacy</a>';

  function chiudiBanner() { if (banner) { banner.remove(); banner = null; } }
  function scegli(m) { chiudiBanner(); chiudiDialogo(true); salva(m); }

  function mostraBanner() {
    if (banner || leggi()) return;
    banner = el('div', { 'class': 'mvcc-banner', role: 'region', 'aria-label': 'Consenso cookie' },
      '<button type="button" class="mvcc-x" aria-label="Chiudi e rifiuta i cookie di marketing">&times;</button>' +
      '<p class="mvcc-t">La tua privacy, a modo tuo</p>' +
      '<p>Usiamo cookie tecnici, necessari al sito. Con il tuo consenso usiamo anche i cookie di Meta (Facebook e Instagram) per misurare e migliorare le nostre promozioni. Puoi scegliere ora e cambiare idea quando vuoi.</p>' +
      '<p class="mvcc-l">' + LINK + '</p>' +
      '<div class="mvcc-b"><button type="button" class="mvcc-btn" data-a="no">Rifiuta</button>' +
      '<button type="button" class="mvcc-btn mvcc-sec" data-a="pers">Personalizza</button>' +
      '<button type="button" class="mvcc-btn" data-a="si">Accetta</button></div>');
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (b.classList.contains('mvcc-x') || a === 'no') scegli(false);
      else if (a === 'si') scegli(true);
      else if (a === 'pers') mostraPreferenze();
    });
    document.body.appendChild(banner);
  }

  function focusabili() { return Array.prototype.slice.call(dialogo.querySelectorAll('button, a[href], input')).filter(function (x) { return !x.disabled; }); }
  function tasti(e) {
    if (!dialogo) return;
    if (e.key === 'Escape') { e.preventDefault(); chiudiDialogo(); return; }
    if (e.key !== 'Tab') return;
    var f = focusabili(), p = f[0], u = f[f.length - 1];
    if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
    else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
    else if (!dialogo.contains(document.activeElement)) { e.preventDefault(); p.focus(); }
  }
  function chiudiDialogo(senzaFocus) {
    if (!dialogo) return;
    dialogo.remove(); dialogo = null;
    document.removeEventListener('keydown', tasti, true);
    document.documentElement.classList.remove('mvcc-aperto');
    if (!senzaFocus && ultimoFocus && document.contains(ultimoFocus)) ultimoFocus.focus();
    if (!senzaFocus && !leggi()) mostraBanner();
  }
  function mostraPreferenze() {
    if (dialogo) return;
    ultimoFocus = document.activeElement;
    var s = leggi();
    chiudiBanner();
    dialogo = el('div', { 'class': 'mvcc-ov' },
      '<div class="mvcc-dlg" role="dialog" aria-modal="true" aria-labelledby="mvcc-h">' +
      '<h2 id="mvcc-h">Preferenze cookie</h2>' +
      '<div class="mvcc-riga"><div><h3>Necessari (sempre attivi)</h3><p>Fanno funzionare il sito e i moduli, e ricordano le tue scelte sui cookie. Non servono a profilarti.</p></div>' +
      '<span class="mvcc-fisso">Sempre attivi</span></div>' +
      '<div class="mvcc-riga"><div><h3 id="mvcc-m">Marketing: Meta Pixel (spento di default)</h3><p>Ci dice quante persone arrivano dalle nostre promozioni su Facebook e Instagram e se compilano il modulo. Meta riceve dati sulla tua visita (tra cui l\'indirizzo IP) e può usarli come descritto nella sua <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">informativa</a>.</p></div>' +
      '<label class="mvcc-sw"><input type="checkbox" role="switch" id="mvcc-mk" aria-labelledby="mvcc-m"><span class="mvcc-pista" aria-hidden="true"></span></label></div>' +
      '<p class="mvcc-l">' + LINK + '</p>' +
      '<div class="mvcc-b"><button type="button" class="mvcc-btn" data-a="no">Rifiuta tutto</button>' +
      '<button type="button" class="mvcc-btn mvcc-sec" data-a="salva">Salva le mie scelte</button>' +
      '<button type="button" class="mvcc-btn" data-a="si">Accetta tutto</button></div></div>');
    var sw = dialogo.querySelector('#mvcc-mk'); sw.checked = !!(s && s.marketing);
    dialogo.addEventListener('click', function (e) {
      if (e.target === dialogo) return; // clic fuori: nessun effetto sul consenso
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'no') scegli(false); else if (a === 'si') scegli(true); else if (a === 'salva') scegli(sw.checked);
    });
    document.documentElement.classList.add('mvcc-aperto');
    document.body.appendChild(dialogo);
    document.addEventListener('keydown', tasti, true);
    dialogo.querySelector('#mvcc-mk').focus();
  }

  // Link "Preferenze cookie" nel footer (o in una riga finale se la pagina non ha footer)
  function linkFooter() {
    var b = el('button', { type: 'button', 'class': 'mvcc-foot' }, 'Preferenze cookie');
    b.addEventListener('click', mostraPreferenze);
    var fs = document.querySelectorAll('footer'), f = fs[fs.length - 1];
    if (f) f.appendChild(b);
    else { var d = el('div', { 'class': 'mvcc-footriga' }); d.appendChild(b); document.body.appendChild(d); }
  }

  function avvia() { linkFooter(); mostraBanner(); applica(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia); else avvia();
})();
