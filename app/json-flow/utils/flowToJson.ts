import type { Edge, Node } from "reactflow";
import { flowSchema, type FlowJson } from "./schema";

type EdgeData = { caseKey?: string } | undefined;

export function flowToJson(nodes: Node[], edges: Edge[]): FlowJson {
  const outNodes: FlowJson["nodes"] = nodes.map((n) => ({
    id: n.id,
    type: n.type as string as FlowJson["nodes"][number]["type"],
    data: { ...(n.data as Record<string, unknown> | undefined) },
  }));

  // Build mapping from source -> outgoing edges
  const outgoing = new Map<string, Edge[]>();
  edges.forEach((e) => {
    const arr = outgoing.get(e.source) ?? [];
    arr.push(e);
    outgoing.set(e.source, arr);
  });

  outNodes.forEach((n) => {
    const outs = outgoing.get(n.id) ?? [];
    if (n.type === "SwitchNode") {
      const cases: Record<string, string> = {};
      outs.forEach((e) => {
        const ed = e.data as EdgeData;
        const key = ed?.caseKey ?? e.label ?? "";
        if (!key) return;
        cases[String(key)] = e.target;
      });
      (n.data as Record<string, unknown>).cases = cases;
    } else if (n.type === "ObjectCard") {
      const children: Record<string, string> = {};
      outs.forEach((e) => {
        const key = (e.label as string | undefined) ?? "";
        const label = key || e.target; // fall back to target id if no label
        children[String(label)] = e.target;
      });
      (n.data as Record<string, unknown>).children = children;
    } else {
      if (outs[0]) n.next = outs[0].target;
    }
  });

  const parsed = flowSchema.safeParse({ nodes: outNodes });
  if (!parsed.success) {
    // In a production app you'd surface these errors in the UI
    return { nodes: outNodes } as FlowJson;
  }
  return parsed.data;
}
