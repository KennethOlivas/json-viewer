const KEY = "flow-data" as const;

export function loadFlow(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveFlow(flow: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(flow));
  } catch {
    // ignore
  }
}

export const defaultFlowJson = {
  nodes: [],
} as const;
