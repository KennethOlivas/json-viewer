"use client";

import { useState } from "react";
import { formatJson, minifyJson } from "@/lib/json";
import { Toolbar, ToolbarButton } from "@/components/Toolbar";
import { Copy, Eraser, WandSparkles, Shrink } from "lucide-react";
import { toast } from "sonner";
import { useJson } from "@/providers/JsonProvider";

export default function FormatterPage() {
  const { data } = useJson();

  const [input, setInput] = useState<string>(
    data != null ? JSON.stringify(data, null, 2) : "",
  );

  const [output, setOutput] = useState<string>("");

  const pretty = () => {
    const { output, error } = formatJson(input, 2);
    if (error) return toast.error(error);
    setOutput(output!);
  };

  const minify = () => {
    const { output, error } = minifyJson(input);
    if (error) return toast.error(error);
    setOutput(output!);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied result");
  };

  const reset = () => setOutput("");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Formatter</h1>
      <Toolbar>
        <ToolbarButton onClickAction={pretty}>
          <WandSparkles className="h-4 w-4" /> Pretty Print
        </ToolbarButton>
        <ToolbarButton onClickAction={minify}>
          <Shrink className="h-4 w-4" /> Minify
        </ToolbarButton>
        <ToolbarButton onClickAction={copy}>
          <Copy className="h-4 w-4" /> Copy
        </ToolbarButton>
        <ToolbarButton onClickAction={reset}>
          <Eraser className="h-4 w-4" /> Reset
        </ToolbarButton>
      </Toolbar>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-[60vh] w-full resize-none rounded border bg-background p-3 font-mono text-sm"
        />
        <pre className="h-[60vh] w-full overflow-auto rounded border bg-muted/50 p-3 font-mono text-sm whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  );
}
