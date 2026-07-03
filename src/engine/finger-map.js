/** Canonical finger color map — 8 distinct primary colors, no similar adjacency */
export const FINGER_IDS = {
  Q: 'lp', A: 'lp', Z: 'lp',
  W: 'lr', S: 'lr', X: 'lr',
  E: 'lm', D: 'lm', C: 'lm',
  R: 'li', F: 'li', T: 'li', G: 'li', V: 'li', B: 'li',
  Y: 'ri', H: 'ri', U: 'ri', J: 'ri', N: 'ri', M: 'ri',
  I: 'rm', K: 'rm',
  O: 'rr', L: 'rr',
  P: 'rp',
  SPACE: 'th'
};

export const FINGER_META = {
  lp: { id: 'lp', label: 'Left Pinky', color: '#E53935', className: 'finger-lp' },
  lr: { id: 'lr', label: 'Left Ring', color: '#1E88E5', className: 'finger-lr' },
  lm: { id: 'lm', label: 'Left Middle', color: '#FB8C00', className: 'finger-lm' },
  li: { id: 'li', label: 'Left Index', color: '#43A047', className: 'finger-li' },
  ri: { id: 'ri', label: 'Right Index', color: '#8E24AA', className: 'finger-ri' },
  rm: { id: 'rm', label: 'Right Middle', color: '#FDD835', className: 'finger-rm' },
  rr: { id: 'rr', label: 'Right Ring', color: '#00ACC1', className: 'finger-rr' },
  rp: { id: 'rp', label: 'Right Pinky', color: '#D81B60', className: 'finger-rp' },
  th: { id: 'th', label: 'Thumbs', color: '#ECEFF1', className: 'finger-th', text: '#37474F' }
};

export const KEY_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split('')
];

export const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function fingerFor(letter) {
  const k = String(letter || '').toUpperCase();
  return FINGER_IDS[k] || 'li';
}

export function normKey(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.toUpperCase() === 'SPACE' || s === ' ') return 'SPACE';
  if (s.length === 1 && /[a-zA-Z]/.test(s)) return s.toUpperCase();
  return s.toLowerCase();
}
