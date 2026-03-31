import { Dream, UserProfile, SubscriptionTier } from '../types';

const DREAMS_KEY = 'dreamcode_dreams';
const PROFILE_KEY = 'dreamcode_profile';

const DB_NAME = 'DreamCodeDB';
const DB_VERSION = 1;
const DREAMS_STORE = 'dreams';
const PROFILE_STORE = 'profile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  interests: [],
  subscriptionTier: SubscriptionTier.FREE,
  credits: 0,
  coins: 0,
};

// ─── IndexedDB Layer ───────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;
let _dbUnavailable = false;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  if (_dbUnavailable) return Promise.reject(new Error('IndexedDB unavailable'));

  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DREAMS_STORE)) db.createObjectStore(DREAMS_STORE);
        if (!db.objectStoreNames.contains(PROFILE_STORE)) db.createObjectStore(PROFILE_STORE);
      };
      req.onsuccess = () => {
        _db = req.result;
        resolve(_db);
      };
      req.onerror = () => {
        _dbUnavailable = true;
        reject(req.error);
      };
      req.onblocked = () => {
        _dbUnavailable = true;
        reject(new Error('IndexedDB blocked'));
      };
    } catch (e) {
      _dbUnavailable = true;
      reject(e);
    }
  });
}

async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbSet(storeName: string, key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // IndexedDB nicht verfügbar (z.B. Safari Private Mode) — silent fail
  }
}

// ─── Dreams ───────────────────────────────────────────────────────────────────

export const loadDreamsSecurely = async (): Promise<Dream[]> => {
  // 1. localStorage (schnell)
  let fromLS: Dream[] | null = null;
  try {
    const raw = localStorage.getItem(DREAMS_KEY);
    if (raw) fromLS = JSON.parse(raw);
  } catch { /* corrupt */ }

  // 2. IndexedDB als Fallback / Vergleich
  const fromIDB = await idbGet<Dream[]>(DREAMS_STORE, DREAMS_KEY);

  if (!fromLS && !fromIDB) return [];
  if (!fromLS) return fromIDB!;
  if (!fromIDB) return fromLS;

  // Beide vorhanden → nehme den mit mehr Einträgen (neuerer Stand)
  return fromLS.length >= fromIDB.length ? fromLS : fromIDB;
};

export const saveDreamsSecurely = async (dreams: Dream[]): Promise<void> => {
  // localStorage
  try {
    localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
  } catch (e) {
    console.error('[STORAGE] localStorage Dreams Fehler:', e);
  }
  // IndexedDB (Backup)
  await idbSet(DREAMS_STORE, DREAMS_KEY, dreams);
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const loadProfileSecurely = async (): Promise<UserProfile> => {
  // 1. localStorage
  let fromLS: UserProfile | null = null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) fromLS = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch { /* corrupt */ }

  // 2. IndexedDB als Fallback
  const fromIDB = await idbGet<UserProfile>(PROFILE_STORE, PROFILE_KEY);

  if (!fromLS && !fromIDB) return DEFAULT_PROFILE;
  if (!fromLS) return { ...DEFAULT_PROFILE, ...fromIDB! };
  if (!fromIDB) return fromLS;

  // Beide vorhanden → localStorage bevorzugen (ist schneller aktuell)
  return fromLS;
};

export const saveProfileSecurely = async (profile: UserProfile): Promise<void> => {
  // localStorage
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('[STORAGE] localStorage Profile Fehler:', e);
  }
  // IndexedDB (Backup)
  await idbSet(PROFILE_STORE, PROFILE_KEY, profile);
};

// ─── Sync-Check (für App-Start) ───────────────────────────────────────────────

/**
 * Vergleicht localStorage und IndexedDB.
 * Falls IDB mehr Dreams hat als LS, wird LS mit IDB-Daten überschrieben
 * und die neueren Daten werden zurückgegeben.
 * Gibt { dreams, profile } zurück (merged / neueste Version).
 */
export const syncStorageOnStartup = async (): Promise<{ dreams: Dream[]; profile: UserProfile }> => {
  let lsDreams: Dream[] = [];
  let idbDreams: Dream[] = [];
  let lsProfile: UserProfile | null = null;
  let idbProfile: UserProfile | null = null;

  try {
    const raw = localStorage.getItem(DREAMS_KEY);
    if (raw) lsDreams = JSON.parse(raw);
  } catch { /* corrupt LS */ }

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) lsProfile = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch { /* corrupt LS */ }

  const idbDreamsRaw = await idbGet<Dream[]>(DREAMS_STORE, DREAMS_KEY);
  if (idbDreamsRaw) idbDreams = idbDreamsRaw;

  const idbProfileRaw = await idbGet<UserProfile>(PROFILE_STORE, PROFILE_KEY);
  if (idbProfileRaw) idbProfile = { ...DEFAULT_PROFILE, ...idbProfileRaw };

  // Dreams: nimm den neueren (mehr Einträge)
  let finalDreams: Dream[];
  if (idbDreams.length > lsDreams.length) {
    console.log(`[STORAGE] IDB hat ${idbDreams.length} Dreams, LS nur ${lsDreams.length} → IDB gewinnt`);
    finalDreams = idbDreams;
    // LS nachziehen
    try { localStorage.setItem(DREAMS_KEY, JSON.stringify(idbDreams)); } catch { /* full */ }
  } else {
    finalDreams = lsDreams;
    // IDB nachziehen falls veraltet
    if (lsDreams.length > idbDreams.length) {
      await idbSet(DREAMS_STORE, DREAMS_KEY, lsDreams);
    }
  }

  // Profile: LS gewinnt, IDB als Fallback
  let finalProfile: UserProfile;
  if (!lsProfile && idbProfile) {
    console.log('[STORAGE] Profile nur in IDB gefunden → IDB gewinnt');
    finalProfile = idbProfile;
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(idbProfile)); } catch { /* full */ }
  } else if (lsProfile) {
    finalProfile = lsProfile;
    if (!idbProfile) {
      await idbSet(PROFILE_STORE, PROFILE_KEY, lsProfile);
    }
  } else {
    finalProfile = DEFAULT_PROFILE;
  }

  return { dreams: finalDreams, profile: finalProfile };
};

// ─── Export / Import ─────────────────────────────────────────────────────────

export const exportDataToFile = (profile?: UserProfile, dreams?: Dream[]): void => {
  const exportProfile = profile || DEFAULT_PROFILE;
  const exportDreams = dreams || [];
  const data = {
    dreams: exportDreams,
    profile: exportProfile,
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dreamcode-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDataFromFile = (file: File): Promise<{ dreams: Dream[]; profile: UserProfile }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve({ dreams: data.dreams || [], profile: { ...DEFAULT_PROFILE, ...data.profile } });
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
