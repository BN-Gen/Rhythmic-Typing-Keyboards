(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var keysParam = params.get('keys') || '';
  var patternParam = params.get('pattern') || '';
  var activity = params.get('activity') || '';
  var setLabel = params.get('set') || '';
  var child = params.get('child') || '';

  var ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var activeKeys = new Set();
  var pattern = [];
  var lockEnabled = false;

  function normKey(raw) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s) return null;
    if (s.toUpperCase() === 'SPACE' || s === ' ') return 'SPACE';
    if (s.length === 1 && /[a-zA-Z]/.test(s)) return s.toUpperCase();
    return s.toLowerCase();
  }

  function parseKeys(str) {
    var set = new Set();
    if (!str) return set;
    str.split(',').forEach(function (part) {
      var k = normKey(part);
      if (k) set.add(k);
    });
    return set;
  }

  function parsePattern(str) {
    if (!str) return [];
    return str.trim().split(/\s+/).map(normKey).filter(Boolean);
  }

  function initFromParams() {
    activeKeys = parseKeys(keysParam);
    pattern = parsePattern(patternParam);

    if (!activeKeys.size && activity === 'free') {
      ALL.forEach(function (k) { activeKeys.add(k); });
      activeKeys.add('SPACE');
      lockEnabled = false;
      return;
    }

    if (activeKeys.size) {
      lockEnabled = true;
    }
  }

  function isAllowed(key) {
    if (!lockEnabled) return true;
    var k = normKey(key);
    if (!k) return true;
    return activeKeys.has(k);
  }

  function keyFromElement(el) {
    if (!el || !el.getAttribute) return null;
    var dk = el.getAttribute('data-key') || el.getAttribute('data-letter') ||
      el.getAttribute('data-char') || el.getAttribute('data-k');
    if (dk) return normKey(dk);
    var label = (el.textContent || '').trim();
    if (label === 'SPACE' || label === 'Space' || label === 'space') return 'SPACE';
    if (/^[A-Z]$/.test(label)) return label;
    if (/^[a-z]$/.test(label)) return label.toUpperCase();
    return null;
  }

  function injectStyles() {
    if (document.getElementById('rt-lesson-style')) return;
    var style = document.createElement('style');
    style.id = 'rt-lesson-style';
    style.textContent =
      '.rt-key-blocked{' +
      'opacity:.22!important;pointer-events:none!important;' +
      'filter:grayscale(.75) brightness(.85)!important;' +
      'cursor:not-allowed!important;box-shadow:none!important}' +
      '.rt-key-blocked:active{transform:none!important}';
    document.head.appendChild(style);
  }

  function applyKeyLockdown() {
    if (!lockEnabled) return;
    injectStyles();
    var seen = new Set();
    var nodes = document.querySelectorAll(
      '[data-key], [data-letter], [data-char], [data-k], .key, .k, button.key'
    );
    nodes.forEach(function (el) {
      var k = keyFromElement(el);
      if (!k || seen.has(el)) return;
      seen.add(el);
      if (activeKeys.has(k)) {
        el.classList.remove('rt-key-blocked');
        el.removeAttribute('aria-disabled');
      } else {
        el.classList.add('rt-key-blocked');
        el.setAttribute('aria-disabled', 'true');
      }
    });
  }

  var applyTimer = null;
  function scheduleApply() {
    if (applyTimer) clearTimeout(applyTimer);
    applyTimer = setTimeout(applyKeyLockdown, 50);
  }

  function keyFromEvent(e) {
    if (e.code === 'Space' || e.key === ' ') return 'SPACE';
    if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      return e.key.toUpperCase();
    }
    return null;
  }

  window.addEventListener('keydown', function (e) {
    if (!lockEnabled) return;
    var k = keyFromEvent(e);
    if (!k) return;
    if (!activeKeys.has(k)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('keyup', function (e) {
    if (!lockEnabled) return;
    var k = keyFromEvent(e);
    if (!k) return;
    if (!activeKeys.has(k)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(scheduleApply).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.RTLesson = {
    activeKeys: activeKeys,
    pattern: pattern,
    activity: activity,
    setLabel: setLabel,
    child: child,
    lockEnabled: lockEnabled,
    isAllowed: isAllowed,
    getPattern: function () { return pattern.slice(); },
    getActiveKeys: function () { return Array.from(activeKeys); },
    applyKeyLockdown: applyKeyLockdown,
    onReady: function (fn) {
      if (typeof fn === 'function') fn(window.RTLesson);
    }
  };

  initFromParams();

  function boot() {
    applyKeyLockdown();
    scheduleApply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
