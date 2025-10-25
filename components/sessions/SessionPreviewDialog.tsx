"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clipboard, Download } from "lucide-react";
import type { Session } from "@/providers/JsonProvider";
import { toast } from "sonner";

export function SessionPreviewDialog({
  open,
  onOpenChangeAction,
  session,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  session: Pick<Session, "name" | "data"> | null;
}) {
  const jsonText = useMemo(() => (session?.data != null ? JSON.stringify(session.data, null, 2) : ""), [session]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      toast.success("JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadJson = () => {
    try {
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${session?.name || "session"}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Failed to download");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-3xl glass-panel">
        <DialogHeader>
          <DialogTitle>Preview: {session?.name ?? "(untitled)"}</DialogTitle>
          <DialogDescription>Read-only preview of this session&apos;s JSON.</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <ScrollArea className="h-[60vh] w-full rounded border border-white/10 bg-background/50 p-3">
            <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-5">{jsonText}</pre>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChangeAction(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={copyJson}>
            <Clipboard className="mr-2 size-4" /> Copy
          </Button>
          <Button onClick={downloadJson}>
            <Download className="mr-2 size-4" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionPreviewDialog;
