import { getNoteLengthSeconds } from './rt-settings.js';

const VOICES = {
  mallet: { type: 'triangle', filter: 'lowpass', freqMul: 2.2, attack: 0.02 },
  chime: { type: 'sine', filter: 'highpass', freqMul: 3.5, attack: 0.01 },
  piano: { type: 'sine', filter: 'lowpass', freqMul: 1.8, attack: 0.005 },
  arcade: { type: 'square', filter: 'bandpass', freqMul: 1.2, attack: 0.003 },
  bubble: { type: 'sine', filter: 'bandpass', freqMul: 4, attack: 0.01 },
  drum: { type: 'triangle', filter: 'lowpass', freqMul: 0.6, attack: 0.001 }
};

const LETTER_FREQ = {
  A: 220, B: 233, C: 247, D: 262, E: 277, F: 294, G: 311, H: 330,
  I: 349, J: 370, K: 392, L: 415, M: 440, N: 466, O: 494, P: 523,
  Q: 554, R: 587, S: 622, T: 659, U: 698, V: 740, W: 784, X: 831,
  Y: 880, Z: 932, SPACE: 180
};

export function createAudioEngine(settingsRef) {
  let ctx = null;
  let beatTimer = null;
  let beatOsc = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playKey(letter, themeVoice) {
    const settings = settingsRef();
    if (!settings.soundOn) return;
    const c = ensureCtx();
    const now = c.currentTime;
    const voiceName = themeVoice || settings.soundVoice || 'mallet';
    const voice = VOICES[voiceName] || VOICES.mallet;
    const freq = LETTER_FREQ[letter] || 440;
    const duration = getNoteLengthSeconds(settings.noteLength);
    const vol = settings.masterVolume * 0.22;

    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    osc.type = voice.type;
    osc.frequency.setValueAtTime(freq * voice.freqMul, now);
    filter.type = voice.filter;
    filter.frequency.value = voice.filter === 'lowpass' ? 1200 : 1800;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), now + voice.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  function startBackgroundBeat() {
    stopBackgroundBeat();
    const settings = settingsRef();
    if (!settings.backgroundBeat) return;
    const c = ensureCtx();
    const interval = 60000 / (settings.bpm || 60);
    beatTimer = setInterval(() => {
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(settings.beatVolume * 0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain).connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }, interval);
  }

  function stopBackgroundBeat() {
    if (beatTimer) {
      clearInterval(beatTimer);
      beatTimer = null;
    }
  }

  function unlock() {
    ensureCtx();
  }

  return { playKey, startBackgroundBeat, stopBackgroundBeat, unlock };
}
