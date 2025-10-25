"use client";

import React, { memo, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TemplateEditor({
  text,
  onTextChangeAction,
}: {
  text: string;
  onTextChangeAction: (v: string) => void;
}) {
  const handleFormat = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(text), null, 2);
      onTextChangeAction(formatted);
      toast.success("Template formatted");
    } catch {
      toast.error("Invalid JSON — cannot format");
    }
  }, [text, onTextChangeAction]);

  return (
    <div className="grid gap-2">
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={handleFormat}>
          Format JSON
        </Button>
      </div>
      <div className="h-[500px] border rounded-md overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={text}
          onChange={(v) => onTextChangeAction(v ?? "")}
          theme="vs-dark"
          options={{
            tabSize: 2,
            minimap: { enabled: false },
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}

export default memo(TemplateEditor);
