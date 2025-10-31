"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import { toast } from "sonner";
import { FlowCanvas } from "./components/FlowCanvas";
import { NodeSidebar } from "./components/NodeSidebar";
import { FlowToolbar } from "./components/FlowToolbar";
import { jsonToFlow } from "./utils/jsonToFlow";
import { flowToJson } from "./utils/flowToJson";
import { flowSchema, type FlowJson } from "./utils/schema";
import { defaultFlowJson, loadFlow, saveFlow } from "./utils/storage";
import { coerceArbitraryJsonToFlow } from "./utils/coerce";
import { objectToFlow } from "./utils/objectToFlow";
import { useJson } from "@/providers/JsonProvider";

export default function JsonFlowPage() {
  const { data } = useJson();
  const initial = useMemo<FlowJson>(() => {
    // Prefer JSON from global editor if it validates
    if (data != null) {
      const fromEditor = flowSchema.safeParse(data as unknown);
      if (fromEditor.success) return fromEditor.data;
      // Try to render arbitrary JSON as Object Cards flow
      const objectFlow = objectToFlow(data as unknown, "User Info");
      if (objectFlow) return objectFlow;
      // Try older coercion strategy
      const coerced = coerceArbitraryJsonToFlow(data as unknown);
      if (coerced) return coerced;
    }
    const saved = loadFlow();
    const parsed = flowSchema.safeParse(saved);
    if (parsed.success) return parsed.data;
    const clone = JSON.parse(JSON.stringify(defaultFlowJson)) as FlowJson;
    return clone;
  }, [data]);

  const rf = useMemo(() => jsonToFlow(initial), [initial]);

  const [nodes, setNodes] = useState<Node[]>(rf.nodes);
  const [edges, setEdges] = useState<Edge[]>(rf.edges);
  const [selected, setSelected] = useState<Node | null>(null);

  // When initial (from editor/local/default) changes, reset canvas (deferred)
  useEffect(() => {
    const id = setTimeout(() => {
      setNodes(rf.nodes);
      setEdges(rf.edges);
      setSelected(null);
    }, 0);
    return () => clearTimeout(id);
  }, [rf.nodes, rf.edges]);

  // If editor data exists but doesn't validate, notify user
  useEffect(() => {
    if (data != null) {
      const parsed = flowSchema.safeParse(data as unknown);
      if (!parsed.success) {
        const objectFlow = objectToFlow(data as unknown, "User Info");
        if (objectFlow) {
          toast.info("Showing object cards based on your JSON structure.");
        } else {
          const coerced = coerceArbitraryJsonToFlow(data as unknown);
          if (coerced) {
            toast.info("Converted editor JSON into a flow (best effort).");
          } else {
            toast.warning(
              "Editor JSON doesn't match flow schema; showing saved/default flow.",
            );
          }
        }
      }
    }
  }, [data]);

  // Autosave on change
  useEffect(() => {
    const json = flowToJson(nodes, edges);
    saveFlow(json);
  }, [nodes, edges]);

  const handleChange = useCallback((ns: Node[], es: Edge[]) => {
    setNodes(ns);
    setEdges(es);
  }, []);

  const handleNodeChange = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      );
    },
    [],
  );

  const handleDelete = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    setSelected(null);
  }, []);

  const handleDuplicate = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const n = prev.find((x) => x.id === nodeId);
      if (!n) return prev;
      let idx = 1;
      let newId = `${n.id}_copy`;
      while (prev.some((x) => x.id === newId)) {
        idx += 1;
        newId = `${n.id}_copy${idx}`;
      }
      const nn: Node = {
        ...n,
        id: newId,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
      };
      return [...prev, nn];
    });
  }, []);

  const addNode = useCallback((type: "Start" | "SayText" | "SwitchNode") => {
    setNodes((prev) => {
      const idBase = type.toLowerCase();
      let idx = 1;
      let id = `${idBase}_${idx}`;
      while (prev.some((p) => p.id === id)) {
        idx += 1;
        id = `${idBase}_${idx}`;
      }
      const nn: Node = {
        id,
        type,
        position: { x: 100 + prev.length * 10, y: 100 + prev.length * 10 },
        data:
          type === "SayText" || type === "Start" ? { text: "" } : { cases: {} },
      };
      return [...prev, nn];
    });
  }, []);

  const save = useCallback(() => {
    const json = flowToJson(nodes, edges);
    saveFlow(json);
    toast.success("Flow saved locally");
  }, [nodes, edges]);

  const exportJson = useCallback(() => {
    const json = flowToJson(nodes, edges);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const reset = useCallback(() => {
    const fresh = jsonToFlow(
      JSON.parse(JSON.stringify(defaultFlowJson)) as FlowJson,
    );
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    setSelected(null);
    toast.success("Flow reset to default");
  }, []);

  return (
    <div className="w-full">
      <FlowToolbar
        onAddNodeAction={addNode}
        onSaveAction={save}
        onExportAction={exportJson}
        onResetAction={reset}
      />
      <div className="grid grid-cols-5">
        <div className="col-span-4">
          <FlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onChangeAction={handleChange}
            onSelectNodeAction={setSelected}
          />
        </div>
        <div className="col-span-1">
          <NodeSidebar
            node={selected}
            onChangeAction={handleNodeChange}
            onDeleteAction={handleDelete}
            onDuplicateAction={handleDuplicate}
          />
        </div>
      </div>
    </div>
  );
}
