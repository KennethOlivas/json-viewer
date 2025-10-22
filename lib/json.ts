export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

export function parseJsonSafe(input: string): { data?: JSONValue; error?: string } {
  try {
    const data = JSON.parse(input);
    return { data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return { error: message };
  }
}

export function formatJson(input: string, space = 2): { output?: string; error?: string } {
  const { data, error } = parseJsonSafe(input);
  if (error) return { error };
  try {
    return { output: JSON.stringify(data, null, space) };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Format error";
    return { error: message };
  }
}

export function minifyJson(input: string): { output?: string; error?: string } {
  const { data, error } = parseJsonSafe(input);
  if (error) return { error };
  try {
    return { output: JSON.stringify(data) };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Minify error";
    return { error: message };
  }
}

export function stableStringify(value: JSONValue, space = 2): string {
  const seen = new WeakSet();
  const replacer = (_key: string, val: unknown) => {
    if (val && typeof val === "object") {
      const obj = val as Record<string, unknown>;
      if (seen.has(obj)) return;
      seen.add(obj);
      if (!Array.isArray(obj)) {
        return Object.keys(obj)
          .sort()
          .reduce<Record<string, unknown>>((acc, k) => {
            acc[k] = obj[k];
            return acc;
          }, {});
      }
    }
    return val;
  };
  return JSON.stringify(value, replacer, space);
}

export function isObject(v: unknown): v is JSONObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
