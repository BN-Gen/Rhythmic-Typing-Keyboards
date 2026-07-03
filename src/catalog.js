import { THEMES } from './themes/index.js';

/** Single source of truth — feeds build + control panel */
export const CATALOG = {
  version: '2.0.0',
  buildDate: null,
  keyboardBase: './',
  signinImageBase: './signin-images/',
  panelUrl: './rhythmic-typing-control-panel.html',
  reviewLabUrl: './rhythmic-typing-review-lab.html',
  pictures: [
    { key: 'rocket', label: 'Rocket' },
    { key: 'sun', label: 'Sun' },
    { key: 'tree', label: 'Tree' },
    { key: 'bicycle', label: 'Bicycle' },
    { key: 'apple', label: 'Apple' },
    { key: 'guitar', label: 'Guitar' },
    { key: 'basketball', label: 'Basketball' },
    { key: 'fish', label: 'Fish' }
  ],
  lessons: {
    two: { label: 'Letter Sequences', sets: 'LESSON_TWO' },
    multi: { label: 'Multiple-Letter Sequences', sets: 'LESSON_MULTI' },
    finger: { label: 'Finger Group Sequences', sets: 'LESSON_FINGER' },
    'easy-keys': { label: 'Easy-to-Type Keys', sets: 'LESSON_EASY' },
    'hard-keys': { label: 'Hard-to-Type Keys', sets: 'LESSON_HARD' },
    free: { label: 'Free Play', sets: 'LESSON_FREE' }
  },
  panelThemes: [
    { id: 'cream', label: 'Warm Cream', tone: 'light' },
    { id: 'space', label: 'Space Deck', tone: 'dark' },
    { id: 'neon', label: 'Neon Studio', tone: 'dark' },
    { id: 'nature', label: 'Nature', tone: 'light' },
    { id: 'arcade', label: 'Arcade', tone: 'dark' }
  ],
  categories: [
    { id: 'all', label: 'All' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'nature', label: 'Nature' },
    { id: 'playful', label: 'Playful' },
    { id: 'music', label: 'Music' },
    { id: 'calm', label: 'Calm' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'phone', label: 'Phone Keypads' }
  ],
  keyboards: THEMES.map((t) => ({
    id: t.id,
    file: t.file,
    name: t.name,
    tone: t.tone,
    category: t.category,
    age: t.age,
    fx: t.fx,
    accent: t.accent,
    accent2: t.accent2 || t.accent,
    format: t.format || 'qwerty',
    looks: t.looks || []
  }))
};

export { THEMES };
