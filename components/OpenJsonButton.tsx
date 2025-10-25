"use client";

import { useMemo, useState } from "react";
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
import { DuplicateSessionDialog } from "@/components/sessions/DuplicateSessionDialog";
import { UnsavedChangesDialog } from "@/components/sessions/UnsavedChangesDialog";

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
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [pendingImport, setPendingImport] = useState<JSONValue | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);

  const {
    dirty,
    activeSessionId,
    saveSession,
    findDuplicateSessionId,
    sessions,
    createSessionWithData,
    overwriteSessionData,
  } = useJson();

  const duplicateName = useMemo(() => {
    if (!duplicateId) return "";
    return (
      sessions.find((s) => s.id === duplicateId)?.name || "Existing session"
    );
  }, [duplicateId, sessions]);

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
  };

  const finalizeAsNew = (value: JSONValue) => {
    createSessionWithData(value);
    toast.success("Imported as new session");
    setPendingImport(null);
    setDuplicateId(null);
    setShowDuplicate(false);
    setShowUnsaved(false);
  };

  const handleDuplicate = (value: JSONValue) => {
    const dup = findDuplicateSessionId(value);
    if (dup) {
      setDuplicateId(dup);
      setPendingImport(value);
      setShowDuplicate(true);
      setOpen(false);
    } else {
      finalizeAsNew(value);
      setOpen(false);
    }
  };

  const startImport = (value: JSONValue) => {
    if (activeSessionId && dirty) {
      setPendingImport(value);
      setShowUnsaved(true);
      setOpen(false);
      return;
    }
    handleDuplicate(value);
  };

  const onImport = () => {
    try {
      const parsed = JSON.parse(jsonText) as JSONValue;
      startImport(parsed);
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <>
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
      <UnsavedChangesDialog
        open={showUnsaved}
        onOpenChangeAction={(o) => {
          if (!o) setShowUnsaved(false);
        }}
        sessionName={sessions.find((s) => s.id === activeSessionId)?.name}
        onSaveAndContinueAction={() => {
          if (pendingImport == null) return;
          saveSession();
          setShowUnsaved(false);
          handleDuplicate(pendingImport);
        }}
        onDiscardAction={() => {
          if (pendingImport == null) return;
          setShowUnsaved(false);
          handleDuplicate(pendingImport);
        }}
      />
      <DuplicateSessionDialog
        open={showDuplicate}
        onOpenChangeAction={(o) => {
          if (!o) setShowDuplicate(false);
        }}
        sessionName={duplicateName}
        onOverwriteAction={() => {
          if (!duplicateId || pendingImport == null) return;
          overwriteSessionData(duplicateId, pendingImport);
          toast.success("Overwrote existing session and activated");
          setPendingImport(null);
          setDuplicateId(null);
          setShowDuplicate(false);
        }}
        onCreateNewAction={() => {
          if (pendingImport == null) return;
          finalizeAsNew(pendingImport);
        }}
      />
    </>
  );
}

export default OpenJsonButton;
