(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (!params.get('child')) return;

  function decodePanelUrl(raw) {
    if (!raw) return '';
    var s = raw;
    try {
      if (s.indexOf('%') !== -1) s = decodeURIComponent(s);
    } catch (err) { /* keep raw */ }
    return s;
  }

  function resolvePanelUrl() {
    var stored = sessionStorage.getItem('rt-panel-url');
    if (stored) return stored;

    var fromParam = decodePanelUrl(params.get('panel'));
    if (fromParam) return fromParam;

    return './rhythmic-typing-control-panel-clean.html#step3';
  }

  function goToPanel() {
    var url = resolvePanelUrl();
    try {
      sessionStorage.setItem('rt-return-step', '3');
    } catch (err) { /* ignore */ }
    try {
      var resolved = new URL(url, window.location.href).href;
      window.location.assign(resolved);
    } catch (err) {
      window.location.href = './rhythmic-typing-control-panel-clean.html#step3';
    }
  }

  if (document.getElementById('rt-lessons-back-style')) return;

  var style = document.createElement('style');
  style.id = 'rt-lessons-back-style';
  style.textContent =
    '.rt-lessons-back{' +
    'position:fixed;top:12px;left:12px;z-index:99999;' +
    'display:inline-flex;align-items:center;gap:6px;' +
    'padding:10px 18px;border-radius:999px;' +
    'background:#fff;border:2.5px solid #17335f;' +
    'color:#17335f;font:700 15px/1.2 Fredoka,Arial,sans-serif;' +
    'cursor:pointer;' +
    'box-shadow:0 4px 0 rgba(23,51,95,.18),0 8px 20px rgba(23,51,95,.12);' +
    'transition:transform .12s ease}' +
    '.rt-lessons-back:hover{transform:translateY(-2px)}' +
    '.rt-lessons-back:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(23,51,95,.18)}';
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rt-lessons-back';
  btn.textContent = '\u2190 Choose Lesson';
  btn.setAttribute('aria-label', 'Back to choose lesson');
  btn.addEventListener('click', goToPanel);
  document.body.appendChild(btn);
})();
