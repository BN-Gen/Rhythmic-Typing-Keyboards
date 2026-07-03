/**
 * Rhythmic Typing Engine v2.1 — momentary tap, uniform note length, active-key lockdown
 */
(function (global) {
  'use strict';

  var FINGER_IDS = { Q:'lp',A:'lp',Z:'lp', W:'lr',S:'lr',X:'lr', E:'lm',D:'lm',C:'lm',
    R:'li',F:'li',T:'li',G:'li',V:'li',B:'li', Y:'ri',H:'ri',U:'ri',J:'ri',N:'ri',M:'ri',
    I:'rm',K:'rm', O:'rr',L:'rr', P:'rp', SPACE:'th' };
  var FINGER_META = {
    lp:{className:'finger-lp'}, lr:{className:'finger-lr'}, lm:{className:'finger-lm'},
    li:{className:'finger-li'}, ri:{className:'finger-ri'}, rm:{className:'finger-rm'},
    rr:{className:'finger-rr'}, rp:{className:'finger-rp'}, th:{className:'finger-th'}
  };
  var KEY_ROWS = ['QWERTYUIOP'.split(''),'ASDFGHJKL'.split(''),'ZXCVBNM'.split('')];
  var NOTE_LENGTHS = { quick:0.15, brief:0.35, medium:0.6, beat:1.0, long:1.5 };
  var LETTER_FREQ = { A:220,B:233,C:247,D:262,E:277,F:294,G:311,H:330,I:349,J:370,K:392,L:415,M:440,N:466,O:494,P:523,Q:554,R:587,S:622,T:659,U:698,V:740,W:784,X:831,Y:880,Z:932,SPACE:165 };
  var VOICES = {
    mallet:{type:'triangle',mul:2.2,attack:0.018},
    chime:{type:'sine',mul:3.2,attack:0.01},
    piano:{type:'sine',mul:1.9,attack:0.006},
    arcade:{type:'square',mul:1.1,attack:0.004},
    bubble:{type:'sine',mul:3.8,attack:0.012},
    drum:{type:'triangle',mul:0.55,attack:0.002}
  };
  var FX_MAX = 14;
  var fxCount = 0;

  function normKey(raw) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s) return null;
    if (s.toUpperCase() === 'SPACE' || s === ' ') return 'SPACE';
    if (s.length === 1 && /[a-zA-Z]/.test(s)) return s.toUpperCase();
    return null;
  }
  function fingerFor(l) { return FINGER_IDS[String(l || '').toUpperCase()] || 'li'; }

  function loadSettings(child) {
    var base = {
      effectIntensity:'medium', reduceMotion:false, soundOn:true, soundVoice:'mallet',
      masterVolume:0.75, noteLength:'brief', backgroundBeat:false, beatVolume:0.3, bpm:60,
      buttonSize:'medium', contrast:'normal', focusMode:false, fingerColors:true
    };
    if (!child) return base;
    try {
      var all = JSON.parse(localStorage.getItem('rt-settings-v2') || '{}');
      var o = {};
      for (var k in base) o[k] = base[k];
      if (all[child]) for (var k2 in all[child]) o[k2] = all[child][k2];
      return o;
    } catch (e) { return base; }
  }
  function saveSettings(child, partial) {
    if (!child) return;
    try {
      var all = JSON.parse(localStorage.getItem('rt-settings-v2') || '{}');
      all[child] = Object.assign(loadSettings(child), partial || {});
      localStorage.setItem('rt-settings-v2', JSON.stringify(all));
    } catch (e) {}
  }
  function applySettingsToRoot(s) {
    var r = document.documentElement;
    r.dataset.rtIntensity = s.effectIntensity;
    r.dataset.rtMotion = s.reduceMotion ? 'reduced' : 'normal';
    r.dataset.rtSize = s.buttonSize;
    r.dataset.rtContrast = s.contrast;
    r.dataset.rtFocus = s.focusMode ? 'on' : 'off';
    r.dataset.rtFingerColors = s.fingerColors ? 'on' : 'off';
  }

  function createLessonState() {
    var params = new URLSearchParams(location.search);
    var activeKeys = new Set();
    var lockEnabled = false;
    (params.get('keys') || '').split(',').forEach(function (p) {
      var k = normKey(p);
      if (k) activeKeys.add(k);
    });
    var activity = params.get('activity') || '';
    if (!activeKeys.size && activity === 'free') {
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (c) { activeKeys.add(c); });
      activeKeys.add('SPACE');
    } else if (activeKeys.size) lockEnabled = true;

    function isAllowed(key) {
      if (!lockEnabled) return true;
      var k = normKey(key);
      return k ? activeKeys.has(k) : true;
    }
    function applyKeyLockdown() {
      if (!lockEnabled) return;
      document.querySelectorAll('[data-key]').forEach(function (el) {
        var k = normKey(el.getAttribute('data-key'));
        if (!k) return;
        var on = activeKeys.has(k);
        el.classList.toggle('rt-key-blocked', !on);
        el.classList.toggle('rt-key-active', on);
        el.setAttribute('aria-disabled', on ? 'false' : 'true');
      });
    }
    function block(e) {
      if (!lockEnabled) return;
      var k = e.code === 'Space' ? 'SPACE' : (e.key && e.key.length === 1 ? e.key.toUpperCase() : null);
      if (k && !activeKeys.has(k)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
    window.addEventListener('keydown', block, true);
    window.addEventListener('keyup', block, true);
    return {
      child: params.get('child') || '',
      activity: activity,
      setLabel: params.get('set') || '',
      keyboardName: params.get('keyboard') || '',
      sessionNoteLength: params.get('noteLength') || '',
      lockEnabled: lockEnabled,
      activeKeys: activeKeys,
      isAllowed: isAllowed,
      applyKeyLockdown: applyKeyLockdown
    };
  }

  function createAudio(getSettings, themeVoice) {
    var ctx = null;
    var beatTimer = null;
    var playing = new Set();

    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function playKey(letter) {
      var s = getSettings();
      if (!s.soundOn) return;
      var c = ensure();
      var now = c.currentTime;
      var dur = NOTE_LENGTHS[s.noteLength] || 0.35;
      var freq = LETTER_FREQ[letter] || 440;
      var voiceName = themeVoice || s.soundVoice || 'mallet';
      var voice = VOICES[voiceName] || VOICES.mallet;
      var id = letter + now;
      playing.add(id);

      var osc = c.createOscillator();
      var gain = c.createGain();
      var filter = c.createBiquadFilter();
      osc.type = voice.type;
      osc.frequency.setValueAtTime(freq * voice.mul, now);
      filter.type = voice.type === 'square' ? 'bandpass' : 'lowpass';
      filter.frequency.value = 1400;
      var vol = Math.max(s.masterVolume * 0.18, 0.001);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol, now + voice.attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(filter).connect(gain).connect(c.destination);
      osc.start(now);
      osc.stop(now + dur + 0.04);
      osc.onended = function () { playing.delete(id); };
    }

    function startBeat() {
      stopBeat();
      var s = getSettings();
      if (!s.backgroundBeat) return;
      var interval = 60000 / (s.bpm || 60);
      beatTimer = setInterval(function () {
        var c = ensure();
        var now = c.currentTime;
        var o = c.createOscillator();
        var g = c.createGain();
        o.frequency.value = 660;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(s.beatVolume * 0.05, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        o.connect(g).connect(c.destination);
        o.start(now);
        o.stop(now + 0.06);
      }, interval);
    }
    function stopBeat() {
      if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
    }
    return { playKey: playKey, startBeat: startBeat, stopBeat: stopBeat, unlock: ensure };
  }

  function spawnFx(layer, fx, color, intensity) {
    if (!layer || intensity === 'off' || fxCount >= FX_MAX) return;
    var n = { off:0, low:1, medium:2, high:3 }[intensity] || 2;
    for (var i = 0; i < n; i++) {
      if (fxCount >= FX_MAX) break;
      var el = document.createElement('div');
      el.className = 'rt-fx rt-fx-' + (fx || 'spark');
      if (fx === 'note') el.style.color = color;
      else el.style.cssText = 'left:' + (12 + Math.random() * 76) + '%;top:' + (18 + Math.random() * 38) + '%;--c:' + color;
      layer.appendChild(el);
      fxCount++;
      setTimeout(function (node) {
        node.remove();
        fxCount = Math.max(0, fxCount - 1);
      }, 1000, el);
    }
  }

  function pulseBeat(scene) {
    var el = document.createElement('div');
    el.className = 'rt-beat-pulse';
    scene.appendChild(el);
    setTimeout(function () { el.remove(); }, 900);
  }

  function hashProfile(c) {
    if (!c) return 'anon';
    var h = 0;
    for (var i = 0; i < c.length; i++) h = ((h << 5) - h) + c.charCodeAt(i) | 0;
    return 'p_' + Math.abs(h).toString(36);
  }

  function logEvent(evt) {
    var record = Object.assign({ ts: Date.now() }, evt);
    try {
      var key = 'rt-events-v2';
      var arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(record);
      if (arr.length > 400) arr = arr.slice(-300);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {}
  }

  function exportJSON(child) {
    try {
      var arr = JSON.parse(localStorage.getItem('rt-events-v2') || '[]');
      if (child) arr = arr.filter(function (e) { return e.child === child; });
      return JSON.stringify({ version: 2, exported: new Date().toISOString(), events: arr }, null, 2);
    } catch (e) { return '[]'; }
  }
  function exportCSV(child) {
    var arr;
    try { arr = JSON.parse(localStorage.getItem('rt-events-v2') || '[]'); } catch (e) { arr = []; }
    if (child) arr = arr.filter(function (e) { return e.child === child; });
    var lines = ['ts,child,keyboard,activity,key,finger,noteLength'];
    arr.forEach(function (e) {
      lines.push([e.ts, e.child, e.keyboard, e.activity, e.key, e.finger, e.noteLength].join(','));
    });
    return lines.join('\n');
  }
  function exportAnonymized() {
    var arr;
    try { arr = JSON.parse(localStorage.getItem('rt-events-v2') || '[]'); } catch (e) { arr = []; }
    var agg = {};
    arr.forEach(function (e) {
      var p = e.profileHash || 'unknown';
      if (!agg[p]) agg[p] = { keyPresses: 0, fingers: {}, keyboards: {} };
      agg[p].keyPresses++;
      if (e.finger) agg[p].fingers[e.finger] = (agg[p].fingers[e.finger] || 0) + 1;
      if (e.keyboard) agg[p].keyboards[e.keyboard] = (agg[p].keyboards[e.keyboard] || 0) + 1;
    });
    return JSON.stringify({ type: 'anonymized_aggregate', exported: new Date().toISOString(), aggregates: agg }, null, 2);
  }

  function bindSettingsUI(container, child, onChange) {
    if (!container) return;
    var s = loadSettings(child);
    container.innerHTML =
      '<label class="rt-opt">Effect intensity<select data-k="effectIntensity"><option value="off">off</option><option value="low">low</option><option value="medium" selected>medium</option><option value="high">high</option></select></label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="reduceMotion"> Reduce motion</label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="soundOn" checked> Sound on</label>' +
      '<label class="rt-opt">Sound voice<select data-k="soundVoice"><option value="mallet">mallet</option><option value="chime">chime</option><option value="piano">piano</option><option value="arcade">arcade</option><option value="bubble">bubble</option><option value="drum">drum</option></select></label>' +
      '<label class="rt-opt">Volume<input type="range" data-k="masterVolume" min="0" max="1" step="0.05" value="0.75"></label>' +
      '<label class="rt-opt">Note length (uniform for this keyboard)<select data-k="noteLength"><option value="quick">quick</option><option value="brief" selected>brief</option><option value="medium">medium</option><option value="beat">beat (1 sec)</option><option value="long">long (1.5 sec)</option></select></label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="backgroundBeat"> Background beat (optional)</label>' +
      '<label class="rt-opt">Tempo BPM<input type="range" data-k="bpm" min="40" max="100" step="5" value="60"></label>' +
      '<label class="rt-opt">Key size<select data-k="buttonSize"><option value="small">small</option><option value="medium" selected>medium</option><option value="large">large</option><option value="xlarge">xlarge</option></select></label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="contrast" data-bool="high"> High contrast</label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="focusMode"> Focus mode (highlight active keys only)</label>' +
      '<label class="rt-opt"><input type="checkbox" data-k="fingerColors" checked> Finger colors</label>';
    container.querySelectorAll('[data-k]').forEach(function (el) {
      var k = el.dataset.k;
      if (el.type === 'checkbox') {
        el.checked = k === 'contrast' ? s.contrast === 'high' : !!s[k];
      } else if (el.tagName === 'SELECT') {
        el.value = s[k] || el.options[0].value;
      } else {
        el.value = s[k];
      }
    });
    container.onchange = function (e) {
      var el = e.target.closest('[data-k]');
      if (!el) return;
      var k = el.dataset.k;
      var v = el.type === 'checkbox'
        ? (el.dataset.bool ? (el.checked ? 'high' : 'normal') : el.checked)
        : (el.type === 'range' ? Number(el.value) : el.value);
      var next = loadSettings(child);
      next[k] = v;
      saveSettings(child, next);
      applySettingsToRoot(next);
      if (onChange) onChange(next);
    };
  }

  function bootKeyboard(theme) {
    var lesson = createLessonState();
    var child = lesson.child;
    var settings = loadSettings(child);

    if (theme.buttonSize) settings.buttonSize = theme.buttonSize;
    if (theme.contrast === 'high') settings.contrast = 'high';
    if (theme.reduceMotion) { settings.reduceMotion = true; settings.effectIntensity = 'low'; }
    if (lesson.sessionNoteLength && NOTE_LENGTHS[lesson.sessionNoteLength]) {
      settings.noteLength = lesson.sessionNoteLength;
    }
    if (theme.soundVoice) settings.soundVoice = theme.soundVoice;

    applySettingsToRoot(settings);
    var getSettings = function () { return loadSettings(child); };
    var audio = createAudio(getSettings, theme.soundVoice);

    var root = document.getElementById('rt-root');
    if (!root) return;
    root.innerHTML = '';

    var app = document.createElement('div');
    app.className = 'rt-app';
    app.style.setProperty('--rt-kb-bg', theme.kbBg || 'rgba(0,0,0,.4)');

    var scene = document.createElement('div');
    scene.className = 'rt-scene';
    var bg = document.createElement('div');
    bg.className = 'rt-scene-bg ' + (theme.bgClass || '');
    var fxLayer = document.createElement('div');
    fxLayer.className = 'rt-fx-layer';
    var content = document.createElement('div');
    content.className = 'rt-scene-content';
    var titleColor = theme.tone === 'light' ? '#17335f' : '#fff';
    content.innerHTML = theme.sceneHtml ||
      '<div class="rt-scene-title" style="color:' + titleColor + '">' + theme.name + '</div>';
    scene.appendChild(bg);
    scene.appendChild(fxLayer);
    scene.appendChild(content);

    var kbWrap = document.createElement('div');
    kbWrap.className = 'rt-keyboard-wrap';
    var keyboard = document.createElement('div');
    keyboard.className = 'rt-keyboard';
    keyboard.setAttribute('role', 'group');
    keyboard.setAttribute('aria-label', 'Typing keyboard');

    var fmt = theme.format || 'qwerty';
    if (fmt === 'phone-4' || fmt === 'phone-4-left') {
      var pad = document.createElement('div');
      pad.className = 'rt-phone-pad';
      var fingers = fmt === 'phone-4-left'
        ? [{ k:'F', f:'li' }, { k:'D', f:'lm' }, { k:'S', f:'lr' }, { k:'A', f:'lp' }]
        : [{ k:'J', f:'ri' }, { k:'K', f:'rm' }, { k:'L', f:'rr' }, { k:'P', f:'rp' }];
      fingers.forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rt-phone-key ' + FINGER_META[x.f].className;
        b.dataset.key = x.k;
        b.textContent = x.k;
        b.setAttribute('aria-label', x.k);
        pad.appendChild(b);
      });
      keyboard.appendChild(pad);
    } else {
      KEY_ROWS.forEach(function (row, ri) {
        var rowEl = document.createElement('div');
        rowEl.className = 'rt-row';
        if (ri === 1) rowEl.style.marginLeft = '18px';
        if (ri === 2) rowEl.style.marginLeft = '36px';
        row.forEach(function (letter) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'rt-key ' + FINGER_META[fingerFor(letter)].className;
          btn.dataset.key = letter;
          btn.textContent = letter;
          btn.setAttribute('aria-label', letter);
          rowEl.appendChild(btn);
        });
        keyboard.appendChild(rowEl);
      });
      var sr = document.createElement('div');
      sr.className = 'rt-row';
      var sp = document.createElement('button');
      sp.type = 'button';
      sp.className = 'rt-key space finger-th';
      sp.dataset.key = 'SPACE';
      sp.textContent = 'SPACE';
      sp.setAttribute('aria-label', 'Space');
      sr.appendChild(sp);
      keyboard.appendChild(sr);
    }

    kbWrap.appendChild(keyboard);
    app.appendChild(scene);
    app.appendChild(kbWrap);
    root.appendChild(app);

    if (lesson.setLabel || lesson.activity) {
      var hud = document.createElement('div');
      hud.className = 'rt-hud';
      hud.innerHTML = '<strong>' + (lesson.setLabel || lesson.activity || 'Practice') + '</strong>' +
        (lesson.lockEnabled ? 'Active keys only' : 'Free play');
      app.appendChild(hud);
    }

    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'rt-back';
    back.textContent = '< Back to Lesson';
    back.onclick = function () {
      location.assign(sessionStorage.getItem('rt-panel-url') || './rhythmic-typing-control-panel.html');
    };
    app.appendChild(back);

    var muteBtn = document.createElement('button');
    muteBtn.type = 'button';
    muteBtn.className = 'rt-mute';
    muteBtn.textContent = 'Sound: On';
    muteBtn.onclick = function () {
      var s = loadSettings(child);
      s.soundOn = !s.soundOn;
      saveSettings(child, s);
      muteBtn.textContent = s.soundOn ? 'Sound: On' : 'Sound: Off';
    };
    app.appendChild(muteBtn);

    var optBtn = document.createElement('button');
    optBtn.type = 'button';
    optBtn.className = 'rt-options-btn';
    optBtn.textContent = 'Options';
    var optPanel = document.createElement('div');
    optPanel.className = 'rt-options-panel';
    optPanel.innerHTML = '<div class="rt-options-inner"><h3>Your settings</h3><p style="font-size:13px;color:#64748b;margin:0 0 12px">Tap is always momentary. Note length is the same for every key on this keyboard.</p><div id="rt-opt"></div><button type="button" id="rt-opt-x" style="margin-top:12px;padding:10px 20px;border-radius:999px;border:none;background:#17335f;color:#fff;font-weight:700;cursor:pointer">Close</button></div>';
    app.appendChild(optBtn);
    app.appendChild(optPanel);
    bindSettingsUI(optPanel.querySelector('#rt-opt'), child, function () {
      audio.stopBeat();
      audio.startBeat();
      lesson.applyKeyLockdown();
    });
    optBtn.onclick = function () { optPanel.classList.add('open'); };
    optPanel.querySelector('#rt-opt-x').onclick = function () { optPanel.classList.remove('open'); };
    optPanel.onclick = function (e) { if (e.target === optPanel) optPanel.classList.remove('open'); };

    var lastTrigger = 0;
    var lastLetter = '';

    function trigger(letter, fromPointer) {
      if (!lesson.isAllowed(letter)) return;
      var now = performance.now();
      if (!fromPointer && lastLetter === letter && now - lastTrigger < 80) return;
      lastTrigger = now;
      lastLetter = letter;

      audio.unlock();
      audio.playKey(letter);
      var s = getSettings();
      var intensity = s.reduceMotion ? 'off' : s.effectIntensity;
      spawnFx(fxLayer, theme.fx, theme.accent || '#fff', intensity);
      if (s.noteLength === 'beat' || s.noteLength === 'long') pulseBeat(scene);

      logEvent({
        child: child,
        profileHash: hashProfile(child),
        keyboard: theme.name || lesson.keyboardName,
        activity: lesson.activity,
        key: letter,
        finger: fingerFor(letter),
        noteLength: s.noteLength
      });

      var el = keyboard.querySelector('[data-key="' + letter + '"]');
      if (el) {
        el.classList.add('rt-pressed');
        requestAnimationFrame(function () {
          setTimeout(function () { el.classList.remove('rt-pressed'); }, 100);
        });
      }
    }

    keyboard.addEventListener('pointerdown', function (e) {
      var k = e.target.closest('[data-key]');
      if (!k) return;
      e.preventDefault();
      trigger(k.dataset.key, true);
    });

    window.addEventListener('keydown', function (e) {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        trigger('SPACE', false);
        return;
      }
      var k = e.key && e.key.toUpperCase();
      if (k && k.length === 1 && /[A-Z]/.test(k)) {
        e.preventDefault();
        trigger(k, false);
      }
    });

    lesson.applyKeyLockdown();
    requestAnimationFrame(lesson.applyKeyLockdown);
    audio.startBeat();

    global.RTKeyboard = { theme: theme, lesson: lesson, settings: getSettings };
  }

  global.RT = {
    bootKeyboard: bootKeyboard,
    exportJSON: exportJSON,
    exportCSV: exportCSV,
    exportAnonymized: exportAnonymized,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    NOTE_LENGTHS: NOTE_LENGTHS
  };
})(typeof window !== 'undefined' ? window : this);
