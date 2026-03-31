import { Dream, UserProfile, SubscriptionTier } from '../types';

const DREAMS_KEY = 'dreamcode_dreams';
const PROFILE_KEY = 'dreamcode_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  interests: [],
  subscriptionTier: SubscriptionTier.FREE,
  credits: 0,
  coins: 0,
};

export const loadDreamsSecurely = (): Dream[] => {
  try {
    const raw = localStorage.getItem(DREAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveDreamsSecurely = (dreams: Dream[]): void => {
  try { localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams)); } catch (e) {
    console.error('[STORAGE] Fehler beim Speichern:', e);
  }
};

export const loadProfileSecurely = (): UserProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
};

export const saveProfileSecurely = (profile: UserProfile): void => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {
    console.error('[STORAGE] Fehler beim Speichern:', e);
  }
};

export const exportDataToFile = (profile?: UserProfile, dreams?: Dream[]): void => {
  const exportProfile = profile || loadProfileSecurely();
  const exportDreams = dreams || loadDreamsSecurely();
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
