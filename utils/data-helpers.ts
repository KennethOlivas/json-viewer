import { type JSONValue } from "@/lib/json";

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => deepClone(v)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = deepClone(v);
  }
  return out as T;
}

export type Path = Array<string | number>;

export function deepUpdateAtPath(root: JSONValue, path: Path, value: JSONValue): JSONValue {
  if (path.length === 0) return deepClone(value);
  if (Array.isArray(root)) {
    const idx = path[0];
    if (typeof idx !== "number") return root; // invalid path
    const next = root.slice();
    next[idx] = deepUpdateAtPath(next[idx] as JSONValue, path.slice(1), value);
    return next;
  }
  if (root && typeof root === "object") {
    const [k, ...rest] = path;
    if (typeof k !== "string") return root; // invalid path
    const out = { ...(root as Record<string, JSONValue>) };
    out[k] = deepUpdateAtPath(out[k] as JSONValue, rest, value);
    return out;
  }
  // replacing primitive at end
  return value;
}
