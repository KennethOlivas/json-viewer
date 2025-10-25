"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateEditor } from "@/components/random-json-generator/TemplateEditor";
import { generateRandomJson } from "@/utils/randomJsonGenerator";
import {
  saveTemplate,
  updateTemplate,
  type SavedTemplate,
} from "@/utils/localStorageTemplates";
import { useJson } from "@/providers/JsonProvider";
import { toast } from "sonner";
import { RandomJsonToolbar } from "@/components/random-json-generator/Toolbar";
import { SavedTemplatesDialog } from "@/components/random-json-generator/SavedTemplatesDialog";
import { SaveTemplateDialog } from "@/components/random-json-generator/SaveTemplateDialog";
import { NewTemplateDialog } from "@/components/random-json-generator/NewTemplateDialog";
import { HelpDialog } from "@/components/random-json-generator/HelpDialog";
import { VirtualizedText } from "@/components/random-json-generator/VirtualizedText";
import { getTemplates } from "@/utils/localStorageTemplates";

const DEFAULT_TEMPLATE: object = {
  character: "Hero",
  level: { min: 1, max: 10, integer: true },
  hp: { min: 50, max: 200, integer: true },
  mana: { min: 0, max: 150, integer: true },
  inventory: ["sword", "shield", "potion", "bow"],
  location: {
    x: { min: -100, max: 100, integer: true },
    y: { min: -100, max: 100, integer: true },
  },
};

