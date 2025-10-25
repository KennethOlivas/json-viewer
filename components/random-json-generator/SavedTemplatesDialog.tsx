"use client";

import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateList } from "@/components/random-json-generator/TemplateList";
import type { SavedTemplate } from "@/utils/localStorageTemplates";

export function SavedTemplatesDialog({
  open,
  onOpenChangeAction,
  onSelectAction,
}: {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
  onSelectAction: (tpl: SavedTemplate) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Saved templates</DialogTitle>
          <DialogDescription>
            Load or delete a saved template.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          <TemplateList onSelectAction={onSelectAction} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(SavedTemplatesDialog);
