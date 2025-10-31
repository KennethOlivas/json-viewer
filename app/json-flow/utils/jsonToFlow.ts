import type { FlowJson } from "./schema";
import type { Edge, Node } from "reactflow";

export function jsonToFlow(json: FlowJson): { nodes: Node[]; edges: Edge[] } {
  // Place nodes in a simple grid
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const spacingX = 280;
  const spacingY = 160;
  const byId = new Map<string, number>();

  json.nodes.forEach((n, idx) => {
    byId.set(n.id, idx);
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    nodes.push({
      id: n.id,
      type: n.type,
      position: { x: col * spacingX, y: row * spacingY },
      data: {
        label: n.type,
        ...n.data,
      },
    });
  });

  json.nodes.forEach((n) => {
    if (n.type === "SwitchNode") {
      const cases = (n.data?.cases as Record<string, string> | undefined) ?? {};
      Object.entries(cases).forEach(([key, target]) => {
        if (!target) return;
        edges.push({
          id: `${n.id}-${key}->${target}`,
          source: n.id,
          target,
          label: key,
          data: { caseKey: key },
          type: "smoothstep",
        });
      });
    } else if (n.type === "ObjectCard") {
      const children =
        (n.data?.children as Record<string, string> | undefined) ?? {};
      Object.entries(children).forEach(([key, target]) => {
        if (!target) return;
        edges.push({
          id: `${n.id}-child:${key}->${target}`,
          source: n.id,
          target,
          label: key,
          type: "smoothstep",
        });
      });
    } else if (n.next) {
      edges.push({
        id: `${n.id}->${n.next}`,
        source: n.id,
        target: n.next,
        type: "smoothstep",
      });
    }
  });

  return { nodes, edges };
}