export function RandomJsonGenerator() {
  const [template, setTemplate] = useState<object>(DEFAULT_TEMPLATE);
  const [editorText, setEditorText] = useState<string>(
    JSON.stringify(DEFAULT_TEMPLATE, null, 2),
  );
  const [output, setOutput] = useState<object | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null,
  );
  const [currentTemplateName, setCurrentTemplateName] = useState<string>("");
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<object | null>(null);
  const { setData } = useJson();

  const textOut = useMemo(
    () => (output ? JSON.stringify(output, null, 2) : ""),
    [output],
  );
  const label = useMemo(
    () =>
      currentTemplateName
        ? `Editing: ${currentTemplateName}`
        : "Unsaved template",
    [currentTemplateName],
  );
  const isEditorValid = useMemo(() => {
    try {
      JSON.parse(editorText);
      return true;
    } catch {
      return false;
    }
  }, [editorText]);

  const onGenerate = useCallback(() => {
    // Auto-apply editor text (if valid) before generating so changes are reflected
    let tpl: object = template;
    if (isEditorValid) {
      try {
        const parsed = JSON.parse(editorText);
        tpl = parsed as object;
        setTemplate(parsed as object);
      } catch {
        // ignore, fallback to previous template
      }
    }
    const obj = generateRandomJson(tpl);
    setOutput(obj as object);
  }, [editorText, isEditorValid, template]);

  const onImport = useCallback(() => {
    if (!output) {
      toast.error("Generate JSON first");
      return;
    }
    // import into editor/state
    // setData expects JSONValue; we trust the template produces serializable JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData(output as any);
    toast.success("Random JSON imported");
  }, [output, setData]);

  const handleApply = useCallback((data: object) => {
    setTemplate(data);
  }, []);

  const handleSave = useCallback(
    (data: object) => {
      if (currentTemplateId) {
        const updated = updateTemplate(currentTemplateId, { data });
        if (updated) {
          toast.success(`Template updated: ${updated.name}`);
        } else {
          toast.error("Failed to update template");
        }
        return;
      }
      // No current template selected -> Save As
      setPendingSaveData(data);
      setShowSaveAsDialog(true);
    },
    [currentTemplateId],
  );

  const onSelectTemplate = useCallback((t: SavedTemplate) => {
    if (t?.data && typeof t.data === "object") {
      setTemplate(t.data as object);
      setEditorText(JSON.stringify(t.data, null, 2));
      setCurrentTemplateId(t.id);
      setCurrentTemplateName(t.name);
      toast.success(`Loaded template: ${t.name}`);
      setShowTemplatesDialog(false);
    }
  }, []);

  // Keyboard shortcuts: Ctrl/Cmd+S (save), Ctrl/Cmd+G (generate), Ctrl/Cmd+N (new), Ctrl/Cmd+Enter (apply), F1 or ? (help)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isEditorValid) {
          try {
            const parsed = JSON.parse(editorText);
            handleSave(parsed);
          } catch {
            /* handled by isEditorValid */
          }
        } else {
          toast.error("Invalid JSON template");
        }
      } else if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        onGenerate();
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setShowNewDialog(true);
      } else if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setShowTemplatesDialog(true);
      } else if (mod && e.key === "Enter") {
        e.preventDefault();
        if (isEditorValid) {
          try {
            const parsed = JSON.parse(editorText);
            handleApply(parsed);
            toast.success("Template applied");
          } catch {
            toast.error("Invalid JSON template");
          }
        } else {
          toast.error("Invalid JSON template");
        }
      } else if (e.key === "F1" || e.key === "?") {
        e.preventDefault();
        setShowHelpDialog(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorText, handleApply, handleSave, isEditorValid, onGenerate]);

  return (
    <>
      <RandomJsonToolbar
        label={label}
        onOpenSavedAction={useCallback(() => setShowTemplatesDialog(true), [])}
        onNewTemplateAction={useCallback(() => setShowNewDialog(true), [])}
        onHelpAction={useCallback(() => setShowHelpDialog(true), [])}
        onApplyAction={useCallback(() => {
          try {
            const parsed = JSON.parse(editorText);
            handleApply(parsed);
            toast.success("Template applied");
          } catch {
            toast.error("Invalid JSON template");
          }
        }, [editorText, handleApply])}
        onSaveAction={useCallback(() => {
          try {
            const parsed = JSON.parse(editorText);
            handleSave(parsed);
          } catch {
            toast.error("Invalid JSON template");
          }
        }, [editorText, handleSave])}
        onSaveAsAction={useCallback(() => {
          try {
            const parsed = JSON.parse(editorText);
            setPendingSaveData(parsed);
            setShowSaveAsDialog(true);
          } catch {
            toast.error("Invalid JSON template");
          }
        }, [editorText])}
        onGenerateAction={onGenerate}
        onImportAction={onImport}
        disabledApply={!isEditorValid}
        disabledSave={!isEditorValid}
        disabledImport={!output}
      />

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Left: Template panel */}
          <div className="rounded border p-3 flex min-h-[60vh] flex-col">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg font-medium">Template</h2>
              <span
                className={
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] " +
                  (isEditorValid
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400")
                }
                aria-live="polite"
              >
                <span
                  className={
                    "size-2 rounded-full " +
                    (isEditorValid ? "bg-green-400" : "bg-red-400")
                  }
                />
                {isEditorValid ? "Valid JSON" : "Invalid JSON"}
              </span>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="grid gap-3">
                <TemplateEditor
                  text={editorText}
                  onTextChangeAction={setEditorText}
                />
                {currentTemplateName ? (
                  <div className="text-xs text-muted-foreground">
                    Editing: {currentTemplateName}
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Output panel */}
          <div className="rounded border p-3 flex min-h-[60vh] flex-col">
            <h2 className="text-lg font-medium">Output</h2>
            <div className="flex-1 min-h-0 w-full">
              <VirtualizedText text={textOut} />
            </div>
          </div>
        </div>
      </div>
      <SavedTemplatesDialog
        open={showTemplatesDialog}
        onOpenChangeAction={setShowTemplatesDialog}
        onSelectAction={onSelectTemplate}
      />

      <SaveTemplateDialog
        open={showSaveAsDialog}
        onOpenChangeAction={setShowSaveAsDialog}
        onSaveAction={(name) => {
          const data = pendingSaveData ?? template;
          const trimmed = name.trim();
          if (!trimmed) return;
          const existing = getTemplates().find((t) => t.name === trimmed);
          if (existing) {
            const ok = window.confirm(
              `A template named "${trimmed}" already exists. Overwrite it?`,
            );
            if (ok) {
              const updated = updateTemplate(existing.id, { data });
              if (updated) {
                setCurrentTemplateId(updated.id);
                setCurrentTemplateName(updated.name);
                toast.success(`Template overwritten: ${updated.name}`);
              } else {
                toast.error("Failed to overwrite template");
              }
              setShowSaveAsDialog(false);
              setPendingSaveData(null);
              return;
            }
            // if user cancels overwrite, do nothing and keep dialog open
            return;
          }
          const saved = saveTemplate(trimmed, data);
          setCurrentTemplateId(saved.id);
          setCurrentTemplateName(saved.name);
          toast.success(`Template saved: ${saved.name}`);
          setShowSaveAsDialog(false);
          setPendingSaveData(null);
        }}
      />

      <NewTemplateDialog
        open={showNewDialog}
        onOpenChangeAction={setShowNewDialog}
        onCreateAction={(name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          const existing = getTemplates().find((t) => t.name === trimmed);
          if (existing) {
            const ok = window.confirm(
              `A template named "${trimmed}" already exists. Overwrite it?`,
            );
            if (ok) {
              const updated = updateTemplate(existing.id, { data: template });
              if (updated) {
                setCurrentTemplateId(updated.id);
                setCurrentTemplateName(updated.name);
                toast.success(`Template overwritten: ${updated.name}`);
              } else {
                toast.error("Failed to overwrite template");
              }
              setShowNewDialog(false);
              return;
            }
            return;
          }
          const saved = saveTemplate(trimmed, template);
          setCurrentTemplateId(saved.id);
          setCurrentTemplateName(saved.name);
          toast.success(`Created new template: ${saved.name}`);
          setShowNewDialog(false);
        }}
      />

      <HelpDialog
        open={showHelpDialog}
        onOpenChangeAction={setShowHelpDialog}
      />
    </>
  );
}

export default RandomJsonGenerator;
