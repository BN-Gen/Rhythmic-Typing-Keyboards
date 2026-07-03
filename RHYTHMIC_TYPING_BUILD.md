# Rhythmic Typing v2 — Build & Deploy

Generated output lives in **`dist/`**. Legacy files in the project root are **not modified**.

## Quick start (no Node required)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
```

Open in a browser:
- `dist/rhythmic-typing-control-panel.html` — main control panel
- `dist/rhythmic-typing-review-lab.html` — keyboard review lab with comments
- `dist/kbd-finger-colors-preview.html` — finger color preview (tap keys)
- `dist/kbd-ocean-reef.html` — example themed keyboard (CSS-only, no Dropbox)

## With Node (optional)

```bash
npm install
npm run build
```

Uses `scripts/build.js` (esbuild) when Node is available.

## Source layout

| Path | Purpose |
|------|---------|
| `src/engine/rt-bundle.js` | Single-file engine (keys, audio, fx, settings, data) |
| `src/engine/rt-styles.css` | Layout + finger colors + FX |
| `src/engine/rt-media.js` | Phase 4 media layer scaffold |
| `src/engine/rt-backend-schema.js` | Phase 5 account schema design |
| `src/themes/` | Theme presets and generator |
| `src/catalog.js` | Catalog source (ES modules) |
| `src/template/` | Control panel + review lab templates |
| `scripts/build.ps1` | Primary build (PowerShell) |
| `dist/` | **Upload this folder to R2** |

## Finger color code

| Finger | Color |
|--------|-------|
| Left pinky | Red `#E53935` |
| Left ring | Blue `#1E88E5` |
| Left middle | Orange `#FB8C00` |
| Left index | Green `#43A047` |
| Right index | Purple `#8E24AA` |
| Right middle | Yellow `#FDD835` |
| Right ring | Teal `#00ACC1` |
| Right pinky | Pink `#D81B60` |
| Thumbs | Slate `#ECEFF1` |

## R2 upload

Upload entire `dist/` contents to:

```
_specific_use/bodybrainsensory/rhythmic-typing/
```

Set `keyboardBase` in `catalog.json` / control panel if using a CDN prefix.

## Adding a keyboard

1. Add an entry to `$Defs` in `scripts/build.ps1` (or `src/themes/index.js` for Node build)
2. Re-run build
3. New `kbd-{slug}.html` appears in `dist/` and catalog auto-updates

## Data export (local-first)

- Session events: `localStorage` key `rt-events-v2`
- Settings per child: `localStorage` key `rt-settings-v2`
- Export from control panel footer or Review Lab
- Anonymized aggregate: `rt-anonymized.json` (no names, hashed profile ids)

## Phases delivered

- **Phase 0–1**: Engine, 56 keyboards, control panel, review lab, options, accessibility, phone keypads
- **Phase 2**: Local data capture in engine (`rt-data` / bundle)
- **Phase 3**: Anonymized export + `harvest-upload-stub.md`
- **Phase 4**: `rt-media.js` + `MEDIA_LAYER_README.md` (self-hosted media scaffold)
- **Phase 5**: `backend-schema.json` (design only, no server)
