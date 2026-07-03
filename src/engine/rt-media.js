/**
 * Phase 4 — Media control layer (self-hosted R2 only).
 * Scaffold for future video/audio segment timing; not used in Phase 1 HTML-only keyboards.
 */
export function createMediaController(config) {
  const state = { playing: new Map(), videos: new Map(), audios: new Map() };

  function registerVideo(id, el, opts = {}) {
    state.videos.set(id, { el, loop: !!opts.loop, startAt: opts.startAt || 0, endAt: opts.endAt });
  }

  function registerAudio(id, el, opts = {}) {
    state.audios.set(id, { el, startAt: opts.startAt || 0, endAt: opts.endAt, loop: !!opts.loop });
  }

  function playSegment(id, type = 'audio') {
    const map = type === 'video' ? state.videos : state.audios;
    const item = map.get(id);
    if (!item?.el) return;
    const { el, startAt, endAt, loop } = item;
    el.currentTime = startAt;
    el.loop = loop;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
    state.playing.set(id, { type, endAt });
    if (endAt && !loop) {
      const check = () => {
        if (el.currentTime >= endAt) {
          el.pause();
          state.playing.delete(id);
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    }
  }

  function stop(id) {
    const v = state.videos.get(id);
    const a = state.audios.get(id);
    if (v?.el) { v.el.pause(); v.el.currentTime = v.startAt || 0; }
    if (a?.el) { a.el.pause(); a.el.currentTime = a.startAt || 0; }
    state.playing.delete(id);
  }

  function stopAll() {
    state.videos.forEach((v) => { if (v.el) v.el.pause(); });
    state.audios.forEach((a) => { if (a.el) a.el.pause(); });
    state.playing.clear();
  }

  return { registerVideo, registerAudio, playSegment, stop, stopAll, config };
}

export const MEDIA_SCHEMA = {
  version: 1,
  fields: ['id', 'type', 'src', 'startAt', 'endAt', 'loop', 'volume', 'trigger']
};
