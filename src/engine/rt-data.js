/**
 * Local-first session data — IndexedDB + export.
 * Raw data stays on device; anonymized aggregate export for Phase 3.
 */
const DB_NAME = 'rt-sessions-v2';
const DB_VERSION = 1;
const STORE = 'events';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('child', 'child', { unique: false });
        store.createIndex('ts', 'ts', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function logEvent(evt) {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add({ ...evt, ts: Date.now() });
  } catch { /* ignore */ }
}

export async function getAllEvents() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function exportJSON(childFilter) {
  const events = await getAllEvents();
  const filtered = childFilter ? events.filter((e) => e.child === childFilter) : events;
  return JSON.stringify({ version: 2, exported: new Date().toISOString(), events: filtered }, null, 2);
}

export async function exportCSV(childFilter) {
  const events = await getAllEvents();
  const filtered = childFilter ? events.filter((e) => e.child === childFilter) : events;
  const headers = ['ts', 'child', 'keyboard', 'activity', 'key', 'finger', 'noteLength'];
  const rows = filtered.map((e) =>
    headers.map((h) => JSON.stringify(e[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/** Anonymized aggregate for optional upload (Phase 3) — no PII */
export async function exportAnonymizedAggregate() {
  const events = await getAllEvents();
  const byProfile = {};
  events.forEach((e) => {
    const pid = e.profileHash || 'unknown';
    if (!byProfile[pid]) {
      byProfile[pid] = { sessions: 0, keyPresses: 0, fingers: {}, keyboards: {}, totalMs: 0 };
    }
    const b = byProfile[pid];
    b.keyPresses++;
    if (e.finger) b.fingers[e.finger] = (b.fingers[e.finger] || 0) + 1;
    if (e.keyboard) b.keyboards[e.keyboard] = (b.keyboards[e.keyboard] || 0) + 1;
  });
  return JSON.stringify({
    version: 2,
    type: 'anonymized_aggregate',
    exported: new Date().toISOString(),
    profileCount: Object.keys(byProfile).length,
    aggregates: byProfile
  }, null, 2);
}

export function hashProfile(childCode) {
  if (!childCode) return 'anon';
  let h = 0;
  for (let i = 0; i < childCode.length; i++) {
    h = ((h << 5) - h) + childCode.charCodeAt(i);
    h |= 0;
  }
  return 'p_' + Math.abs(h).toString(36);
}

export function startSession(meta) {
  const sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const start = Date.now();
  return {
    sessionId,
    start,
    meta,
    async recordKey(key, finger, noteLength) {
      await logEvent({
        sessionId,
        child: meta.child || '',
        profileHash: hashProfile(meta.child),
        keyboard: meta.keyboard || '',
        activity: meta.activity || '',
        key,
        finger,
        noteLength,
        ts: Date.now() - start
      });
    },
    async end() {
      await logEvent({
        sessionId,
        type: 'session_end',
        child: meta.child || '',
        profileHash: hashProfile(meta.child),
        durationMs: Date.now() - start,
        ts: Date.now()
      });
    }
  };
}
