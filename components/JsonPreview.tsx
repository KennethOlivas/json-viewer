"use client";

import { useState, useMemo } from "react";
import { useJson } from "@/providers/JsonProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileJson, Clipboard, Download } from "lucide-react";
import { toast } from "sonner";

export function JsonPreviewButton() {
  const { data } = useJson();
  console.log("JsonPreviewButton data:", data);
  const [open, setOpen] = useState(false);
  const jsonText = useMemo(() => (data != null ? JSON.stringify(data, null, 2) : ""), [data]);
  const hasData = data != null;

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
      a.download = "data.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Failed to download");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={!hasData} title={hasData ? "Show loaded JSON" : "No JSON loaded"}>
        <FileJson className="mr-2 size-4" /> JSON
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loaded JSON</DialogTitle>
            <DialogDescription>Read-only preview of the JSON currently loaded in the app.</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <ScrollArea className="h-[60vh] w-full rounded border border-white/10 bg-background/50 p-3">
              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-5">
                {jsonText}
              </pre>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
            <Button variant="outline" onClick={copyJson}>
              <Clipboard className="mr-2 size-4" /> Copy
            </Button>
            <Button onClick={downloadJson}>
              <Download className="mr-2 size-4" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default JsonPreviewButton;
