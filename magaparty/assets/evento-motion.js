/* MAGAPARTY · movimento nelle pagine evento (solo estetica).
   - i titoli di sezione entrano parola per parola (li gestisce motion.js)
   - le cifre del conto alla rovescia "battono" quando cambiano */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ['cd', 'ch', 'cm', 'cs'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el || !('MutationObserver' in window)) return;
    var prima = el.textContent;
    new MutationObserver(function () {
      if (el.textContent === prima) return;
      prima = el.textContent;
      el.classList.remove('ev-tic');
      void el.offsetWidth;
      el.classList.add('ev-tic');
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });
})();
