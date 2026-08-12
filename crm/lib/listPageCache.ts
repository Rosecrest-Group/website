const TTL_MS = 30_000;

const store = new Map<string, { data: unknown; at: number }>();

export function getListPageCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setListPageCache<T>(key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}
