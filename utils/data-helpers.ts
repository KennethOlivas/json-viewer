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

export function deepUpdateAtPath(
  root: JSONValue,
  path: Path,
  value: JSONValue,
): JSONValue {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Add only missing fields from source into target (mutates and returns target).
 * - Existing keys in target are preserved and never overwritten.
 * - Accepts primitives as values (string, number, boolean, null, undefined) and any other JSON-safe values.
 * - Validates that both target and source are plain objects.
 */
export function addMissingFields(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    throw new TypeError(
      "addMissingFields: both target and source must be plain objects",
    );
  }
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      (target as Record<string, unknown>)[key] = value;
    }
  }
  return target;
}

/**
 * Immutable variant: returns a new object with missing fields added.
 * The original target is not mutated.
 */
export function addMissingFieldsImmutable(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    throw new TypeError(
      "addMissingFieldsImmutable: both target and source must be plain objects",
    );
  }
  let result: Record<string, unknown> | null = null;
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      if (result === null) result = { ...target };
      result[key] = value;
    }
  }
  return result ?? target;
}
