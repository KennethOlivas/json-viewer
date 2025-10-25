"use client";

import RandomJsonGenerator from "@/components/random-json-generator/RandomJsonGenerator";

export default function RandomJsonPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Random JSON</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Use a simple template language to generate random JSON. Save templates
        for reuse and import the result into the editor.
      </p>
      <RandomJsonGenerator />
    </div>
  );
}
