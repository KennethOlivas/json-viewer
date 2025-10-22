"use client";

import { type JSONValue, isObject } from "@/lib/json";

function diff(a: JSONValue, b: JSONValue, path: (string|number)[] = [], out: string[] = []): string[] {
  if (typeof a !== typeof b) {
    out.push(`${path.join('.')||'root'}: type ${typeof a} -> ${typeof b}`);
    return out;
  }
  if (isObject(a) && isObject(b)) {
    const ao = a as Record<string, JSONValue>;
    const bo = b as Record<string, JSONValue>;
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const k of keys) diff(ao[k], bo[k], [...path, k], out);
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i=0;i<len;i++) diff(a[i], b[i], [...path, i], out);
    return out;
  }
  if (a !== b) out.push(`${path.join('.')||'root'}: ${String(a)} -> ${String(b)}`);
  return out;
}

export function DiffView({ a, b }: { a: JSONValue; b: JSONValue }) {
  const lines = diff(a, b);
  return (
    <pre className="whitespace-pre-wrap rounded border bg-muted/40 p-3 text-sm">{lines.length ? lines.join("\n") : "No differences"}</pre>
  );
}
