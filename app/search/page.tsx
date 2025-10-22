"use client";

import { useState, useMemo } from "react";
import { useJson } from "@/providers/JsonProvider";
import type { JSONValue } from "@/lib/json";

function collectMatches(
  value: JSONValue,
  query: string,
  caseSensitive: boolean,
  path: (string | number)[] = [],
  out: string[] = [],
): string[] {
  const cmp = (s: string) =>
    caseSensitive
      ? s.includes(query)
      : s.toLowerCase().includes(query.toLowerCase());
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    if (cmp(String(value))) out.push(path.join(".") || "root");
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) =>
      collectMatches(v, query, caseSensitive, [...path, i], out),
    );
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (cmp(k)) out.push([...path, k].join("."));
      collectMatches(v, query, caseSensitive, [...path, k], out);
    }
  }
  return out;
}

export default function SearchPage() {
  const { data } = useJson();
  const [q, setQ] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const matches = useMemo(
    () => (data ? collectMatches(data as JSONValue, q, caseSensitive) : []),
    [data, q, caseSensitive],
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Search</h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by key or value"
          className="w-full rounded border bg-background px-3 py-2"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />{" "}
          Case sensitive
        </label>
      </div>
      <div className="text-sm text-muted-foreground">
        {matches.length} matches
      </div>
      <ul className="mt-3 space-y-1">
        {matches.map((m, i) => (
          <li key={i} className="rounded border p-2 font-mono text-xs">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
