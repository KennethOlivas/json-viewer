"use client";

import { useJson } from "@/providers/JsonProvider";
import type { JSONValue } from "@/lib/json";

function NodeCard({ k, v }: { k: string; v: JSONValue }) {
  return (
    <div className="rounded border bg-card p-3 shadow">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="truncate text-sm">{typeof v === 'object' && v !== null ? Array.isArray(v) ? `Array(${v.length})` : 'Object' : String(v)}</div>
    </div>
  );
}

export default function GraphViewPage() {
  const { data } = useJson();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Graph View</h1>
      {!data && <div className="text-muted-foreground">Load JSON to visualize.</div>}
      {data && typeof data === 'object' && !Array.isArray(data) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(data).slice(0, 24).map(([k, v]) => (
            <NodeCard key={k} k={k} v={v as JSONValue} />
          ))}
        </div>
      )}
      {Array.isArray(data) && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.slice(0, 24).map((v, i) => (
            <NodeCard key={i} k={String(i)} v={v as JSONValue} />
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">Advanced interactive graph (drag/zoom, relations) planned for a future update.</p>
    </div>
  );
}
