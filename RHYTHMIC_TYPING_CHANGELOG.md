# Rhythmic Typing Restart — Changelog

**Date:** June 30, 2026

## Added

- `RHYTHMIC_TYPING_RESTART_AUDIT.md` — full audit of current files, problems, and rebuild plan
- `rhythmic-typing-control-panel-clean.html` — new 3-step control panel (Sign In → Choose Keyboard → Choose Lesson → GO)
- 3-step wizard with step indicator dots
- 8 picture sign-in buttons using **original PNG images** from the old control panel (extracted to `signin-images/`)
- Banner image in header (same as old control panel)
- Next/GO buttons gated until requirements are met (3 pictures, 1 keyboard, lesson + set)
- Unified `pickedPics` state passed as `child=rocket-apple-fish` URL param on GO
- 25 keyboard cards with corrected filenames (includes Light 05 and Seasons, excludes 3 missing files)
- Letter Pairs lesson (`activity=letter-pairs`) — 20 pair sets
- Letter Patterns lesson (`activity=letter-patterns`) — 14 pattern sets
- Active keys preview keyboard with finger-color highlighting
- Theme/look chip selector for keyboards with multiple looks
- Configurable `KEYBOARD_BASE` constant for local vs R2 deployment
- Mobile-responsive layout (2-column grid on small screens)

## Fixed (vs old combined control panel)

- Sign-in now actually required before proceeding (Next disabled until 3 pictures chosen)
- Single sign-in system (removed duplicate legacy `picked[]` / `#pics` code)
- Child picture code correctly passed to keyboard via `child=` param
- Keyboard file paths use actual filenames on disk (no broken `keyboards/` prefix for local use)
- Themed keyboard filename mismatches corrected (e.g. `Candy_Land_keyboard.html`)
- Removed Easy Words, Hard Words, Custom Letters, and A–Z custom picker
- Removed ~14 MB of embedded base64 images from control panel HTML (images now live in `signin-images/` folder)
- Single clean CSS block (no duplicate `:root`, no `!important` patches)
- Removed dead legacy JS (`ICONS`, `PICS`, `signedIn()` stub, `quickSets`, etc.)

## Removed (intentionally not carried forward)

- Easy Words / Hard Words activities
- Custom Letters input and A–Z picker
- Easy/Hard quick preset buttons
- Embedded base64 banner and sign-in PNG images
- `teacher=TEACHER-DEMO` param (no teacher login system)
- Single-page layout (replaced with step wizard)
- 3 missing keyboards: Ocean Reef, Neon Shapes, Dark 03 Alt

## Not changed (by design)

- Original control panel file — left untouched as reference
- Individual keyboard HTML files — themes, sounds, artwork unchanged
- No storage/accounts/login systems added
- No automatic upload or deployment

---

## Files Still Needing Fixes

These are **out of scope** for this deliverable but required for full end-to-end workflow:

### All 25 keyboard HTML files

Each needs URL param reading and active-key enforcement:

| File | Priority |
|------|----------|
| `kbd-ocean.html` | High (reference keyboard) |
| `kbd-light-01.html` through `kbd-light-06.html` | High |
| `kbd-dark-02.html`, `kbd-dark-03.html` | High |
| `kbd-fireworks.html`, `kbd-color-pop.html` | High |
| `kbd-space-circles.html`, `kbd-neon-beats.html` | High |
| `kbd-bright-lights.html` | High |
| `Candy_Land_keyboard.html` | Medium |
| `Treasure_Hunt_keyboard.html` | Medium |
| `monster_trucks_keyboard.html` | Medium |
| `magic_garden_keyboard.html` | Medium |
| `underwater_glow_keyboard.html` | Medium |
| `rainbow_bubble_keyboard.html` | Medium |
| `firefly_forest_keyboard.html` | Medium |
| `Space_world_Keyboard.html` | Medium |
| `Robot_Factory_keyboard.html` | Medium |
| `Music_Studio_keyboard.html` | Medium |
| `seasons_keyboard.html` | Medium |

**Required changes per keyboard:**
1. Read `keys`, `child`, `activity`, `set`, `look`, `keyboard` from URL
2. Restrict physical + on-screen keys to active set only
3. Drive lesson pattern from `activity` + `set` params
4. Add in-keyboard HUD: lesson name, active keys, back link, volume
5. Honor `look` param where multiple themes exist

### Missing keyboard files (create or remove from future catalog)

- `kbd-ocean-2.html` (Ocean Reef)
- `kbd-neon-shapes.html` (Neon Shapes)
- `kbd-dark-03-alt.html` (Dark 03 Alt)

### Optional cleanup

- Rename 11 themed `*_keyboard.html` files to `kbd-*` convention on R2 for consistency
- Retire or archive `CONTROL_PANEL_rhythmic_typing.html` (older standalone panel)
- Retire original combined panel once clean version is verified on R2

---

## R2 Upload Instructions

**Do not upload automatically.** Follow these steps manually:

### 1. Control panel (clean file)

**Local files:**
```
rhythmic-typing-control-panel-clean.html
signin-images/          (banner.png + 8 picture PNGs)
```

**R2 destination paths:**
```
_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/rhythmic-typing-control-panel-clean.html
_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/signin-images/banner.png
_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/signin-images/{rocket,sun,tree,bicycle,apple,guitar,basketball,fish}.png
```

### 2. Before upload — set KEYBOARD_BASE and SIGNIN_IMAGE_BASE

Open `rhythmic-typing-control-panel-clean.html` and change:

```javascript
// Local testing:
var KEYBOARD_BASE = './';
var SIGNIN_IMAGE_BASE = './signin-images/';

// R2 production (example — use your actual CDN domain and path):
var KEYBOARD_BASE = 'https://[your-r2-cdn-domain]/_specific_use/bodybrainsensory/rhythmic-typing/keyboards/';
var SIGNIN_IMAGE_BASE = 'https://[your-r2-cdn-domain]/_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/signin-images/';
```

### 3. Keyboard files

Ensure all 25 keyboard HTML files are uploaded to:

```
_specific_use/bodybrainsensory/rhythmic-typing/keyboards/{filename}
```

Themed keyboards keep their current filenames (e.g. `Candy_Land_keyboard.html`) unless you rename them on R2.

### 4. Verify after upload

1. Open the control panel URL in a browser
2. Sign in with 3 pictures — confirm Next enables only at 3/3
3. Choose a keyboard — confirm Next enables
4. Choose Letter Pairs → FG — confirm active keys show F, G, SPACE
5. Click GO — confirm URL includes `keys=F,G,SPACE&child=...&activity=letter-pairs&set=...`
6. Repeat with one themed keyboard (e.g. Candy Land)

### 5. Public URL (example format)

```
https://[your-r2-cdn-domain]/_specific_use/bodybrainsensory/rhythmic-typing/control-panel-keyboards/rhythmic-typing-control-panel-clean.html
```

---

*End of changelog.*
