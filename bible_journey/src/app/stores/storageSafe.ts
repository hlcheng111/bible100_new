/** localStorage 安全讀寫 — 封測離線包防崩潰 */

export function storageAvailable(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const probe = '__b100_storage_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function safeGetItem(key: string): string | null {
  if (!storageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (!storageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeParseJson<T>(raw: string | null): T | null {
  if (raw == null || raw === '' || raw === 'undefined') return null;
  try {
    const parsed = JSON.parse(raw) as T;
    if (parsed === null || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}
