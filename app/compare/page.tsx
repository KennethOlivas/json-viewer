"use client";

import { useState } from "react";
import type { JSONValue } from "@/lib/json";
import { parseJsonSafe } from "@/lib/json";
import { DiffView } from "@/components/DiffView";

export default function ComparePage() {
  const [a, setA] = useState<string>("{\n  \"name\": \"Alice\",\n  \"age\": 30\n}");
  const [b, setB] = useState<string>("{\n  \"name\": \"Alice\",\n  \"age\": 31\n}");

  const pa = parseJsonSafe(a).data as JSONValue;
  const pb = parseJsonSafe(b).data as JSONValue;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Compare</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea value={a} onChange={(e) => setA(e.target.value)} className="h-[40vh] w-full resize-none rounded border bg-background p-3 font-mono text-sm" />
        <textarea value={b} onChange={(e) => setB(e.target.value)} className="h-[40vh] w-full resize-none rounded border bg-background p-3 font-mono text-sm" />
      </div>
      <div className="mt-4">
        {pa && pb ? <DiffView a={pa} b={pb} /> : <div className="text-muted-foreground">Enter valid JSON in both panels</div>}
      </div>
    </div>
  );
}
