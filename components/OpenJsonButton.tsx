"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileJson } from "lucide-react";
import { useJson } from "@/providers/JsonProvider";
import type { JSONValue } from "@/lib/json";
import { toast } from "sonner";

export function OpenJsonButton({
  label = "Open",
  size = "sm",
  variant = "outline",
}: {
  label?: string;
  size?: "sm" | "lg" | "default" | "icon";
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
}) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState<string>(`{
  "hello": "world"
}`);
  const { setData } = useJson();

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
  };

  const onImport = () => {
    try {
      const parsed = JSON.parse(jsonText) as JSONValue;
      setData(parsed);
      toast.success("JSON loaded");
      setOpen(false);
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <FileJson className="mr-2 size-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl glass-panel">
        <DialogHeader>
          <DialogTitle>Open JSON</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <textarea
            className="min-h-48 w-full resize-y rounded border p-3 font-mono text-sm border-white/10 bg-background/50"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste JSON here..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OpenJsonButton;
