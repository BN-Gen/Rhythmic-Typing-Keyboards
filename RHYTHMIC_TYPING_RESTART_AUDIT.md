# Rhythmic Typing Restart Audit

**Date:** June 30, 2026  
**Project:** Body Brain Sensory — Rhythmic Typing  
**Scope:** Control panel restart; clean rebuild from reference only

---

## 1. Current Files Found

All files live in a **flat directory** at `c:\Users\User\Downloads\Keyboards` (76 files, 0 subdirectories).

### HTML files (27)

| File | Type |
|------|------|
| `_specific_use_bodybrainsensory_rhythmic-typing_control-panel-keyboards_rhythmic-typing-control-panel.html` | Combined control panel (reference only) |
| `CONTROL_PANEL_rhythmic_typing.html` | Older standalone control panel |
| `kbd-ocean.html` | Style keyboard |
| `kbd-light-01.html` through `kbd-light-06.html` | Style keyboards |
| `kbd-dark-02.html`, `kbd-dark-03.html` | Style keyboards |
| `kbd-fireworks.html`, `kbd-color-pop.html`, `kbd-space-circles.html` | Style keyboards |
| `kbd-neon-beats.html`, `kbd-bright-lights.html` | Style keyboards |
| `Candy_Land_keyboard.html` | Themed keyboard |
| `Treasure_Hunt_keyboard.html` | Themed keyboard |
| `monster_trucks_keyboard.html` | Themed keyboard |
| `magic_garden_keyboard.html` | Themed keyboard |
| `underwater_glow_keyboard.html` | Themed keyboard |
| `rainbow_bubble_keyboard.html` | Themed keyboard |
| `firefly_forest_keyboard.html` | Themed keyboard |
| `Space_world_Keyboard.html` | Themed keyboard |
| `Robot_Factory_keyboard.html` | Themed keyboard |
| `Music_Studio_keyboard.html` | Themed keyboard |
| `seasons_keyboard.html` | Themed keyboard |

### Other assets

- 27 `.html.json` metadata sidecars
- 21 `.png.json` thumbnail metadata sidecars (no actual PNG files in workspace)
- `READ THIS.TXT` — empty RTF stub

### Logical path vs local path

The combined control panel’s intended R2 path is:

```
_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/rhythmic-typing-control-panel.html
```

Locally it is stored as a single flat filename with path segments encoded as underscores.

---

## 2. Keyboard File Mapping

