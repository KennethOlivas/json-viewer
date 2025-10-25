export type SavedTemplate = {
  id: string;
  name: string;
  data: unknown;
  createdAt: string; // ISO string
  lastModified: string; // ISO string
};

const KEY = "jsonStudio.templates" as const;

export function getTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Backfill timestamps for older entries
    const now = new Date().toISOString();
    return (parsed as Array<Partial<SavedTemplate> & Record<string, unknown>>)
      .filter((t) => typeof t.id === "string" && typeof t.name === "string")
      .map((t) => ({
        id: t.id as string,
        name: t.name as string,
        data: t.data,
        createdAt: (t.createdAt as string | undefined) ?? now,
        lastModified:
          (t.lastModified as string | undefined) ??
          (t.createdAt as string | undefined) ??
          now,
      }));
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, data: unknown): SavedTemplate {
  const all = getTemplates();
  const now = new Date().toISOString();
  const t: SavedTemplate = {
    id: crypto.randomUUID(),
    name,
    data,
    createdAt: now,
    lastModified: now,
  };
  const next = [t, ...all];
  localStorage.setItem(KEY, JSON.stringify(next));
  return t;
}

export function deleteTemplate(id: string): void {
  const all = getTemplates();
  const next = all.filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getTemplate(id: string): SavedTemplate | null {
  const all = getTemplates();
  return all.find((t) => t.id === id) ?? null;
}

export function updateTemplate(
  id: string,
  patch: { name?: string; data?: unknown },
): SavedTemplate | null {
  const all = getTemplates();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const current = all[idx];
  const updated: SavedTemplate = {
    ...current,
    ...(patch.name ? { name: patch.name } : {}),
    ...("data" in patch ? { data: patch.data } : {}),
    lastModified: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  localStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}
