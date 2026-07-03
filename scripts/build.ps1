# Rhythmic Typing build (PowerShell — no Node required)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Src = Join-Path $Root 'src'
$Dist = Join-Path $Root 'dist'
$Styles = Get-Content (Join-Path $Src 'engine\rt-styles.css') -Raw
$Bundle = Get-Content (Join-Path $Src 'engine\rt-bundle.js') -Raw

if (-not (Test-Path $Dist)) { New-Item -ItemType Directory -Path $Dist | Out-Null }

$Presets = @{
  ocean = @{ bgClass='rt-bg-ocean'; fx='bubble'; soundVoice='bubble' }
  candy = @{ bgClass='rt-bg-candy'; fx='confetti'; soundVoice='mallet' }
  space = @{ bgClass='rt-bg-space'; fx='comet'; soundVoice='chime'; tone='dark' }
  neon = @{ bgClass='rt-bg-neon'; fx='note'; soundVoice='arcade'; tone='dark'; kbBg='rgba(0,0,0,.55)' }
  forest = @{ bgClass='rt-bg-forest'; fx='firefly'; soundVoice='chime'; tone='dark' }
  garden = @{ bgClass='rt-bg-garden'; fx='leaf'; soundVoice='piano' }
  treasure = @{ bgClass='rt-bg-treasure'; fx='coin'; soundVoice='chime'; tone='dark' }
  robot = @{ bgClass='rt-bg-robot'; fx='gear'; soundVoice='drum'; tone='dark' }
  truck = @{ bgClass='rt-bg-truck'; fx='spark'; soundVoice='drum' }
  calm = @{ bgClass='rt-bg-calm'; fx='ripple'; soundVoice='piano' }
  arctic = @{ bgClass='rt-bg-arctic'; fx='spark'; soundVoice='chime'; tone='dark' }
  desert = @{ bgClass='rt-bg-desert'; fx='ripple'; soundVoice='mallet' }
  arcade = @{ bgClass='rt-bg-arcade'; fx='spark'; soundVoice='arcade'; tone='dark' }
  highcontrast = @{ bgClass='rt-bg-hc'; fx='ripple'; kbBg='#000'; contrast='high' }
}