| Display Name | Old Panel Path | Actual File on Disk | Status |
|--------------|----------------|----------------------|--------|
| Ocean Keys | `keyboards/kbd-ocean.html` | `kbd-ocean.html` | OK (wrong prefix) |
| Candy Land | `keyboards/kbd-candy-land.html` | `Candy_Land_keyboard.html` | Filename mismatch |
| Light 01 | `keyboards/kbd-light-01.html` | `kbd-light-01.html` | OK (wrong prefix) |
| Fireworks | `keyboards/kbd-fireworks.html` | `kbd-fireworks.html` | OK (wrong prefix) |
| Treasure Hunt | `keyboards/kbd-treasure-hunt.html` | `Treasure_Hunt_keyboard.html` | Filename mismatch |
| Light 02 | `keyboards/kbd-light-02.html` | `kbd-light-02.html` | OK (wrong prefix) |
| Color Pop | `keyboards/kbd-color-pop.html` | `kbd-color-pop.html` | OK (wrong prefix) |
| Monster Trucks | `keyboards/kbd-monster-trucks.html` | `monster_trucks_keyboard.html` | Filename mismatch |
| Space Circles | `keyboards/kbd-space-circles.html` | `kbd-space-circles.html` | OK (wrong prefix) |
| Light 03 | `keyboards/kbd-light-03.html` | `kbd-light-03.html` | OK (wrong prefix) |
| Magic Garden | `keyboards/kbd-magic-garden.html` | `magic_garden_keyboard.html` | Filename mismatch |
| Underwater Glow | `keyboards/kbd-underwater-glow.html` | `underwater_glow_keyboard.html` | Filename mismatch |
| Neon Beats | `keyboards/kbd-neon-beats.html` | `kbd-neon-beats.html` | OK (wrong prefix) |
| Rainbow Bubble | `keyboards/kbd-rainbow-bubble.html` | `rainbow_bubble_keyboard.html` | Filename mismatch |
| Light 04 | `keyboards/kbd-light-04.html` | `kbd-light-04.html` | OK (wrong prefix) |
| Light 05 | *(not listed)* | `kbd-light-05.html` | Missing from old panel |
| Light 06 | `keyboards/kbd-light-06.html` | `kbd-light-06.html` | OK (wrong prefix) |
| Dark 02 | `keyboards/kbd-dark-02.html` | `kbd-dark-02.html` | OK (wrong prefix) |
| Dark 03 | `keyboards/kbd-dark-03.html` | `kbd-dark-03.html` | OK (wrong prefix) |
| Firefly Forest | `keyboards/kbd-firefly-forest.html` | `firefly_forest_keyboard.html` | Filename mismatch |
| Space World | `keyboards/kbd-space-world.html` | `Space_world_Keyboard.html` | Filename mismatch |
| Bright Lights | `keyboards/kbd-bright-lights.html` | `kbd-bright-lights.html` | OK (wrong prefix) |
| Robot Factory | `keyboards/kbd-robot-factory.html` | `Robot_Factory_keyboard.html` | Filename mismatch |
| Music Studio | `keyboards/kbd-music-studio.html` | `Music_Studio_keyboard.html` | Filename mismatch |
| Seasons | *(not listed)* | `seasons_keyboard.html` | Missing from old panel |
| Ocean Reef | `keyboards/kbd-ocean-2.html` | — | **Missing file** |
| Neon Shapes | `keyboards/kbd-neon-shapes.html` | — | **Missing file** |
| Dark 03 Alt | `keyboards/kbd-dark-03-alt.html` | — | **Missing file** |

**Summary:** 25 keyboard files present, 3 missing, 11 filename mismatches, all 26 old links use wrong `keyboards/` prefix.

---

## 3. Control Panel Problems

1. **Dual disconnected sign-in systems** — New 8-picture UI (base64 images, `localStorage`) is visible but not wired to GO. Legacy 6-picture SVG system (`picked[]`, `sessionStorage`) is wired to GO but its DOM elements (`#pics`, `#signCount`) do not exist.
2. **`signedIn()` always returns `true`** — GO button enables with only a keyboard selected; 3-picture requirement is never enforced.
3. **Wrong launch paths** — All URLs use `keyboards/{filename}` but no `keyboards/` folder exists locally or in the flat workspace.
4. **Filename mismatches** — 11 themed keyboards use `kbd-*` names in the panel but `*_keyboard.html` names on disk.
5. **Missing keyboard files** — `kbd-ocean-2.html`, `kbd-neon-shapes.html`, `kbd-dark-03-alt.html` referenced but not in repo.
6. **No keyboard reads URL params** — Control panel sends `keys`, `child`, `activity`, `look`, `set`, `teacher`, `keyboard` but zero keyboard HTML files consume them.
7. **Three conflicting `:root` CSS blocks** — Lines ~9, ~132, ~704 with overlapping variables and heavy `!important` overrides.
8. **~14 MB file size** — 9 embedded base64 PNG images (banner + 8 sign-in pictures).
9. **Dead legacy JS** — `ICONS`, `PICS`, `#pics` builder, `.signin`/`.pics` CSS with no matching HTML.
10. **Wrong lesson menu** — Includes Easy Words, Hard Words, Custom Letters, Easy/Hard preset buttons, and A–Z custom picker. Should only offer Letter Pairs and Letter Patterns.
11. **Missing keyboards in catalog** — `seasons_keyboard.html` and `kbd-light-05.html` exist on disk but are not listed.
12. **Mobile layout issues** — Multiple overlapping media-query patches (@560px, @820px, @900px, @1050px) with conflicting grid rules.
13. **Picture set mismatch** — New UI: 8 keys (rocket, sun, tree, bicycle, apple, guitar, basketball, fish). Legacy: 6 keys (rocket, star, rainbow, planet, heart, sun).

