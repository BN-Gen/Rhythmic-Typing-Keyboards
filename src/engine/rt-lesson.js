import { normKey } from './finger-map.js';

/** Active-key lockdown from URL params — folded into engine */
export function createLessonState() {
  const params = new URLSearchParams(window.location.search);
  const keysParam = params.get('keys') || '';
  const patternParam = params.get('pattern') || '';
  const activity = params.get('activity') || '';
  const setLabel = params.get('set') || '';
  const child = params.get('child') || '';
  const activeKeys = new Set();
  let lockEnabled = false;
  let pattern = [];

  function parseKeys(str) {
    const set = new Set();
    if (!str) return set;
    str.split(',').forEach((part) => {
      const k = normKey(part);
      if (k) set.add(k);
    });
    return set;
  }

  function init() {
    keysParam.split(',').forEach((part) => {
      const k = normKey(part);
      if (k) activeKeys.add(k);
    });
    pattern = patternParam ? patternParam.trim().split(/\s+/).map(normKey).filter(Boolean) : [];
    if (!activeKeys.size && activity === 'free') {
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((k) => activeKeys.add(k));
      activeKeys.add('SPACE');
      lockEnabled = false;
      return;
    }
    if (activeKeys.size) lockEnabled = true;
  }

  function isAllowed(key) {
    if (!lockEnabled) return true;
    const k = normKey(key);
    return k ? activeKeys.has(k) : true;
  }

  function keyFromElement(el) {
    if (!el?.getAttribute) return null;
    const dk = el.getAttribute('data-key') || el.getAttribute('data-letter');
    if (dk) return normKey(dk);
    const label = (el.textContent || '').trim();
    if (label === 'SPACE' || label === 'Space') return 'SPACE';
    if (/^[A-Z]$/.test(label)) return label;
    return null;
  }

  function applyKeyLockdown() {
    if (!lockEnabled) return;
    document.querySelectorAll('[data-key], .rt-key').forEach((el) => {
      const k = keyFromElement(el);
      if (!k) return;
      if (activeKeys.has(k)) {
        el.classList.remove('rt-key-blocked');
        el.removeAttribute('aria-disabled');
      } else {
        el.classList.add('rt-key-blocked');
        el.setAttribute('aria-disabled', 'true');
      }
    });
  }

  function keyFromEvent(e) {
    if (e.code === 'Space' || e.key === ' ') return 'SPACE';
    if (e.key?.length === 1 && /[a-zA-Z]/.test(e.key)) return e.key.toUpperCase();
    return null;
  }

  function bindKeyboardBlock() {
    const block = (e) => {
      if (!lockEnabled) return;
      const k = keyFromEvent(e);
      if (!k || activeKeys.has(k)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', block, true);
    window.addEventListener('keyup', block, true);
  }

  init();
  bindKeyboardBlock();

  return {
    activeKeys,
    pattern,
    activity,
    setLabel,
    child,
    lockEnabled,
    isAllowed,
    applyKeyLockdown
  };
}
