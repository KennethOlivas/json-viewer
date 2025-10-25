"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { JsonImportDialog } from "@/components/JsonImportDialog";
import { useJson } from "@/providers/JsonProvider";
import type { JSONValue } from "@/lib/json";
import { toast } from "sonner";

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
  const { setData } = useJson();

  const onImport = (obj: unknown) => {
    setData(obj as JSONValue);
    toast.success("JSON loaded");
    setOpen(false);
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
    </>
  );
}

export default JsonImportButton;
