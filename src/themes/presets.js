/** Theme token helpers */
export function themeBase(overrides) {
  return {
    format: 'qwerty',
    tone: 'light',
    category: 'adventure',
    age: 'all',
    fx: 'spark',
    soundVoice: 'mallet',
    accent: '#ffffff',
    accent2: '#ffd700',
    kbBg: 'rgba(0,0,0,.35)',
    kbBorder: 'rgba(255,255,255,.15)',
    bgClass: '',
    bgHtml: '',
    sceneHtml: '',
    extraCss: '',
    looks: [],
    ...overrides
  };
}

export const BG_PRESETS = {
  ocean: {
    bgClass: 'rt-bg-ocean',
    extraCss: `.rt-bg-ocean{background:linear-gradient(180deg,#063a5a,#0c5f82)}
    .rt-bg-ocean::before{content:'';position:absolute;inset:0;background:repeating-radial-gradient(circle at 20% 80%,rgba(255,255,255,.08) 0 2px,transparent 2px 40px);animation:rtWave 8s ease-in-out infinite}
    @keyframes rtWave{0%,100%{opacity:.5}50%{opacity:1}}`,
    fx: 'bubble',
    soundVoice: 'bubble'
  },
  candy: {
    bgClass: 'rt-bg-candy',
    extraCss: `.rt-bg-candy{background:linear-gradient(180deg,#ffd9ec,#ffbfe0,#bff8ff)}`,
    fx: 'confetti',
    soundVoice: 'mallet'
  },
  space: {
    bgClass: 'rt-bg-space',
    extraCss: `.rt-bg-space{background:linear-gradient(180deg,#161149,#281c62)}
    .rt-bg-space::after{content:'';position:absolute;inset:0;background-image:radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 60% 70%,#fff,transparent),radial-gradient(1.5px 1.5px at 80% 20%,#fff,transparent);animation:rtTwinkle 4s ease-in-out infinite}
    @keyframes rtTwinkle{0%,100%{opacity:.6}50%{opacity:1}}`,
    fx: 'comet',
    soundVoice: 'chime'
  },
  neon: {
    bgClass: 'rt-bg-neon',
    extraCss: `.rt-bg-neon{background:linear-gradient(180deg,#1a0a00,#2a1206)}
    .rt-bg-neon::before{content:'';position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(0deg,rgba(255,88,12,.25),transparent)}`,
    fx: 'note',
    soundVoice: 'arcade',
    kbBg: 'rgba(0,0,0,.6)',
    tone: 'dark'
  },
  forest: {
    bgClass: 'rt-bg-forest',
    extraCss: `.rt-bg-forest{background:linear-gradient(180deg,#0b3026,#134232)}`,
    fx: 'firefly',
    soundVoice: 'chime',
    tone: 'dark'
  },
  garden: {
    bgClass: 'rt-bg-garden',
    extraCss: `.rt-bg-garden{background:linear-gradient(180deg,#e9ffdc,#c6efce)}`,
    fx: 'leaf',
    soundVoice: 'piano'
  },
  treasure: {
    bgClass: 'rt-bg-treasure',
    extraCss: `.rt-bg-treasure{background:linear-gradient(180deg,#06394c,#0a5d62)}`,
    fx: 'coin',
    soundVoice: 'chime',
    tone: 'dark'
  },
  robot: {
    bgClass: 'rt-bg-robot',
    extraCss: `.rt-bg-robot{background:linear-gradient(180deg,#16242b,#243640)}`,
    fx: 'gear',
    soundVoice: 'drum',
    tone: 'dark'
  },
  truck: {
    bgClass: 'rt-bg-truck',
    extraCss: `.rt-bg-truck{background:linear-gradient(180deg,#3a2415,#221007)}`,
    fx: 'spark',
    soundVoice: 'drum'
  },
  calm: {
    bgClass: 'rt-bg-calm',
    extraCss: `.rt-bg-calm{background:linear-gradient(180deg,#e0f2fe,#f8fafc)}`,
    fx: 'ripple',
    soundVoice: 'piano'
  },
  arctic: {
    bgClass: 'rt-bg-arctic',
    extraCss: `.rt-bg-arctic{background:linear-gradient(180deg,#0b2f3a,#143d4e)}
    .rt-bg-arctic::before{content:'';position:absolute;top:0;left:0;right:0;height:30%;background:linear-gradient(90deg,transparent,rgba(0,255,200,.15),rgba(200,100,255,.15),transparent);animation:rtAurora 6s ease-in-out infinite}
    @keyframes rtAurora{0%,100%{transform:translateX(-10%)}50%{transform:translateX(10%)}}`,
    fx: 'spark',
    soundVoice: 'chime',
    tone: 'dark'
  },
  desert: {
    bgClass: 'rt-bg-desert',
    extraCss: `.rt-bg-desert{background:linear-gradient(180deg,#f4a460,#e07b39,#c25e2c)}`,
    fx: 'ripple',
    soundVoice: 'mallet'
  },
  arcade: {
    bgClass: 'rt-bg-arcade',
    extraCss: `.rt-bg-arcade{background:#0a0a12}
    .rt-bg-arcade::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,0,.03) 2px,rgba(0,255,0,.03) 4px)}`,
    fx: 'spark',
    soundVoice: 'arcade',
    tone: 'dark'
  },
  highcontrast: {
    bgClass: 'rt-bg-hc',
    extraCss: `.rt-bg-hc{background:#000}`,
    fx: 'ripple',
    kbBg: '#000',
    kbBorder: '#fff',
    contrast: 'high'
  }
};
