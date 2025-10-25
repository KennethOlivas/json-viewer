"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Plus,
  Check,
  Save as SaveIcon,
  Wand2,
  Import as ImportIcon,
  HelpCircle,
} from "lucide-react";

export function RandomJsonToolbar({
  label,
  onOpenSavedAction,
  onNewTemplateAction,
  onApplyAction,
  onSaveAction,
  onSaveAsAction,
  onGenerateAction,
  onImportAction,
  onHelpAction,
  disabledApply,
  disabledSave,
  disabledImport,
}: {
  label: string;
  onOpenSavedAction: () => void;
  onNewTemplateAction: () => void;
  onApplyAction: () => void;
  onSaveAction: () => void;
  onSaveAsAction: () => void;
  onGenerateAction: () => void;
  onImportAction: () => void;
  onHelpAction: () => void;
  disabledApply?: boolean;
  disabledSave?: boolean;
  disabledImport?: boolean;
}) {
  return (
    <div className="sticky top-16 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded border bg-background/50 p-3 md:top-20">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Group: Templates */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onOpenSavedAction}
            className="gap-1.5"
            aria-label="Open saved templates"
            title="Open saved templates (Ctrl/Cmd+O)"
          >
            <FolderOpen className="size-4" />
            <span className="hidden sm:inline">Saved Templates</span>
          </Button>
          <Button
            onClick={onNewTemplateAction}
            className="gap-1.5"
            aria-label="New template"
            title="New template (Ctrl/Cmd+N)"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Template</span>
          </Button>
        </div>

        <div className="hidden md:block h-6 w-px bg-border" aria-hidden="true" />

        {/* Group: Editing */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onApplyAction}
            className="gap-1.5"
            aria-label="Apply template"
            title="Apply template (Ctrl/Cmd+Enter)"
            disabled={disabledApply}
          >
            <Check className="size-4" />
            <span className="hidden sm:inline">Apply</span>
          </Button>
          <Button
            onClick={onSaveAction}
            className="gap-1.5"
            aria-label="Save template"
            title="Save template (Ctrl/Cmd+S)"
            disabled={disabledSave}
          >
            <SaveIcon className="size-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSaveAsAction}
            className="gap-1.5"
            aria-label="Save As"
            title="Save As"
            disabled={disabledSave}
          >
            <SaveIcon className="size-4" />
            <span className="hidden sm:inline">Save As…</span>
          </Button>
        </div>

        <div className="hidden md:block h-6 w-px bg-border" aria-hidden="true" />

        {/* Group: Output */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onGenerateAction}
            className="gap-1.5"
            aria-label="Generate JSON"
            title="Generate JSON (Ctrl/Cmd+G)"
          >
            <Wand2 className="size-4" />
            <span className="hidden sm:inline">Generate JSON</span>
          </Button>
          <Button
            variant="outline"
            onClick={onImportAction}
            className="gap-1.5"
            aria-label="Import to editor"
            title="Import to editor"
            disabled={disabledImport}
          >
            <ImportIcon className="size-4" />
            <span className="hidden sm:inline">Import to Editor</span>
          </Button>
        </div>

        <div className="hidden md:block h-6 w-px bg-border" aria-hidden="true" />

        {/* Group: Help */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onHelpAction}
            className="gap-1.5"
            aria-label="Help"
            title="Help (F1 or ?)"
          >
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline">Help</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(RandomJsonToolbar);
