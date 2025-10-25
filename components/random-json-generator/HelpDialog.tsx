"use client";

import React, { memo, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function HelpDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
}) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
  const res = await fetch("/docs/random-json-generator.html");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const t = await res.text();
  if (!cancelled) setHtml(t);
      } catch {
        if (!cancelled) setError("Failed to load help content.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Random JSON Generator — Help</DialogTitle>
          <DialogDescription>
            Quick reference for using templates, generating data, and importing results.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] rounded border bg-background/40 p-3">
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : html ? (
            <article
              className="prose prose-invert max-w-none text-sm leading-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default memo(HelpDialog);
