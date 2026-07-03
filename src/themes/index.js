import { themeBase, BG_PRESETS } from './presets.js';

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeThemes() {
  const list = [];

  const defs = [
    { name: 'Ocean Reef', preset: 'ocean', category: 'nature', accent: '#38bdf8' },
    { name: 'Candy Land', preset: 'candy', category: 'playful', accent: '#ff47b8' },
    { name: 'Space World', preset: 'space', category: 'adventure', accent: '#7c5cff' },
    { name: 'Neon Beats', preset: 'neon', category: 'music', age: 'older', accent: '#ff580c' },
    { name: 'Firefly Forest', preset: 'forest', category: 'nature', accent: '#ffe16b' },
    { name: 'Magic Garden', preset: 'garden', category: 'nature', accent: '#ff7eb3' },
    { name: 'Treasure Hunt', preset: 'treasure', category: 'adventure', accent: '#ffd15c' },
    { name: 'Robot Factory', preset: 'robot', category: 'adventure', accent: '#ffb12c' },
    { name: 'Monster Trucks', preset: 'truck', category: 'adventure', accent: '#ff4b23' },
    { name: 'Soft Light', preset: 'calm', category: 'calm', accent: '#2563eb' },
    { name: 'Arctic Lights', preset: 'arctic', category: 'nature', accent: '#22d3ee' },
    { name: 'Desert Dunes', preset: 'desert', category: 'nature', accent: '#e65100' },
    { name: 'Arcade Retro', preset: 'arcade', category: 'music', age: 'older', accent: '#00ff88' },
    { name: 'TypeBeat', preset: 'neon', category: 'music', age: 'older', accent: '#FFC107', sceneHtml: '<div style="color:#FFC107;font-size:24px;font-weight:900">TypeBeat</div>' },
    { name: 'Music Studio', preset: 'neon', category: 'music', accent: '#e879f9', sceneHtml: '<div style="color:#e879f9">♪ Studio ♪</div>' },
    { name: 'Rainbow Bubble', preset: 'candy', category: 'playful', accent: '#ff6fae', sceneHtml: '<div style="font-size:20px">🌈</div>' },
    { name: 'Underwater Glow', preset: 'ocean', category: 'nature', accent: '#57e3ff', tone: 'dark' },
    { name: 'Galaxy Orbit', preset: 'space', category: 'adventure', accent: '#60a5fa' },
    { name: 'Fireworks', preset: 'space', category: 'playful', accent: '#ffd700', fx: 'spark' },
    { name: 'Color Pop', preset: 'candy', category: 'playful', accent: '#db2777' },
    { name: 'Seasons', preset: 'garden', category: 'nature', accent: '#f59e0b' },
    { name: 'Zen Garden', preset: 'calm', category: 'calm', accent: '#6b8f71' },
    { name: 'Night Sky Calm', preset: 'forest', category: 'calm', accent: '#94a3b8' },
    { name: 'Cozy Room', preset: 'calm', category: 'calm', accent: '#d4a5a5' },
    { name: 'Ice Cream Parlor', preset: 'candy', category: 'playful', accent: '#f472b6' },
    { name: 'Balloon Party', preset: 'candy', category: 'playful', accent: '#3b82f6' },
    { name: 'Dino Valley', preset: 'garden', category: 'adventure', accent: '#65a30d' },
    { name: 'Pirate Cove', preset: 'treasure', category: 'adventure', accent: '#fbbf24' },
    { name: 'Weather Sky', preset: 'calm', category: 'nature', accent: '#0ea5e9' },
    { name: 'Galaxy DJ', preset: 'neon', category: 'music', age: 'older', accent: '#c084fc' },
    { name: 'North Pole Lights', preset: 'arctic', category: 'nature', accent: '#ffd447' },
    { name: 'Bubble Stars', preset: 'calm', category: 'playful', accent: '#0ea5e9' },
    { name: 'Sky Pop', preset: 'candy', category: 'playful', accent: '#a78bfa' },
    { name: 'Garden Glow', preset: 'garden', category: 'nature', accent: '#22c55e' },
    { name: 'Clean Bright', preset: 'calm', category: 'calm', accent: '#2563eb' },
    { name: 'Neon Aurora', preset: 'arctic', category: 'music', accent: '#22d3ee' }
  ];

  defs.forEach((d) => {
    const p = BG_PRESETS[d.preset] || BG_PRESETS.calm;
    const id = slug(d.name);
    list.push(themeBase({
      id,
      file: `kbd-${id}.html`,
      name: d.name,
      category: d.category,
      age: d.age || 'all',
      tone: d.tone || p.tone || 'light',
      ...p,
      ...d,
      accent: d.accent || p.accent
    }));
  });

  // Accessibility variants
  ['Ocean Reef', 'Candy Land', 'Neon Beats', 'Soft Light'].forEach((name) => {
    const base = list.find((t) => t.name === name);
    if (!base) return;
    const hcId = slug(name) + '-high-contrast';
    list.push(themeBase({
      ...base,
      id: hcId,
      file: `kbd-${hcId}.html`,
      name: name + ' (High Contrast)',
      category: 'accessibility',
      format: base.format,
      ...BG_PRESETS.highcontrast,
      contrast: 'high',
      buttonSize: 'large'
    }));
    const bbId = slug(name) + '-big-button';
    list.push(themeBase({
      ...base,
      id: bbId,
      file: `kbd-${bbId}.html`,
      name: name + ' (Big Button)',
      category: 'accessibility',
      buttonSize: 'xlarge'
    }));
    const calmId = slug(name) + '-calm';
    list.push(themeBase({
      ...base,
      id: calmId,
      file: `kbd-${calmId}.html`,
      name: name + ' (Calm)',
      category: 'accessibility',
      effectIntensity: 'low',
      reduceMotion: true
    }));
  });

  // Phone keypads
  ['Ocean Reef', 'Candy Land', 'Neon Beats', 'Soft Light'].forEach((name) => {
    const base = list.find((t) => t.name === name);
    if (!base) return;
    list.push(themeBase({
      ...base,
      id: slug(name) + '-phone-right',
      file: `kbd-${slug(name)}-phone-right.html`,
      name: name + ' (Phone — Right Hand)',
      category: 'phone',
      format: 'phone-4',
      age: 'all'
    }));
    list.push(themeBase({
      ...base,
      id: slug(name) + '-phone-left',
      file: `kbd-${slug(name)}-phone-left.html`,
      name: name + ' (Phone — Left Hand)',
      category: 'phone',
      format: 'phone-4-left'
    }));
  });

  return list;
}

export const THEMES = makeThemes();
