import { type JSONValue } from "@/lib/json";

export type ParseResult =
  | { ok: true; value: JSONValue }
  | { ok: false; error: string };

export function getType(
  value: JSONValue,
): "string" | "number" | "boolean" | "null" | "object" | "array" {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value as "string" | "number" | "boolean";
}

export function parseLooseJSONValue(input: string): ParseResult {
  const trimmed = input.trim();
  if (trimmed === "") return { ok: false, error: "Value cannot be empty" };

  // Try JSON.parse first
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, value: parsed as JSONValue };
  } catch {}

  // If user typed a bare word, try to coerce common primitives
  if (trimmed === "true") return { ok: true, value: true };
  if (trimmed === "false") return { ok: true, value: false };
  if (trimmed === "null") return { ok: true, value: null };
  if (!Number.isNaN(Number(trimmed)))
    return { ok: true, value: Number(trimmed) };

  // Fallback to string
  return { ok: true, value: trimmed };
}

export function validateKeyName(key: string): string | null {
  if (!key || key.trim() === "") return "Key cannot be empty";
  return null;
}

export function validateKeysUnique(
  rows: Array<{ key: string }>,
): string | null {
  const seen = new Set<string>();
  for (const r of rows) {
    const k = r.key.trim();
    if (seen.has(k)) return `Duplicate key: ${k}`;
    seen.add(k);
  }
  return null;
}

export function deepValidateJSON(value: JSONValue): string | null {
  const t = getType(value);
  switch (t) {
    case "string":
    case "number":
    case "boolean":
    case "null":
      return null;
    case "array": {
      for (const v of value as JSONValue[]) {
        const err = deepValidateJSON(v);
        if (err) return err;
      }
      return null;
    }
    case "object": {
      const obj = value as Record<string, JSONValue>;
      for (const [k, v] of Object.entries(obj)) {
        if (!k || k.trim() === "") return "Object key cannot be empty";
        const err = deepValidateJSON(v);
        if (err) return err;
      }
      return null;
    }
  }
}
