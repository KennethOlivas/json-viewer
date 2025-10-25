"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import DOMPurify from "dompurify";

export function HelpDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
}) {
  const [md, setMd] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        // Try Markdown first
        const r1 = await fetch("/docs/random-json-generator.md");
        if (r1.ok) {
          const text = await r1.text();
          if (!cancelled) setMd(text);
          return;
        }
        // Fallback to prebuilt HTML (sanitize before render)
        const r2 = await fetch("/docs/random-json-generator.html");
        if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
        const t = await r2.text();
        if (!cancelled) setHtml(DOMPurify.sanitize(t));
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
            Quick reference for using templates, generating data, and importing
            results.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] rounded border bg-background/40 p-3">
          {/* Shortcuts cheat sheet */}
          <div className="mb-4 rounded-md border bg-background/60 p-3 text-sm">
            <div className="mb-1 font-medium">Keyboard shortcuts</div>
            <ul className="grid gap-1 text-muted-foreground">
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  S
                </kbd>
                <span className="ml-2">Save</span>
              </li>
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  G
                </kbd>
                <span className="ml-2">Generate JSON</span>
              </li>
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  N
                </kbd>
                <span className="ml-2">New template</span>
              </li>
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  O
                </kbd>
                <span className="ml-2">Open saved templates</span>
              </li>
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  Enter
                </kbd>
                <span className="ml-2">Apply template</span>
              </li>
              <li>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  F1
                </kbd>
                <span className="mx-1">/</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-xs">
                  ?
                </kbd>
                <span className="ml-2">Help</span>
              </li>
            </ul>
          </div>

          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : md ? (
            <article className="prose prose-invert max-w-none text-sm leading-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {md}
              </ReactMarkdown>
            </article>
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