---

## 4. Old / Duplicate Code to Remove

### CSS to remove (do not copy into clean file)

- Legacy `.signin`, `.pics`, `.pic`, `.header`, `.title`, `.eqbars`, `.rainbow` selectors
- Second and third `:root` blocks (lines ~132, ~704)
- All `!important` layout overrides from responsive revision patches
- Duplicate `.top-shell .picture-button` and `.selected-mark` definitions
- `.top-shell .controls { display:none }` (unused)

### JavaScript to remove

- Legacy sign-in block: `ICONS`, `PICS`, `picked[]`, `updateSign()`, `sessionStorage rt_pics`
- `signedIn()` stub that always returns `true`
- `sets.easy`, `sets.hard`, `sets.custom` and `quickSets`
- Easy/Hard preset button handlers
- Custom letters input and `#customField`
- Duplicate IIFE picture sign-in that saves to `localStorage` but never calls `refreshGo()` or feeds GO

### HTML to remove

- Single-page layout mixing sign-in + keyboard grid + activity + active keys
- Embedded base64 banner and sign-in images
- Word-list activity options
- Bespoke keyboard note (“opens with its own menu for now”)

---

## 5. How Active Keys Are Currently Passed

**Mechanism:** URL query parameter `keys`

Built by `activeKeysParam()`:
```javascript
[].slice.call(activeLetters).sort().join(',')
// Example: "F,G,J,SPACE"
```

**Sources:**
- Activity dropdown + practice set (`sets` object letter strings)
- Custom letters input
- Direct taps on preview keyboard
- Easy/Hard quick presets

**Not used:** localStorage, sessionStorage, postMessage

**Gap:** No keyboard file reads `keys` from the URL. Keys are always fully playable regardless of what the control panel sends.

---

## 6. How Child Picture Code Is Currently Passed

**Intended:** URL param `child`, built as `picked.join('-')` (e.g. `rocket-apple-fish`)

**Actual:** `picked` comes from the legacy sign-in system whose DOM is missing. Array stays empty. `child=` is almost always blank.

The new sign-in UI stores choices in `localStorage` key `rhythmicTypingPictureCode` but never reads that value for launch.

**Also sent:** `teacher=TEACHER-DEMO` (hardcoded, no UI)

---

## 7. URL Parameters Sent on GO (Current)

```
keyboards/{file}?keys={letters}&child={pics}&teacher=TEACHER-DEMO&keyboard={name}&activity={type}&set={label}&look={variant}
```

| Param | Always? | Example |
|-------|---------|---------|
| `keys` | Yes | `F,G,J,SPACE` |
| `child` | Yes (usually empty) | `rocket-apple-fish` |
| `teacher` | Yes | `TEACHER-DEMO` |
| `keyboard` | Yes | `Ocean Keys` |
| `activity` | If selected | `two`, `multi`, `easy`, `hard`, `custom` |
| `set` | If practice set chosen | `FG - Left index` |
| `look` | If keyboard has multiple themes | `galaxy`, `soft` |

Navigation: `window.location.href` (same tab).

---

## 8. Keyboard Files Still Needing Fixes

All 25 present keyboard files need:

1. **Read URL params** — `URLSearchParams` for `keys`, `child`, `activity`, `set`, `look`, `keyboard`
2. **Active key restriction** — Disable or gently reject keys not in `keys` param (both physical and on-screen)
3. **Lesson integration** — Use `activity` + `set` to drive pattern/sequence instead of hardcoded `PATTERN` / `LEVELS`
4. **Child code display** — Optionally show picture code in a small adult-facing HUD
5. **Look/theme switching** — Honor `look` param where multiple themes exist
6. **In-keyboard lesson controls** — Lesson name, active keys, back to control panel, volume

