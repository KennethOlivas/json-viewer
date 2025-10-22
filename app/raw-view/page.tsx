"use client";

import { MonacoEditorClient } from "@/components/MonacoEditorClient";
import { Toolbar, ToolbarButton } from "@/components/Toolbar";
import { useJson } from "@/providers/JsonProvider";
import {
  formatJson,
  minifyJson,
  parseJsonSafe,
  type JSONValue,
} from "@/lib/json";
import { Copy, Save, WandSparkles, Shrink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RawViewPage() {
  const { data, setData, saveSession } = useJson();
  const [text, setText] = useState<string>(
    data ? JSON.stringify(data, null, 2) : '{\n  "hello": "world"\n}',
  );
  const { error } = parseJsonSafe(text);

  const onFormat = () => {
    const { output, error } = formatJson(text, 2);
    if (error) return toast.error(error);
    setText(output!);
  };
  const onMinify = () => {
    const { output, error } = minifyJson(text);
    if (error) return toast.error(error);
    setText(output!);
  };
  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };
  const onSave = () => {
    const { data: parsed, error } = parseJsonSafe(text);
    if (error) return toast.error(error);
    setData(parsed as JSONValue);
    saveSession();
    toast.success("Saved to session");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Raw View</h1>
      <Toolbar>
        <ToolbarButton onClickAction={onFormat} title="Format">
          <WandSparkles className="h-4 w-4" /> Format
        </ToolbarButton>
        <ToolbarButton onClickAction={onMinify} title="Minify">
          <Shrink className="h-4 w-4" /> Minify
        </ToolbarButton>
        <ToolbarButton onClickAction={onCopy} title="Copy">
          <Copy className="h-4 w-4" /> Copy
        </ToolbarButton>
        <ToolbarButton onClickAction={onSave} title="Save">
          <Save className="h-4 w-4" /> Save
        </ToolbarButton>
      </Toolbar>
      <div className="mt-3">
        <MonacoEditorClient
          value={text}
          onChangeAction={(v) => setText(v || "")}
          height="70vh"
        />
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
