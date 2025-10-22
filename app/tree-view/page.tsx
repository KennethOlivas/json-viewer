"use client";

import { useJson } from "@/providers/JsonProvider";
import { JsonTree } from "@/components/JsonTree";
import { Toolbar, ToolbarButton } from "@/components/Toolbar";
import { FAB } from "@/components/FAB";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { JSONValue } from "@/lib/json";

export default function TreeViewPage() {
  const { data, setData, saveSession } = useJson();

  const setAtPath = (
    root: JSONValue,
    path: (string | number)[],
    value: JSONValue,
  ): JSONValue => {
    const copy = JSON.parse(JSON.stringify(root)) as JSONValue;
    let cur: unknown = copy;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (Array.isArray(cur) && typeof key === "number") cur = cur[key];
      else if (cur && typeof cur === "object" && typeof key === "string")
        cur = (cur as Record<string, unknown>)[key];
      else return copy;
    }
    const last = path[path.length - 1];
    if (Array.isArray(cur) && typeof last === "number")
      (cur as unknown[])[last] = value;
    else if (cur && typeof cur === "object" && typeof last === "string")
      (cur as Record<string, unknown>)[last] = value;
    return copy;
  };

  const handleNodeChange = (path: (string | number)[], value: JSONValue) => {
    if (data == null || typeof data !== "object") return;
    const next = setAtPath(data as JSONValue, path, value);
    setData(next);
  };

  const onSave = () => {
    saveSession();
    toast.success("Session saved");
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Tree View</h1>
      <Toolbar>
        <ToolbarButton onClickAction={onSave} title="Save session">
          <Save className="h-4 w-4" /> Save
        </ToolbarButton>
      </Toolbar>
      <div className="mt-4 glass-panel p-3">
        {data ? (
          <JsonTree
            value={data as JSONValue}
            onChangeAction={handleNodeChange}
          />
        ) : (
          <div className="glass-card border p-3 text-muted-foreground">
            No JSON loaded. Use Raw View or Formatter to input JSON.
          </div>
        )}
      </div>

      <FAB
        onPressAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Top
      </FAB>
    </div>
  );
}