### Themed keyboards with legacy filenames (may need R2 rename or symlink)

- `Candy_Land_keyboard.html`
- `Treasure_Hunt_keyboard.html`
- `monster_trucks_keyboard.html`
- `magic_garden_keyboard.html`
- `underwater_glow_keyboard.html`
- `rainbow_bubble_keyboard.html`
- `firefly_forest_keyboard.html`
- `Space_world_Keyboard.html`
- `Robot_Factory_keyboard.html`
- `Music_Studio_keyboard.html`
- `seasons_keyboard.html`

### Missing files (exclude from clean panel until created)

- `kbd-ocean-2.html` (Ocean Reef)
- `kbd-neon-shapes.html` (Neon Shapes)
- `kbd-dark-03-alt.html` (Dark 03 Alt)

---

## 9. Rebuild Plan

### Phase 1 — Audit (this document)

- [x] Map all files and keyboard links
- [x] Document problems and duplicate code
- [x] Define corrected keyboard catalog (25 files)
- [x] Define lesson sets (Letter Pairs + Letter Patterns only)

### Phase 2 — Clean control panel (`rhythmic-typing-control-panel-clean.html`)

- [x] 3-step wizard: Sign In → Choose Keyboard → Choose Lesson + GO
- [x] Picture sign-in: 8 emoji buttons, exactly 3 required, Next disabled until complete
- [x] Single unified state (`pickedPics`) passed as `child=` on GO
- [x] 25 keyboard cards with correct filenames (no `keyboards/` prefix for local; configurable `KEYBOARD_BASE` for R2)
- [x] Only Letter Pairs and Letter Patterns lessons
- [x] Active keys preview keyboard with finger colors
- [x] GO builds full URL and navigates same tab
- [x] Single clean CSS block, no base64 images, responsive layout
- [x] Do not overwrite original control panel file

### Phase 3 — Keyboard page updates (future, out of scope for this deliverable)

- Add URL param reading to each keyboard file
- Implement active key restriction
- Add in-keyboard lesson HUD
- Rename themed keyboard files on R2 if desired

---

## 10. R2 Upload Path

### Control panel (clean file)

```
_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/rhythmic-typing-control-panel-clean.html
```

Before upload, set `KEYBOARD_BASE` in the clean file to:

```
https://[your-r2-cdn-domain]/_specific_use/bodybrainsensory/rhythmic-typing/keyboards/
```

(or the actual path where keyboard HTML files live on R2)

### Keyboard files (existing)

Expected R2 location based on old panel:

```
_specific_use/bodybrainsensory/rhythmic-typing/keyboards/{filename}
```

The clean panel uses relative paths (`./filename.html`) for local testing. Change `KEYBOARD_BASE` constant before R2 upload.

### Do not upload automatically

Manual upload only. Verify links after upload by testing Sign In → Choose Keyboard → Choose Lesson → GO for at least one style keyboard and one themed keyboard.

---

## 11. Reference: Clean Panel Lesson Data

### Letter Pairs (`activity=letter-pairs`)

Each set activates its pair letters + SPACE:

FG, FR, FV, FT, FC, FB, JH, JU, JN, JY, JM, DE, DC, KI, SW, SX, LO, AQ, AZ, P

### Letter Patterns (`activity=letter-patterns`)

Each set activates unique letters in the pattern + SPACE:

| Pattern | Active Letters |
|---------|----------------|
| FGFRFVF | F, G, R, V |
| FTFBFCF | F, T, B, C |
| JHJUNJN | J, H, U, N |
| JYJMJHN | J, Y, M, H, N |
| DEDCDED | D, E, C |
| DEDDECE | D, E, C |
| KIKJKIK | K, I, J |
| KIKIKIN | K, I, N |
| SWSXSWS | S, W, X |
| SWSWXSX | S, W, X |
| LOLOLON | L, O, N |
| AQAQAZA | A, Q, Z |
| AZAQAZA | A, Z, Q |
| PPPPPPP | P |

---

*End of audit.*