function Write-Utf8File($path, $content) {
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

function Slug($name) { ($name.ToLower() -replace '[^a-z0-9]+','-').Trim('-') }

$Defs = @(
  @{ name='Ocean Reef'; preset='ocean'; category='nature'; accent='#38bdf8' }
  @{ name='Candy Land'; preset='candy'; category='playful'; accent='#ff47b8' }
  @{ name='Space World'; preset='space'; category='adventure'; accent='#7c5cff' }
  @{ name='Neon Beats'; preset='neon'; category='music'; age='older'; accent='#ff580c' }
  @{ name='Firefly Forest'; preset='forest'; category='nature'; accent='#ffe16b' }
  @{ name='Magic Garden'; preset='garden'; category='nature'; accent='#ff7eb3' }
  @{ name='Treasure Hunt'; preset='treasure'; category='adventure'; accent='#ffd15c' }
  @{ name='Robot Factory'; preset='robot'; category='adventure'; accent='#ffb12c' }
  @{ name='Monster Trucks'; preset='truck'; category='adventure'; accent='#ff4b23' }
  @{ name='Soft Light'; preset='calm'; category='calm'; accent='#2563eb' }
  @{ name='Arctic Lights'; preset='arctic'; category='nature'; accent='#22d3ee' }
  @{ name='Desert Dunes'; preset='desert'; category='nature'; accent='#e65100' }
  @{ name='Arcade Retro'; preset='arcade'; category='music'; age='older'; accent='#00ff88' }
  @{ name='TypeBeat'; preset='neon'; category='music'; age='older'; accent='#FFC107' }
  @{ name='Music Studio'; preset='neon'; category='music'; accent='#e879f9' }
  @{ name='Rainbow Bubble'; preset='candy'; category='playful'; accent='#ff6fae' }
  @{ name='Underwater Glow'; preset='ocean'; category='nature'; accent='#57e3ff'; tone='dark' }
  @{ name='Galaxy Orbit'; preset='space'; category='adventure'; accent='#60a5fa' }
  @{ name='Fireworks'; preset='space'; category='playful'; accent='#ffd700' }
  @{ name='Color Pop'; preset='candy'; category='playful'; accent='#db2777' }
  @{ name='Seasons'; preset='garden'; category='nature'; accent='#f59e0b' }
  @{ name='Zen Garden'; preset='calm'; category='calm'; accent='#6b8f71' }
  @{ name='Night Sky Calm'; preset='forest'; category='calm'; accent='#94a3b8' }
  @{ name='Cozy Room'; preset='calm'; category='calm'; accent='#d4a5a5' }
  @{ name='Ice Cream Parlor'; preset='candy'; category='playful'; accent='#f472b6' }
  @{ name='Balloon Party'; preset='candy'; category='playful'; accent='#3b82f6' }
  @{ name='Dino Valley'; preset='garden'; category='adventure'; accent='#65a30d' }
  @{ name='Pirate Cove'; preset='treasure'; category='adventure'; accent='#fbbf24' }
  @{ name='Weather Sky'; preset='calm'; category='nature'; accent='#0ea5e9' }
  @{ name='Galaxy DJ'; preset='neon'; category='music'; age='older'; accent='#c084fc' }
  @{ name='North Pole Lights'; preset='arctic'; category='nature'; accent='#ffd447' }
  @{ name='Bubble Stars'; preset='calm'; category='playful'; accent='#0ea5e9' }
  @{ name='Sky Pop'; preset='candy'; category='playful'; accent='#a78bfa' }
  @{ name='Garden Glow'; preset='garden'; category='nature'; accent='#22c55e' }
  @{ name='Clean Bright'; preset='calm'; category='calm'; accent='#2563eb' }
  @{ name='Neon Aurora'; preset='arctic'; category='music'; accent='#22d3ee' }
)

$Themes = @()
foreach ($d in $Defs) {
  $p = $Presets[$d.preset]
  $id = Slug $d.name
  $Themes += [ordered]@{
    id=$id; file="kbd-$id.html"; name=$d.name; category=$d.category
    age=if($d.age){$d.age}else{'all'}; tone=if($d.tone){$d.tone}else{if($p.tone){$p.tone}else{'light'}}
    fx=$p.fx; soundVoice=$p.soundVoice; accent=$d.accent; bgClass=$p.bgClass
    kbBg=if($p.kbBg){$p.kbBg}else{'rgba(0,0,0,.35)'}
    format='qwerty'
  }
}

# Accessibility + phone variants
$BaseNames = @('Ocean Reef','Candy Land','Neon Beats','Soft Light')
foreach ($bn in $BaseNames) {
  $base = $Themes | Where-Object { $_.name -eq $bn } | Select-Object -First 1
  if (-not $base) { continue }
  $sid = Slug $bn
  $Themes += [ordered]@{ id="$sid-high-contrast"; file="kbd-$sid-high-contrast.html"; name="$bn (High Contrast)"; category='accessibility'; age='all'; tone=$base.tone; fx='ripple'; soundVoice=$base.soundVoice; accent=$base.accent; bgClass='rt-bg-hc'; kbBg='#000'; format='qwerty'; contrast='high'; buttonSize='large' }
  $Themes += [ordered]@{ id="$sid-big-button"; file="kbd-$sid-big-button.html"; name="$bn (Big Button)"; category='accessibility'; age='all'; tone=$base.tone; fx=$base.fx; soundVoice=$base.soundVoice; accent=$base.accent; bgClass=$base.bgClass; kbBg=$base.kbBg; format='qwerty'; buttonSize='xlarge' }
  $Themes += [ordered]@{ id="$sid-calm"; file="kbd-$sid-calm.html"; name="$bn (Calm)"; category='accessibility'; age='all'; tone=$base.tone; fx=$base.fx; soundVoice=$base.soundVoice; accent=$base.accent; bgClass=$base.bgClass; kbBg=$base.kbBg; format='qwerty'; reduceMotion=$true }
  $Themes += [ordered]@{ id="$sid-phone-right"; file="kbd-$sid-phone-right.html"; name="$bn (Phone - Right Hand)"; category='phone'; age='all'; tone=$base.tone; fx=$base.fx; soundVoice=$base.soundVoice; accent=$base.accent; bgClass=$base.bgClass; kbBg=$base.kbBg; format='phone-4' }
  $Themes += [ordered]@{ id="$sid-phone-left"; file="kbd-$sid-phone-left.html"; name="$bn (Phone - Left Hand)"; category='phone'; age='all'; tone=$base.tone; fx=$base.fx; soundVoice=$base.soundVoice; accent=$base.accent; bgClass=$base.bgClass; kbBg=$base.kbBg; format='phone-4-left' }
}

function Build-KeyboardHtml($theme) {
  $themeJson = ($theme | ConvertTo-Json -Compress) -replace '</','<\/'
  @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>$($theme.name) - Rhythmic Typing</title>
<style>$Styles</style>
</head>
<body>
<div id="rt-root"></div>
<script>$Bundle</script>
<script>RT.bootKeyboard($themeJson);</script>
</body>
</html>
"@
}

$count = 0
foreach ($t in $Themes) {
  $html = Build-KeyboardHtml $t
  Write-Utf8File (Join-Path $Dist $t.file) $html
  $count++
}
Write-Host "Built $count keyboards"

# catalog.json
$Catalog = @{
  version='2.0.0'
  buildDate=(Get-Date).ToString('o')
  keyboardBase='./'
  signinImageBase='./signin-images/'
  panelUrl='./rhythmic-typing-control-panel.html'
  keyboards=@($Themes | ForEach-Object { @{ id=$_.id; file=$_.file; name=$_.name; tone=$_.tone; category=$_.category; age=$_.age; fx=$_.fx; accent=$_.accent; format=$_.format } })
}
$Catalog | ConvertTo-Json -Depth 6 | ForEach-Object { Write-Utf8File (Join-Path $Dist 'catalog.json') $_ }

# Copy signin-images
$signSrc = Join-Path $Root 'signin-images'
$signDst = Join-Path $Dist 'signin-images'
if (Test-Path $signSrc) {
  if (-not (Test-Path $signDst)) { New-Item -ItemType Directory -Path $signDst | Out-Null }
  Copy-Item (Join-Path $signSrc '*') $signDst -Force
}

# Generate control panel from template
$PanelTpl = Get-Content (Join-Path $Src 'template\control-panel.html') -Raw -ErrorAction SilentlyContinue
if ($PanelTpl) {
  $catJson = ($Catalog | ConvertTo-Json -Depth 6 -Compress)
  Write-Utf8File (Join-Path $Dist 'rhythmic-typing-control-panel.html') ($PanelTpl.Replace('{{CATALOG_JSON}}', $catJson))
}

# Generate review lab
$LabTpl = Get-Content (Join-Path $Src 'template\review-lab.html') -Raw -ErrorAction SilentlyContinue
if ($LabTpl) {
  $sampleIds = @('ocean-reef','candy-land','neon-beats','soft-light','typebeat','firefly-forest','ocean-reef-high-contrast','candy-land-big-button','ocean-reef-phone-right')
  $samples = $Themes | Where-Object { $sampleIds -contains $_.id }
  $cards = ($samples | ForEach-Object {
    "<div class=`"lab-card`"><h3>$($_.name)</h3><iframe src=`"./$($_.file)?activity=free&keys=F,G,J,H,SPACE&child=demo-demo-demo&noteLength=brief`" title=`"$($_.name)`"></iframe><textarea class=`"comment`" data-comment=`"$($_.id)`" placeholder=`"Your notes...`"></textarea></div>"
  }) -join "`n"
  Write-Utf8File (Join-Path $Dist 'rhythmic-typing-review-lab.html') ($LabTpl.Replace('{{LAB_CARDS}}', $cards))
}

# Gaming-style start / landing page
$StartTpl = Get-Content (Join-Path $Src 'template\start.html') -Raw -ErrorAction SilentlyContinue
if ($StartTpl) {
  Write-Utf8File (Join-Path $Dist 'index.html') $StartTpl
} else {
  Write-Utf8File (Join-Path $Dist 'index.html') '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=rhythmic-typing-control-panel.html"><title>Rhythmic Typing</title></head><body><p><a href="rhythmic-typing-control-panel.html">Open Rhythmic Typing</a></p></body></html>'
}

Write-Utf8File (Join-Path $Dist 'README.md') @'
# Rhythmic Typing v2.1 (dist)

Use this folder only. Legacy HTML files in the parent folder are deprecated.

Start: rhythmic-typing-control-panel.html
Finger colors: kbd-finger-colors-preview.html
Review lab: rhythmic-typing-review-lab.html

Rebuild: powershell -File ../scripts/build.ps1
'@

# Phase docs
Write-Utf8File (Join-Path $Dist 'MEDIA_LAYER_README.md') "# Media Layer (Phase 4)`nSelf-hosted R2 only. See src/engine/rt-media.js`n"
Write-Utf8File (Join-Path $Dist 'harvest-upload-stub.md') "# Anonymous Harvest (Phase 3)`nExport rt-anonymized.json from Review Lab.`n"
Write-Utf8File (Join-Path $Dist 'backend-schema.json') '{"version":1,"roles":["parent","teacher","school_admin","therapist"],"privacy":{"rawEventsOnDevice":true,"piiInCloud":false}}'

# rt-data-bundle for panel export
Copy-Item (Join-Path $Src 'engine\rt-bundle.js') (Join-Path $Dist 'rt-data-bundle.js') -Force

# Finger color preview keyboard
$FingerPreview = @"
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Finger Color Preview - Rhythmic Typing</title>
<style>$Styles
.rt-title{text-align:center;padding:16px;font-size:22px;font-weight:900;color:#17335f}
.rt-legend{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:12px;font-size:12px}
.rt-legend span{padding:4px 10px;border-radius:999px;color:#fff;font-weight:700}
</style></head><body>
<div class="rt-title">Finger Color Preview - tap any key to hear and see colors</div>
<div class="rt-legend">
<span style="background:#E53935">Left Pinky</span><span style="background:#1E88E5">Left Ring</span>
<span style="background:#FB8C00">Left Middle</span><span style="background:#43A047">Left Index</span>
<span style="background:#8E24AA">Right Index</span><span style="background:#FDD835;color:#333">Right Middle</span>
<span style="background:#00ACC1">Right Ring</span><span style="background:#D81B60">Right Pinky</span>
<span style="background:#ECEFF1;color:#333">Thumbs</span>
</div>
<div id="rt-root"></div>
<script>$Bundle</script>
<script>RT.bootKeyboard({id:'finger-preview',name:'Finger Colors',format:'qwerty',bgClass:'rt-bg-calm',tone:'light',fx:'ripple',accent:'#17335f',soundVoice:'chime'});</script>
<p style="text-align:center;font-size:14px"><a href="./rhythmic-typing-control-panel.html">Control Panel</a> | <a href="./rhythmic-typing-review-lab.html">Review Lab</a></p>
</body></html>
"@
Write-Utf8File (Join-Path $Dist 'kbd-finger-colors-preview.html') $FingerPreview

Write-Host 'Build complete -> dist/'
