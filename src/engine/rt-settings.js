/**
 * Per-child settings — persisted in localStorage by picture-code profile.
 */
const STORAGE_KEY = 'rt-settings-v2';
const DEFAULTS = {
  effectIntensity: 'medium',
  reduceMotion: false,
  soundOn: true,
  soundVoice: 'mallet',
  masterVolume: 0.75,
  noteLength: 'brief',
  backgroundBeat: false,
  beatVolume: 0.35,
  bpm: 60,
  buttonSize: 'medium',
  contrast: 'normal',
  letterCase: 'upper',
  focusMode: false,
  fingerColors: true
};

const NOTE_LENGTHS = {
  quick: 0.15,
  brief: 0.35,
  medium: 0.6,
  beat: 1.0,
  long: 1.5
};

export function getNoteLengthSeconds(key) {
  return NOTE_LENGTHS[key] || NOTE_LENGTHS.brief;
}

export function getDefaults() {
  return { ...DEFAULTS };
}

export function loadSettings(childCode) {
  const base = getDefaults();
  if (!childCode) return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const all = JSON.parse(raw);
    return { ...base, ...(all[childCode] || {}) };
  } catch {
    return base;
  }
}

export function saveSettings(childCode, partial) {
  if (!childCode) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[childCode] = { ...getDefaults(), ...(all[childCode] || {}), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function applySettingsToRoot(settings) {
  const root = document.documentElement;
  root.dataset.rtIntensity = settings.effectIntensity;
  root.dataset.rtMotion = settings.reduceMotion ? 'reduced' : 'normal';
  root.dataset.rtSize = settings.buttonSize;
  root.dataset.rtContrast = settings.contrast;
  root.dataset.rtCase = settings.letterCase;
  root.dataset.rtFocus = settings.focusMode ? 'on' : 'off';
  root.dataset.rtFingerColors = settings.fingerColors ? 'on' : 'off';
}

export function bindSettingsUI(container, childCode, onChange) {
  if (!container) return;
  const s = loadSettings(childCode);
  const fields = [
    { key: 'effectIntensity', type: 'select', options: ['off', 'low', 'medium', 'high'] },
    { key: 'reduceMotion', type: 'checkbox' },
    { key: 'soundOn', type: 'checkbox' },
    { key: 'soundVoice', type: 'select', options: ['mallet', 'chime', 'piano', 'arcade', 'bubble', 'drum'] },
    { key: 'masterVolume', type: 'range', min: 0, max: 1, step: 0.05 },
    { key: 'noteLength', type: 'select', options: ['quick', 'brief', 'medium', 'beat', 'long'] },
    { key: 'backgroundBeat', type: 'checkbox' },
    { key: 'beatVolume', type: 'range', min: 0, max: 1, step: 0.05 },
    { key: 'bpm', type: 'range', min: 40, max: 120, step: 5 },
    { key: 'buttonSize', type: 'select', options: ['small', 'medium', 'large', 'xlarge'] },
    { key: 'contrast', type: 'select', options: ['normal', 'high'] },
    { key: 'focusMode', type: 'checkbox' },
    { key: 'fingerColors', type: 'checkbox' }
  ];

  container.innerHTML = fields.map((f) => {
    const label = f.key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
    if (f.type === 'checkbox') {
      return `<label class="rt-opt"><input type="checkbox" data-key="${f.key}" ${s[f.key] ? 'checked' : ''}/> ${label}</label>`;
    }
    if (f.type === 'select') {
      return `<label class="rt-opt">${label}<select data-key="${f.key}">${f.options.map((o) =>
        `<option value="${o}" ${s[f.key] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
    }
    return `<label class="rt-opt">${label}<input type="range" data-key="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${s[f.key]}"/></label>`;
  }).join('');

  container.addEventListener('change', (e) => {
    const el = e.target.closest('[data-key]');
    if (!el) return;
    const key = el.dataset.key;
    const val = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value);
    const next = { ...loadSettings(childCode), [key]: val };
    saveSettings(childCode, next);
    applySettingsToRoot(next);
    if (onChange) onChange(next);
  });
}
