import {
  getAtPath as baseGetAtPath,
  setAtPath as baseSetAtPath,
  deleteAtPath as baseDeleteAtPath,
  type JSONValue,
  type JSONObject,
  type JSONArray,
} from "@/lib/json";

export type { JSONValue, JSONObject, JSONArray };

export const getAtPath = baseGetAtPath;
export const setAtPath = baseSetAtPath;
export const deleteAtPath = baseDeleteAtPath;

export type JSONPath = Array<string | number>;

/**
 * Convert a JSON path to a human-friendly dot/bracket string.
 * [] for array indices; "." prefix omitted for root.
 */
export function pathToDisplayString(path: JSONPath): string {
  const s = path
    .map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`))
    .join("");
  return s.startsWith(".") ? s.slice(1) : s || "root";
}
