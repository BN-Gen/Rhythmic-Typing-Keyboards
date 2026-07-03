import { KEY_ROWS, FINGER_META, fingerFor } from './finger-map.js';
import { loadSettings, applySettingsToRoot, bindSettingsUI } from './rt-settings.js';
import { createAudioEngine } from './rt-audio.js';
import { spawnEffect, FX_CSS } from './rt-fx.js';
import { createLessonState } from './rt-lesson.js';
import { startSession } from './rt-data.js';

export function bootKeyboard(themeConfig) {
  const lesson = createLessonState();
  const child = lesson.child || '';
  let settings = loadSettings(child);
  applySettingsToRoot(settings);
  const audio = createAudioEngine(() => settings);
  const session = startSession({
    child,
    keyboard: themeConfig.name,
    activity: lesson.activity
  });

  const root = document.getElementById('rt-root');
  if (!root) return;

  const style = document.createElement('style');
  style.textContent = FX_CSS + (themeConfig.extraCss || '');
  document.head.appendChild(style);

  const app = document.createElement('div');
  app.className = 'rt-app';
  app.style.setProperty('--rt-kb-bg', themeConfig.kbBg || 'rgba(0,0,0,.35)');
  app.style.setProperty('--rt-kb-border', themeConfig.kbBorder || 'rgba(255,255,255,.15)');

  const scene = document.createElement('div');
  scene.className = 'rt-scene';
  const bg = document.createElement('div');
  bg.className = 'rt-scene-bg ' + (themeConfig.bgClass || '');
  bg.innerHTML = themeConfig.bgHtml || '';
  const fxLayer = document.createElement('div');
  fxLayer.className = 'rt-fx-layer';
  const sceneContent = document.createElement('div');
  sceneContent.className = 'rt-scene-content';
  sceneContent.innerHTML = themeConfig.sceneHtml || `<div class="rt-title">${themeConfig.name}</div>`;
  scene.appendChild(bg);
  scene.appendChild(fxLayer);
  scene.appendChild(sceneContent);

  const kbWrap = document.createElement('div');
  kbWrap.className = 'rt-keyboard-wrap';
  const keyboard = document.createElement('div');
  keyboard.className = 'rt-keyboard';
  keyboard.id = 'rt-keyboard';

  const format = themeConfig.format || 'qwerty';
  if (format === 'phone-4') {
    buildPhonePad(keyboard, themeConfig);
  } else if (format === 'phone-4-left') {
    buildPhonePad(keyboard, themeConfig, 'left');
  } else {
    buildQwerty(keyboard, lesson);
  }

  kbWrap.appendChild(keyboard);
  app.appendChild(scene);
  app.appendChild(kbWrap);
  root.appendChild(app);

  if (lesson.child) {
    const hud = document.createElement('div');
    hud.className = 'rt-hud';
    hud.textContent = lesson.setLabel || lesson.activity || 'Free play';
    app.appendChild(hud);
  }

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'rt-back';
  back.textContent = '← Choose Lesson';
  back.addEventListener('click', () => {
    session.end();
    const panel = sessionStorage.getItem('rt-panel-url') || './rhythmic-typing-control-panel.html';
    window.location.assign(panel);
  });
  app.appendChild(back);

  const optBtn = document.createElement('button');
  optBtn.type = 'button';
  optBtn.className = 'rt-options-btn';
  optBtn.textContent = 'Options';
  const optPanel = document.createElement('div');
  optPanel.className = 'rt-options-panel';
  optPanel.innerHTML = '<div class="rt-options-inner"><h3>Settings</h3><div id="rt-opt-fields"></div><button type="button" id="rt-opt-close">Close</button></div>';
  app.appendChild(optBtn);
  app.appendChild(optPanel);
  bindSettingsUI(optPanel.querySelector('#rt-opt-fields'), child, (next) => {
    settings = next;
    audio.stopBackgroundBeat();
    audio.startBackgroundBeat();
  });
  optBtn.addEventListener('click', () => optPanel.classList.add('open'));
  optPanel.querySelector('#rt-opt-close').addEventListener('click', () => optPanel.classList.remove('open'));
  optPanel.addEventListener('click', (e) => { if (e.target === optPanel) optPanel.classList.remove('open'); });

  function triggerKey(letter) {
    if (!lesson.isAllowed(letter)) return;
    audio.unlock();
    audio.playKey(letter, themeConfig.soundVoice);
    session.recordKey(letter, fingerFor(letter), settings.noteLength);
    const intensity = settings.reduceMotion ? 'off' : settings.effectIntensity;
    spawnEffect(fxLayer, themeConfig.fx || 'spark', themeConfig.accent || '#fff', intensity);
    const el = keyboard.querySelector(`[data-key="${letter}"]`);
    if (el) {
      el.classList.add('rt-pressed');
      setTimeout(() => el.classList.remove('rt-pressed'), 120);
    }
  }

  keyboard.addEventListener('pointerdown', (e) => {
    const key = e.target.closest('[data-key]');
    if (!key) return;
    e.preventDefault();
    triggerKey(key.dataset.key);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      e.preventDefault();
      triggerKey('SPACE');
      return;
    }
    const k = e.key?.toUpperCase();
    if (k?.length === 1 && /[A-Z]/.test(k)) {
      e.preventDefault();
      triggerKey(k);
    }
  });

  lesson.applyKeyLockdown();
  audio.startBackgroundBeat();
  window.addEventListener('beforeunload', () => session.end());

  window.RTKeyboard = { theme: themeConfig, lesson, settings, triggerKey };
}

function buildQwerty(container, lesson) {
  KEY_ROWS.forEach((row, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'rt-row';
    if (ri === 1) rowEl.style.marginLeft = '18px';
    if (ri === 2) rowEl.style.marginLeft = '36px';
    row.forEach((letter) => {
      const fid = fingerFor(letter);
      const meta = FINGER_META[fid];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `rt-key ${meta.className}`;
      btn.dataset.key = letter;
      btn.textContent = letter;
      btn.setAttribute('aria-label', letter);
      rowEl.appendChild(btn);
    });
    container.appendChild(rowEl);
  });
  const spaceRow = document.createElement('div');
  spaceRow.className = 'rt-row';
  const space = document.createElement('button');
  space.type = 'button';
  space.className = 'rt-key space finger-th';
  space.dataset.key = 'SPACE';
  space.textContent = 'SPACE';
  spaceRow.appendChild(space);
  container.appendChild(spaceRow);
}

function buildPhonePad(container, theme, hand) {
  const pad = document.createElement('div');
  pad.className = 'rt-phone-pad';
  const fingers = hand === 'left'
    ? [{ k: 'F', f: 'li' }, { k: 'D', f: 'lm' }, { k: 'S', f: 'lr' }, { k: 'A', f: 'lp' }]
    : [{ k: 'J', f: 'ri' }, { k: 'K', f: 'rm' }, { k: 'L', f: 'rr' }, { k: 'P', f: 'rp' }];
  fingers.forEach(({ k, f }) => {
    const meta = FINGER_META[f];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `rt-phone-key ${meta.className}`;
    btn.dataset.key = k;
    btn.textContent = k;
    pad.appendChild(btn);
  });
  container.appendChild(pad);
}
