"use client";

import { useCallback, useMemo, useState } from "react";
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
    JSON.stringify(DEFAULT_TEMPLATE, null, 2)
  );
  const [output, setOutput] = useState<object | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null
  );
  const [currentTemplateName, setCurrentTemplateName] = useState<string>("");
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<object | null>(null);
  const { setData } = useJson();

  const textOut = useMemo(
    () => (output ? JSON.stringify(output, null, 2) : ""),
    [output]
  );
  const label = useMemo(
    () => (currentTemplateName ? `Editing: ${currentTemplateName}` : "Unsaved template"),
    [currentTemplateName],
  );

  const onGenerate = useCallback(() => {
    const obj = generateRandomJson(template);
    setOutput(obj as object);
  }, [template]);

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

  const handleSave = useCallback((data: object) => {
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
  }, [currentTemplateId]);

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

  return (
    <>
      <RandomJsonToolbar
        label={label}
        onOpenSavedAction={useCallback(() => setShowTemplatesDialog(true), [])}
        onNewTemplateAction={useCallback(() => setShowNewDialog(true), [])}
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
        onGenerateAction={onGenerate}
        onImportAction={onImport}
      />

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Left: Template panel */}
          <div className="rounded border p-3 flex min-h-[60vh] flex-col">
            <div className="mb-2">
              <h2 className="text-lg font-medium">Template</h2>
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
            <ScrollArea className="flex-1 min-h-0 w-full rounded bg-background/50 p-3">
              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-5">
                {textOut}
              </pre>
            </ScrollArea>
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
          const saved = saveTemplate(name, data);
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
          const saved = saveTemplate(name, template);
          setCurrentTemplateId(saved.id);
          setCurrentTemplateName(saved.name);
          toast.success(`Created new template: ${saved.name}`);
          setShowNewDialog(false);
        }}
      />
    </>
  );
}

export default RandomJsonGenerator;
