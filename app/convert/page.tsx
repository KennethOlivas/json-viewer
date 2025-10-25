"use client";

import { useState } from "react";
import yaml from "js-yaml";
import Papa from "papaparse";
import { ToolbarButton } from "@/components/Toolbar";
import { toast } from "sonner";
import { useJson } from "@/providers/JsonProvider";

export default function ConvertPage() {
  const { data } = useJson();
  const [input, setInput] = useState<string>(
    data != null ? JSON.stringify(data, null, 2) : "",
  );
  const [output, setOutput] = useState<string>("");
  const [format, setFormat] = useState<
    "json2yaml" | "yaml2json" | "json2csv" | "csv2json"
  >("json2yaml");

  const convert = () => {
    try {
      if (format === "json2yaml") {
        setOutput(yaml.dump(JSON.parse(input)));
      } else if (format === "yaml2json") {
        setOutput(JSON.stringify(yaml.load(input), null, 2));
      } else if (format === "json2csv") {
        const parsed = JSON.parse(input) as unknown;
        let csvStr = "";
        if (Array.isArray(parsed)) {
          csvStr = Papa.unparse(parsed as Record<string, unknown>[]);
        } else if (parsed && typeof parsed === "object") {
          csvStr = Papa.unparse([parsed as Record<string, unknown>]);
        } else {
          throw new Error("Unsupported JSON for CSV conversion");
        }
        setOutput(csvStr);
      } else if (format === "csv2json") {
        const res = Papa.parse(input, { header: true });
        setOutput(JSON.stringify(res.data, null, 2));
      }
    } catch {
      toast.error("Conversion failed. Check input format.");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Convert</h1>
      <div className="mb-3 flex items-center gap-2">
        <select
          value={format}
          onChange={(e) =>
            setFormat(
              e.target.value as
                | "json2yaml"
                | "yaml2json"
                | "json2csv"
                | "csv2json",
            )
          }
          className="rounded border bg-background px-3 py-2"
        >
          <option value="json2yaml">JSON → YAML</option>
          <option value="yaml2json">YAML → JSON</option>
          <option value="json2csv">JSON → CSV</option>
          <option value="csv2json">CSV → JSON</option>
        </select>
        <ToolbarButton onClickAction={convert}>Convert</ToolbarButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-[50vh] w-full resize-none rounded border bg-background p-3 font-mono text-sm"
        />
        <textarea
          value={output}
          readOnly
          className="h-[50vh] w-full resize-none rounded border bg-muted/50 p-3 font-mono text-sm"
        />
      </div>
    </div>
  );
}
