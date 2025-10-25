"use client";

import dynamic from "next/dynamic";
import type { OnChange } from "@monaco-editor/react";
import { useTheme } from "next-themes";

const Monaco = dynamic(
  async () => (await import("@monaco-editor/react")).default,
  { ssr: false },
);

export function MonacoEditorClient({
  value,
  onChangeAction,
  height = "60vh",
}: {
  value: string;
  onChangeAction?: OnChange;
  height?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  const effective = theme === "system" ? resolvedTheme : theme;
  const darkThemes = new Set([
    "dark",
    "theme-dark",
    "theme-vscode",
    "theme-neon-purple",
    "theme-cyberpunk",
    "theme-forest",
  ]);
  const editorTheme = darkThemes.has(effective || "light")
    ? "vs-dark"
    : "vs-light";
  return (
    <Monaco
      height={height}
      defaultLanguage="json"
      theme={editorTheme}
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
