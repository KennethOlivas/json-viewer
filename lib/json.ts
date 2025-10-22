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

export type JsonPath = Array<string | number>;

export function getAtPath(root: JSONValue, path: JsonPath): JSONValue | undefined {
  let cur: unknown = root;
  for (const key of path) {
    if (Array.isArray(cur) && typeof key === "number") cur = cur[key];
    else if (cur && typeof cur === "object" && typeof key === "string") cur = (cur as Record<string, unknown>)[key];
    else return undefined;
  }
  return cur as JSONValue | undefined;
}

export function setAtPath(root: JSONValue, path: JsonPath, value: JSONValue): JSONValue {
  const copy = clone(root);
  let cur: unknown = copy;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (Array.isArray(cur) && typeof key === "number") cur = cur[key];
    else if (cur && typeof cur === "object" && typeof key === "string") cur = (cur as Record<string, unknown>)[key];
    else return copy;
  }
  const last = path[path.length - 1];
  if (Array.isArray(cur) && typeof last === "number") (cur as unknown[])[last] = value;
  else if (cur && typeof cur === "object" && typeof last === "string") (cur as Record<string, unknown>)[last] = value;
  return copy;
}

export function deleteAtPath(root: JSONValue, path: JsonPath): JSONValue {
  if (path.length === 0) return root;
  const copy = clone(root);
  let cur: unknown = copy;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (Array.isArray(cur) && typeof key === "number") cur = cur[key];
    else if (cur && typeof cur === "object" && typeof key === "string") cur = (cur as Record<string, unknown>)[key];
    else return copy;
  }
  const last = path[path.length - 1];
  if (Array.isArray(cur) && typeof last === "number") (cur as unknown[]).splice(last, 1);
  else if (cur && typeof cur === "object" && typeof last === "string") delete (cur as Record<string, unknown>)[last];
  return copy;
}
