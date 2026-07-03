/**
 * Rhythmic Typing build — bundles engine + themes into dist/
 * Does not modify legacy files in project root.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import { CATALOG, THEMES } from '../src/catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const STYLES = fs.readFileSync(path.join(SRC, 'engine', 'rt-styles.css'), 'utf8');
const KBD_TEMPLATE = fs.readFileSync(path.join(SRC, 'template', 'keyboard.html'), 'utf8');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function bundleThemeEntry(theme) {
  const entry = path.join(DIST, '.tmp', `${theme.id}.js`);
  ensureDir(path.dirname(entry));
  const themeJson = JSON.stringify(theme).replace(/</g, '\\u003c');
  const coreRel = path.relative(path.dirname(entry), path.join(SRC, 'engine', 'rt-core.js')).replace(/\\/g, '/');
  const entryCode = `import { bootKeyboard } from '${coreRel}';\nconst theme = ${themeJson};\nbootKeyboard(theme);\n`;
  fs.writeFileSync(entry, entryCode);

  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    absWorkingDir: ROOT
  });
  return result.outputFiles[0].text;
}

function buildKeyboardHtml(theme, script) {
  const extraCss = theme.extraCss || '';
  return KBD_TEMPLATE
    .replace('{{TITLE}}', theme.name + ' — Rhythmic Typing')
    .replace('{{STYLES}}', STYLES + extraCss)
    .replace('{{SCRIPT}}', script);
}

function buildControlPanel(catalog) {
  const catJson = JSON.stringify(catalog);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rhythmic Typing Control Panel</title>
<style>
:root{--navy:#17335f;--ink:#182131;--muted:#5d6b82;--line:#c3ccda;--panel:#fff;--radius:18px;--font:system-ui,sans-serif}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;min-height:100dvh;font-family:var(--font);color:var(--ink)}
body.theme-cream{background:linear-gradient(165deg,#fff8eb,#ffe9c7)}
body.theme-space{background:linear-gradient(165deg,#0f172a,#1e1b4b);color:#e2e8f0}
body.theme-neon{background:linear-gradient(165deg,#1a0a00,#2a1206);color:#fff}
body.theme-nature{background:linear-gradient(165deg,#ecfdf5,#d1fae5)}
body.theme-arcade{background:#0a0a12;color:#0f0}
body.dark{filter:none}
.page{width:min(96vw,1100px);margin:0 auto;padding:12px}
.app{background:var(--panel);border:3px solid var(--navy);border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(23,51,95,.14)}
body.theme-space .app,body.theme-neon .app,body.theme-arcade .app{background:rgba(15,23,42,.92);border-color:#475569;color:#e2e8f0}
.step-nav{display:flex;justify-content:center;gap:8px;padding:12px;flex-wrap:wrap;border-bottom:2px dashed rgba(23,51,95,.12)}
.step-dot{padding:10px 18px;border-radius:999px;font-weight:600;border:2px solid var(--line);background:#fff;cursor:default}
.step-dot.active{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border-color:#1e40af}
.step-dot.done{background:linear-gradient(180deg,#4ade80,#22c55e);color:#fff}
.step-panel{display:none;padding:16px}
.step-panel.active{display:block}
.step-title{text-align:center;font-size:26px;font-weight:700;color:var(--navy);margin:0 0 8px}
body.theme-space .step-title{color:#93c5fd}
.picture-grid{display:grid;grid-template-columns:repeat(4,minmax(0,100px));gap:10px;justify-content:center;margin-bottom:16px}
.picture-btn{border:3px solid var(--line);border-radius:16px;padding:6px;background:#fff;cursor:pointer;aspect-ratio:1}
.picture-btn.selected{border-color:var(--navy);background:#eef4ff}
.picture-btn img{width:100%;height:100%;object-fit:contain}
.code-slots{display:flex;justify-content:center;gap:10px;margin:12px 0}
.code-slot{width:72px;height:72px;border:2px dashed var(--line);border-radius:16px;display:flex;align-items:center;justify-content:center;background:#eef2f8}
.code-slot.filled{border-style:solid;border-color:var(--navy)}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center}
.toolbar select,.toolbar button{padding:8px 12px;border-radius:10px;border:2px solid var(--line);font-weight:600;cursor:pointer}
.kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-bottom:16px}
.kcard{border:2px solid var(--line);border-radius:12px;padding:8px;cursor:pointer;text-align:center;transition:transform .1s}
.kcard:hover{transform:translateY(-2px)}
.kcard.selected{border-color:var(--navy);box-shadow:0 0 0 3px rgba(23,51,95,.15)}
.kcard-preview{aspect-ratio:1;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;font-size:28px}
.kcard-name{font-size:11px;font-weight:700;line-height:1.2}
.lesson-form{display:grid;gap:12px;max-width:400px}
.field label{display:block;font-size:13px;font-weight:700;margin-bottom:4px}
.field select{width:100%;padding:10px;border-radius:10px;border:2px solid var(--line)}
.kb-wrap{border:2px solid var(--line);border-radius:14px;padding:12px;background:#f8fafc;margin-top:12px}
.kb{display:flex;flex-direction:column;gap:3px}
.row{display:flex;gap:3px;justify-content:center}
.k{min-width:24px;height:24px;border-radius:4px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;background:#dde3ea;color:#999;opacity:.45}
.k.active{opacity:1;color:#fff}
.k.lp.active{background:#E53935}.k.lr.active{background:#1E88E5}.k.lm.active{background:#FB8C00}.k.li.active{background:#43A047}
.k.ri.active{background:#8E24AA}.k.rm.active{background:#FDD835;color:#333}.k.rr.active{background:#00ACC1}.k.rp.active{background:#D81B60}.k.th.active{background:#ECEFF1;color:#333}
.btn{padding:12px 28px;border-radius:999px;font-weight:700;border:none;cursor:pointer;font-size:16px}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-next{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff}
.btn-go{background:linear-gradient(180deg,#4ade80,#22c55e);color:#fff;font-size:18px}
.btn-back{background:#fff;border:2px solid var(--line);color:var(--muted)}
.step-actions{display:flex;justify-content:space-between;margin-top:16px;flex-wrap:wrap;gap:8px}
.footer{padding:12px;text-align:center;font-size:12px;color:var(--muted);border-top:2px dashed rgba(23,51,95,.1)}
</style>
</head>
<body class="theme-cream">
<div class="page"><div class="app">
<nav class="step-nav">
<div class="step-dot active" data-step="1">1 Sign In</div>
<div class="step-dot" data-step="2">2 Keyboard</div>
<div class="step-dot" data-step="3">3 Lesson</div>
</nav>
<section class="step-panel active" id="step1">
<h2 class="step-title">Sign In</h2>
<p style="text-align:center;color:var(--muted)">Choose 3 pictures for your code.</p>
<div class="picture-grid" id="pictureGrid"></div>
<div class="code-slots" id="codeSlots"><div class="code-slot">1</div><div class="code-slot">2</div><div class="code-slot">3</div></div>
<p id="codeCount" style="text-align:center">0 of 3</p>
<div class="step-actions"><span></span><button class="btn btn-next" id="btn1" disabled>Next</button></div>
</section>
<section class="step-panel" id="step2">
<h2 class="step-title">Choose Keyboard</h2>
<div class="toolbar">
<select id="catFilter"><option value="all">All categories</option></select>
<select id="panelTheme"><option value="cream">Panel: Warm Cream</option><option value="space">Space Deck</option><option value="neon">Neon Studio</option><option value="nature">Nature</option><option value="arcade">Arcade</option></select>
<button type="button" id="modeToggle">Dark mode</button>
</div>
<div class="kgrid" id="kgrid"></div>
<div class="step-actions"><button class="btn btn-back" id="back2">Back</button><button class="btn btn-next" id="btn2" disabled>Next</button></div>
</section>
<section class="step-panel" id="step3">
<h2 class="step-title">Choose Lesson</h2>
<p id="summary" style="text-align:center;margin-bottom:12px"></p>
<div class="lesson-form">
<div class="field"><label>Lesson</label><select id="lessonSelect"><option value="">Choose...</option></select></div>
<div class="field"><label>Practice set</label><select id="setSelect" disabled><option value="">Choose lesson first</option></select></div>
</div>
<div class="kb-wrap"><div class="kb" id="kb"></div></div>
<div class="step-actions"><button class="btn btn-back" id="back3">Back</button><button class="btn btn-go" id="btnGo" disabled>GO!</button></div>
</section>
<footer class="footer">Picture code stays on this device. <a href="./rhythmic-typing-review-lab.html">Review Lab</a> | <a href="#" id="exportData">Export data</a></footer>
</div></div>
<script>
const CATALOG = ${catJson};
const LESSON_SETS = {
  two:[{label:'Choose...',letters:''},{label:'FG',letters:'FG'},{label:'JH',letters:'JH'},{label:'DE',letters:'DE'},{label:'KI',letters:'KI'}],
  multi:[{label:'Choose...',letters:''},{label:'FGFRFVF',letters:'FGFRFVF'},{label:'JHJUNJN',letters:'JHJUNJN'}],
  finger:[{label:'Choose...',letters:''},{label:'Left Index',letters:'FGRVTCB',pattern:'F G F G F G F SPACE'},{label:'Right Index',letters:'JHUNYM',pattern:'J H J H J H J SPACE'}],
  'easy-keys':[{label:'Easy Keys',letters:'BBCDEFGHIJKMNRTUVY'}],
  'hard-keys':[{label:'Hard Keys',letters:'QAZWSXOLP'}],
  free:[{label:'Free Play',letters:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}]
};
const FINGER={Q:'lp',A:'lp',Z:'lp',W:'lr',S:'lr',X:'lr',E:'lm',D:'lm',C:'lm',R:'li',F:'li',T:'li',G:'li',V:'li',B:'li',Y:'ri',H:'ri',U:'ri',J:'ri',N:'ri',M:'ri',I:'rm',K:'rm',O:'rr',L:'rr',P:'rp',' ':'th'};
const ROWS=['QWERTYUIOP'.split(''),'ASDFGHJKL'.split(''),'ZXCVBNM'.split('')];
const state={step:1,pics:[],kbd:null,lesson:'',setIdx:0,active:new Set()};
function go(n){state.step=n;document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('active'));document.getElementById('step'+n).classList.add('active');document.querySelectorAll('.step-dot').forEach(d=>{const s=+d.dataset.step;d.classList.toggle('active',s===n);d.classList.toggle('done',s<n);});if(n===2)renderKb();if(n===3)renderSummary();}
function renderPics(){const g=document.getElementById('pictureGrid');g.innerHTML=CATALOG.pictures.map(p=>'<button type="button" class="picture-btn'+(state.pics.includes(p.key)?' selected':'')+'" data-k="'+p.key+'"><img src="'+CATALOG.signinImageBase+p.key+'.png" alt="'+p.label+'"></button>').join('');const slots=document.getElementById('codeSlots').children;for(let i=0;i<3;i++){if(state.pics[i]){slots[i].className='code-slot filled';slots[i].innerHTML='<img src="'+CATALOG.signinImageBase+state.pics[i]+'.png">';}else{slots[i].className='code-slot';slots[i].textContent=i+1;}}document.getElementById('codeCount').textContent=state.pics.length+' of 3';document.getElementById('btn1').disabled=state.pics.length!==3;}
document.getElementById('pictureGrid').onclick=e=>{const b=e.target.closest('.picture-btn');if(!b)return;const k=b.dataset.k;const i=state.pics.indexOf(k);if(i>=0)state.pics.splice(i,1);else if(state.pics.length<3)state.pics.push(k);renderPics();};
document.getElementById('btn1').onclick=()=>go(2);
const catFilter=document.getElementById('catFilter');CATALOG.categories.forEach(c=>{if(c.id!=='all'){const o=document.createElement('option');o.value=c.id;o.textContent=c.label;catFilter.appendChild(o);}});
function renderKb(){const cat=catFilter.value;const list=CATALOG.keyboards.filter(k=>cat==='all'||k.category===cat);const g=document.getElementById('kgrid');g.innerHTML=list.map(k=>'<div class="kcard'+(state.kbd&&state.kbd.file===k.file?' selected':'')+'" data-f="'+k.file+'"><div class="kcard-preview" style="background:linear-gradient(135deg,'+k.accent+','+(k.accent2||k.accent)+')">'+({bubble:'🫧',spark:'✨',confetti:'🎉',note:'🎵',firefly:'✦',comet:'☄',gear:'⚙',leaf:'🍃',coin:'🪙',ripple:'〰'}[k.fx]||'⌨')+'</div><div class="kcard-name">'+k.name+'</div></div>').join('');}
catFilter.onchange=renderKb;
document.getElementById('kgrid').onclick=e=>{const c=e.target.closest('.kcard');if(!c)return;state.kbd=CATALOG.keyboards.find(k=>k.file===c.dataset.f);renderKb();document.getElementById('btn2').disabled=!state.kbd;};
document.getElementById('back2').onclick=()=>go(1);document.getElementById('btn2').onclick=()=>go(3);
const ls=document.getElementById('lessonSelect');Object.entries(CATALOG.lessons).forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l.label;ls.appendChild(o);});
function normLetters(s){const set=new Set();(s||'').toUpperCase().split('').forEach(c=>{if(/[A-Z]/.test(c))set.add(c);});if(set.size)set.add('SPACE');return set;}
function updateKb(){const sets=LESSON_SETS[state.lesson];const set=sets?sets[state.setIdx]:null;state.active=set&&set.letters?normLetters(set.letters):new Set();const kb=document.getElementById('kb');kb.innerHTML=ROWS.map(row=>'<div class="row">'+row.map(l=>'<div class="k'+(state.active.has(l)?' active '+FINGER[l]:'')+'">'+l+'</div>').join('')+'</div>').join('')+'<div class="row"><div class="k wide'+(state.active.has('SPACE')?' active th':'')+'">SPACE</div></div>';document.getElementById('btnGo').disabled=!(state.kbd&&state.lesson&&set&&set.letters&&(state.setIdx>0||['easy-keys','hard-keys','free'].includes(state.lesson)));}
ls.onchange=()=>{state.lesson=ls.value;const ss=document.getElementById('setSelect');const sets=LESSON_SETS[state.lesson]||[];ss.innerHTML=sets.map((s,i)=>'<option value="'+i+'">'+s.label+'</option>').join('');ss.disabled=!sets.length;state.setIdx=0;updateKb();};
document.getElementById('setSelect').onchange=e=>{state.setIdx=+e.target.value;updateKb();};
function renderSummary(){document.getElementById('summary').innerHTML=state.kbd?'Keyboard: <b>'+state.kbd.name+'</b> | Code: '+state.pics.join('-'):'';updateKb();}
document.getElementById('back3').onclick=()=>go(2);
document.getElementById('btnGo').onclick=()=>{const sets=LESSON_SETS[state.lesson];const set=sets[state.setIdx];const p=new URLSearchParams();p.set('keys',Array.from(state.active).sort().join(','));p.set('child',state.pics.join('-'));p.set('activity',state.lesson);p.set('set',set.label);if(set.pattern)p.set('pattern',set.pattern);p.set('keyboard',state.kbd.name);sessionStorage.setItem('rt-panel-url',location.href);window.location.href=CATALOG.keyboardBase+state.kbd.file+'?'+p;};
document.getElementById('panelTheme').onchange=e=>{document.body.className='theme-'+e.target.value;};
document.getElementById('modeToggle').onclick=()=>document.body.classList.toggle('dark');
document.getElementById('exportData').onclick=async e=>{e.preventDefault();try{const m=await import('./rt-data-bundle.js');const j=await m.exportJSON();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download='rt-export.json';a.click();}catch{alert('Open a keyboard session first, or use Review Lab export.');}};
renderPics();renderKb();
Object.entries(CATALOG.lessons).forEach(([v,l])=>{});
</script>
</body>
</html>`;
}

function buildReviewLab(catalog, themes) {
  const samples = themes.filter((t) =>
    ['ocean-reef', 'candy-land', 'neon-beats', 'soft-light', 'typebeat', 'firefly-forest',
     'ocean-reef-high-contrast', 'candy-land-big-button', 'ocean-reef-phone-right'].includes(t.id)
  );
  const cards = samples.map((t) => `
    <div class="lab-card" data-id="${t.id}">
      <h3>${t.name}</h3>
      <iframe src="./${t.file}?activity=free&keys=FGJH,SPACE&child=demo-demo-demo" title="${t.name}"></iframe>
      <div class="sliders">
        <label>Effect <select data-opt="effectIntensity"><option>low</option><option selected>medium</option><option>high</option></select></label>
        <label>Sound length <select data-opt="noteLength"><option>quick</option><option>brief</option><option>medium</option><option selected>beat</option><option>long</option></select></label>
        <label>Volume <input type="range" data-opt="masterVolume" min="0" max="1" step="0.05" value="0.75"></label>
        <label>Button size <select data-opt="buttonSize"><option>medium</option><option>large</option><option selected>xlarge</option></select></label>
      </div>
      <textarea class="comment" placeholder="Your notes on this keyboard..." data-comment="${t.id}"></textarea>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rhythmic Typing Review Lab</title>
<style>
body{margin:0;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:16px}
h1{text-align:center}
.lab-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.lab-card{background:#1e293b;border-radius:16px;padding:12px;border:2px solid #334155}
.lab-card iframe{width:100%;height:280px;border:none;border-radius:10px;background:#000}
.sliders{display:grid;gap:6px;margin:8px 0;font-size:13px}
.comment{width:100%;min-height:60px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#fff;padding:8px}
.toolbar{text-align:center;margin:16px 0}
.toolbar button{padding:10px 20px;border-radius:999px;border:none;font-weight:700;cursor:pointer;margin:0 6px;background:#3b82f6;color:#fff}
</style></head><body>
<h1>Rhythmic Typing Review Lab</h1>
<p style="text-align:center;color:#94a3b8">Try keyboards, adjust options, leave comments. Export saves locally.</p>
<div class="toolbar">
<button id="saveComments">Save comments (local)</button>
<button id="exportComments">Export comments JSON</button>
<button id="exportAnon">Export anonymized stats</button>
</div>
<div class="lab-grid">${cards}</div>
<script>
const KEY='rt-lab-comments';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
document.querySelectorAll('.comment').forEach(t=>{const c=load();if(c[t.dataset.comment])t.value=c[t.dataset.comment];t.oninput=()=>{const c=load();c[t.dataset.comment]=t.value;save(c);};});
document.getElementById('saveComments').onclick=()=>alert('Comments saved on this device.');
document.getElementById('exportComments').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(load(),null,2)],{type:'application/json'}));a.download='rt-lab-comments.json';a.click();};
document.getElementById('exportAnon').onclick=async()=>{try{const m=await import('./rt-data-bundle.js');const j=await m.exportAnonymizedAggregate();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download='rt-anonymized.json';a.click();}catch(e){alert('No session data yet.');}};
</script></body></html>`;
}

async function bundleDataModule() {
  const result = await esbuild.build({
    entryPoints: [path.join(SRC, 'engine', 'rt-data.js')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: ['es2020']
  });
  return result.outputFiles[0].text;
}

async function main() {
  console.log('Building Rhythmic Typing dist/...');
  ensureDir(DIST);
  ensureDir(path.join(DIST, '.tmp'));

  const catalog = { ...CATALOG, buildDate: new Date().toISOString() };
  let built = 0;

  for (const theme of THEMES) {
    const script = await bundleThemeEntry(theme);
    const html = buildKeyboardHtml(theme, script);
    fs.writeFileSync(path.join(DIST, theme.file), html);
    built++;
    if (built % 10 === 0) console.log(`  ${built}/${THEMES.length} keyboards...`);
  }

  fs.writeFileSync(path.join(DIST, 'rhythmic-typing-control-panel.html'), buildControlPanel(catalog));
  fs.writeFileSync(path.join(DIST, 'rhythmic-typing-review-lab.html'), buildReviewLab(catalog, THEMES));
  fs.writeFileSync(path.join(DIST, 'catalog.json'), JSON.stringify(catalog, null, 2));
  fs.writeFileSync(path.join(DIST, 'rt-data-bundle.js'), await bundleDataModule());

  // Copy signin-images if present
  const signinSrc = path.join(ROOT, 'signin-images');
  const signinDst = path.join(DIST, 'signin-images');
  if (fs.existsSync(signinSrc)) {
    ensureDir(signinDst);
    fs.readdirSync(signinSrc).forEach((f) => {
      fs.copyFileSync(path.join(signinSrc, f), path.join(signinDst, f));
    });
  }

  // Phase 4 media readme
  fs.writeFileSync(path.join(DIST, 'MEDIA_LAYER_README.md'), `# Media Layer (Phase 4)\nSelf-hosted R2 only. Use rt-media.js registerVideo/registerAudio with startAt/endAt/loop.\nNever use Dropbox or external CDN for media.\n`);

  // Phase 5 backend schema export
  fs.writeFileSync(path.join(DIST, 'backend-schema.json'), fs.readFileSync(path.join(SRC, 'engine', 'rt-backend-schema.js'), 'utf8').includes('BACKEND_SCHEMA')
    ? JSON.stringify({
        version: 1,
        roles: ['parent', 'teacher', 'school_admin', 'therapist'],
        entities: ['account', 'student', 'class', 'session', 'progressReport'],
        privacy: { rawEventsOnDevice: true, piiInCloud: false, coppaReviewRequired: true }
      }, null, 2)
    : '{}');

  // Phase 3 harvest endpoint stub
  fs.writeFileSync(path.join(DIST, 'harvest-upload-stub.md'), `# Anonymous Harvest Upload (Phase 3)\n\nTeachers export rt-anonymized.json from Review Lab or Control Panel.\nOptional: POST to Cloudflare Worker endpoint (to be configured).\n\n\`\`\`json\n{ "type": "anonymized_aggregate", "profileCount": N, "aggregates": {} }\n\`\`\`\n`);

  // Cleanup tmp
  fs.rmSync(path.join(DIST, '.tmp'), { recursive: true, force: true });

  console.log(`Done: ${built} keyboards + control panel + review lab in dist/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
