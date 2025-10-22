"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function ThemePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Theme</h1>
      <div className="mb-4">
        <ThemeToggle />
      </div>
      <div className="rounded border p-6">
        <div className="mb-2 text-sm text-muted-foreground">Live preview</div>
        <div className="rounded border bg-card p-4 shadow">
          <h2 className="text-lg font-medium">Preview card</h2>
          <p className="text-muted-foreground">
            This area previews colors and border radii.
          </p>
        </div>
      </div>
    </div>
  );
}
