"use client";

import React, { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SaveTemplateDialog({
  open,
  onOpenChangeAction,
  onSaveAction,
}: {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
  onSaveAction: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save template</DialogTitle>
          <DialogDescription>Enter a name for this template.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Input
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const n = name.trim();
              if (!n) return;
              onSaveAction(n);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(SaveTemplateDialog);
