"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { JsonImportDialog } from "@/components/JsonImportDialog";
import { useJson } from "@/providers/JsonProvider";
import type { JSONValue } from "@/lib/json";
import { toast } from "sonner";
import { DuplicateSessionDialog } from "@/components/sessions/DuplicateSessionDialog";
import { UnsavedChangesDialog } from "@/components/sessions/UnsavedChangesDialog";

export function JsonImportButton({
  label = "Import",
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
    return sessions.find((s) => s.id === duplicateId)?.name || "Existing session";
  }, [duplicateId, sessions]);

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

  const onImport = (obj: unknown) => {
    const value = obj as JSONValue;
    startImport(value);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <FileJson className="mr-2 size-4" /> {label}
      </Button>
      <JsonImportDialog
        open={open}
        onOpenChangeAction={setOpen}
        onImportAction={onImport}
        title="Import JSON"
      />
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

export default JsonImportButton;
