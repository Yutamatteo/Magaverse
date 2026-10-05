/* ============================================================
   MAGAVERSE · STORYMAP ENGINE
   Motore condiviso: reveal-on-scroll + controller generico per
   il pattern "story-stage" (pannello agganciato che reagisce allo
   scroll della narrativa a fianco — planimetrie, percorsi, step).
   Auto-inizializza tutto quello che trova nella pagina.
   ============================================================ */
(function(){
  "use strict";

  function initReveal(){
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)){
      els.forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el, i){
      el.style.setProperty('--sm-i', i % 8);
      io.observe(el);
    });
  }

  function initStoryStage(root){
    var stageCol = root.querySelector('[data-stage]') || root.querySelector('.story-stage');
    if (!stageCol) return;
    var stage = stageCol.classList.contains('story-stage') ? stageCol : stageCol.querySelector('.story-stage');
    if (!stage) return;

    var panels = {};
    stage.querySelectorAll('.story-panel').forEach(function(p){ panels[p.dataset.layer] = p; });
    var pills = root.querySelectorAll('.sm-pill[data-goto]');
    var card = stage.querySelector('.story-card');
    var cardKind = card ? card.querySelector('[data-role="kind"]') : null;
    var cardName = card ? card.querySelector('[data-role="name"]') : null;
    var cardDesc = card ? card.querySelector('[data-role="desc"]') : null;

    var openPinId = null, currentLayer = null, currentSpotlight = null;

    function setLayer(layer){
      if (layer === currentLayer) return;
      currentLayer = layer;
      Object.keys(panels).forEach(function(k){ panels[k].classList.toggle('is-active', k === layer); });
      pills.forEach(function(p){ p.classList.toggle('is-active', p.dataset.goto === layer); });
    }

    function setFocus(x, y){
      if (x == null || y == null){
        stage.classList.remove('is-zoomed');
        Object.keys(panels).forEach(function(k){ panels[k].style.transformOrigin = '50% 50%'; });
      } else {
        Object.keys(panels).forEach(function(k){ panels[k].style.transformOrigin = x + '% ' + y + '%'; });
        stage.classList.add('is-zoomed');
      }
    }

    function setSpotlight(pinId){
      if (currentSpotlight) currentSpotlight.classList.remove('spotlight');
      currentSpotlight = pinId ? document.getElementById(pinId) : null;
      if (currentSpotlight) currentSpotlight.classList.add('spotlight');
    }

    function openCard(btn){
      if (!card) return;
      var kind = btn.dataset.kind || 'info';
      if (cardKind){
        cardKind.textContent = btn.dataset.kindLabel || (kind === 'avail' ? 'Disponibile' : kind === 'occ' ? 'Occupata' : 'Info');
        cardKind.className = 'kind ' + kind;
      }
      if (cardName) cardName.textContent = btn.dataset.name || '';
      if (cardDesc) cardDesc.textContent = btn.dataset.desc || '';
      card.classList.add('is-open');
      openPinId = btn.id;
    }
    function closeCard(){
      if (card) card.classList.remove('is-open');
      openPinId = null;
    }

    stage.querySelectorAll('.story-pin').forEach(function(btn){
      btn.addEventListener('click', function(){
        if (openPinId === btn.id) closeCard(); else openCard(btn);
      });
    });
    var closeBtn = card ? card.querySelector('.close') : null;
    if (closeBtn) closeBtn.addEventListener('click', closeCard);

    pills.forEach(function(p){
      p.addEventListener('click', function(){
        var first = root.querySelector('.story-beat[data-layer="' + p.dataset.goto + '"]');
        if (first) first.scrollIntoView({ behavior:'smooth', block:'center' });
      });
    });

    var beats = root.querySelectorAll('.story-beat');
    if (beats.length && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          var beat = entry.target;
          setLayer(beat.dataset.layer);
          var fx = beat.dataset.focusX, fy = beat.dataset.focusY;
          setFocus(fx ? parseFloat(fx) : null, fy ? parseFloat(fy) : null);
          setSpotlight(beat.dataset.pin || null);
        });
      }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
      beats.forEach(function(b){ io.observe(b); });
    }

    if (pills.length) pills[0].classList.add('is-active');
    var firstLayer = Object.keys(panels)[0];
    if (firstLayer) panels[firstLayer].classList.add('is-active');
  }

  document.addEventListener('DOMContentLoaded', function(){
    initReveal();
    document.querySelectorAll('.storymap').forEach(initStoryStage);
  });
})();
