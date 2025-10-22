const KEY_PREFIX = "json-viewer:";

export function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const testKey = `${KEY_PREFIX}__test`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getItem<T>(key: string, fallback: T): T {
  const ls = safeLocalStorage();
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function removeItem(key: string): void {
  const ls = safeLocalStorage();
  ls?.removeItem(KEY_PREFIX + key);
}
