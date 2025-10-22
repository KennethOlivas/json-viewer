"use client";

import dynamic from "next/dynamic";
import type { OnChange } from "@monaco-editor/react";

const Monaco = dynamic(async () => (await import("@monaco-editor/react")).default, { ssr: false });

export function MonacoEditorClient({ value, onChangeAction, height = "60vh" }: { value: string; onChangeAction?: OnChange; height?: string }) {
  return (
    <Monaco
      height={height}
      defaultLanguage="json"
      theme="vs-dark"
      value={value}
      onChange={onChangeAction}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
}
