/** Visual effects layer — CSS/SVG/canvas particles driven by theme + intensity */

const FX_POOLS = {
  bubble: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-bubble';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  spark: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-spark';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  confetti: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-confetti';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  note: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-note';
    el.textContent = '♪';
    el.style.cssText = `left:${x}%;top:${y}%;color:${color}`;
    return el;
  },
  firefly: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-firefly';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  comet: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-comet';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  ripple: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-ripple';
    el.style.cssText = `left:${x}%;top:${y}%;--c:${color}`;
    return el;
  },
  gear: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-gear';
    el.textContent = '⚙';
    el.style.cssText = `left:${x}%;top:${y}%;color:${color}`;
    return el;
  },
  leaf: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-leaf';
    el.textContent = '🍃';
    el.style.cssText = `left:${x}%;top:${y}%;color:${color}`;
    return el;
  },
  coin: (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'rt-fx rt-fx-coin';
    el.textContent = '●';
    el.style.cssText = `left:${x}%;top:${y}%;color:${color}`;
    return el;
  }
};

const INTENSITY_COUNT = { off: 0, low: 1, medium: 2, high: 4 };

export function spawnEffect(layer, fxType, accent, intensity) {
  if (!layer || intensity === 'off') return;
  const count = INTENSITY_COUNT[intensity] || 2;
  const maker = FX_POOLS[fxType] || FX_POOLS.spark;
  for (let i = 0; i < count; i++) {
    const x = 15 + Math.random() * 70;
    const y = 20 + Math.random() * 45;
    const el = maker(x, y, accent);
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

export const FX_CSS = `
.rt-fx-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}
.rt-fx{position:absolute;pointer-events:none;font-size:18px;animation:rtFxUp 1.2s ease-out forwards}
.rt-fx-bubble{width:14px;height:14px;border-radius:50%;background:var(--c);opacity:.7;border:2px solid rgba(255,255,255,.5)}
.rt-fx-spark{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c)}
.rt-fx-confetti{width:6px;height:10px;background:var(--c);border-radius:2px}
.rt-fx-note{font-size:22px;font-weight:900}
.rt-fx-firefly{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 16px var(--c)}
.rt-fx-comet{width:20px;height:3px;background:linear-gradient(90deg,var(--c),transparent);border-radius:2px}
.rt-fx-ripple{width:30px;height:30px;border:3px solid var(--c);border-radius:50%;animation:rtRipple 1s ease-out forwards}
.rt-fx-gear{font-size:20px}
.rt-fx-leaf{font-size:18px}
.rt-fx-coin{font-size:16px;font-weight:900}
@keyframes rtFxUp{0%{transform:translateY(0) scale(.5);opacity:0}20%{opacity:1}100%{transform:translateY(-80px) scale(1.2);opacity:0}}
@keyframes rtRipple{0%{transform:scale(.3);opacity:.9}100%{transform:scale(2.5);opacity:0}}
`;
