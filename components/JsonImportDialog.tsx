"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, FileJson } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onImportAction: (value: unknown) => void;
  title?: string;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function JsonImportDialog({
  open,
  onOpenChangeAction,
  onImportAction,
  title,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onBrowse = () => inputRef.current?.click();

  const handleFile = useCallback(async (file?: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      setFileName(file.name);
      setFileSize(file.size);
      const obj = JSON.parse(text);
      setParsed(obj);
      setError(null);
      setJsonText(JSON.stringify(obj, null, 2));
    } catch {
      setParsed(null);
      setError("Invalid JSON file");
      setJsonText("");
    }
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const canImport = parsed != null && !error;

  const fileMeta = useMemo(() => {
    if (!fileName) return null;
    return `${fileName}${fileSize != null ? ` • ${formatBytes(fileSize)}` : ""}`;
  }, [fileName, fileSize]);

  const onClose = (v: boolean) => {
    if (!v) {
      setDragOver(false);
      setFileName(null);
      setFileSize(null);
      setJsonText("");
      setParsed(null);
      setError(null);
    }
    onOpenChangeAction(v);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glass-panel">
        <DialogHeader>
          <DialogTitle>{title ?? "Import JSON"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div
            onClick={onBrowse}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="glass-card border flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md p-6 text-center transition-colors hover:bg-white/10 dark:hover:bg-white/5"
          >
            <UploadCloud className="h-6 w-6" />
            <div className="text-sm">
              Drop JSON file here or click to browse
            </div>
            <div className="text-xs text-muted-foreground">
              .json, application/json
            </div>
            {dragOver ? (
              <div className="mt-2 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                Release to upload
              </div>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {fileMeta ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileJson className="h-4 w-4" /> {fileMeta}
            </div>
          ) : null}

          {error ? (
            <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <div>
            <div className="px-1 py-1 text-xs text-muted-foreground">
              Preview
            </div>
            <ScrollArea className="h-[60vh] w-full rounded border border-white/10 bg-background/50 p-3">
              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-5">
                {jsonText || "No preview available yet."}
              </pre>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => parsed != null && onImportAction(parsed)}
            disabled={!canImport}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JsonImportDialog;
