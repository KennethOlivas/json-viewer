"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { JSONValue, JsonPath } from "@/lib/json";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default as unknown as React.ComponentType<unknown>),
  { ssr: false }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyForceGraph2D = ForceGraph2D as unknown as any;

type GraphNode = {
  id: string;
  label: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: JsonPath;
};

type GraphLink = { source: string; target: string };

type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

type FGNode = GraphNode & { x?: number; y?: number };
type ForceGraphRef = { centerAt: (x: number, y: number, ms?: number) => void; zoom: (k: number, ms?: number) => void };

function colorForType(type: GraphNode["type"]): string {
  switch (type) {
    case "object":
      return "#06b6d4"; // cyan
    case "array":
      return "#a78bfa"; // purple
    case "string":
      return "#22c55e"; // green
    case "number":
      return "#fb923c"; // orange
    case "boolean":
      return "#ec4899"; // pink
    case "null":
      return "#64748b"; // gray
  }
}

function toGraph(root: JSONValue): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const pushNode = (path: JsonPath, v: JSONValue, label: string) => {
    const type: GraphNode["type"] = Array.isArray(v)
      ? "array"
      : v === null
      ? "null"
      : typeof v === "object"
      ? "object"
      : (typeof v as GraphNode["type"]);
    const id = path.join("/") || "root";
    nodes.push({ id, label, type, path: [...path] });
    return id;
  };

  const walk = (v: JSONValue, path: JsonPath = [], parentId?: string) => {
    const id = pushNode(path, v, path.length ? String(path[path.length - 1]) : "root");
    if (parentId) links.push({ source: parentId, target: id });

    if (Array.isArray(v)) {
      v.forEach((vv, i) => walk(vv, [...path, i], id));
    } else if (v && typeof v === "object") {
      Object.entries(v).forEach(([k, vv]) => walk(vv, [...path, k], id));
    }
  };

  walk(root);
  return { nodes, links };
}

export type ContextMenuState = { open: boolean; x: number; y: number; node?: GraphNode };

export function GraphCanvas({
  value,
  onNodeContextAction,
  onGraphRefAction,
}: {
  value: JSONValue;
  onNodeContextAction?: (node: GraphNode, position: { x: number; y: number }) => void;
  onGraphRefAction?: (api: ForceGraphRef) => void;
}) {
  const data = useMemo(() => toGraph(value), [value]);
  const graphRef = useRef<ForceGraphRef | null>(null);

  useEffect(() => {
    if (graphRef.current && onGraphRefAction) onGraphRefAction(graphRef.current);
  }, [onGraphRefAction]);

  const nodeCanvasObject = useCallback((node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const color = colorForType(node.type);
    const fontSize = Math.max(8, 12 / globalScale);

    // glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;

    // circle
    ctx.beginPath();
    ctx.fillStyle = color;
  ctx.arc((node.x ?? 0), (node.y ?? 0), 4 + 1 / globalScale, 0, 2 * Math.PI, false);
    ctx.fill();

    // label
    ctx.shadowBlur = 0;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e5e7eb"; // zinc-200
    ctx.fillText(label, (node.x ?? 0) + 6, node.y ?? 0);
  }, []);

  const nodePointerAreaPaint = useCallback((node: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, 8, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  return (
    <div className="relative h-full w-full">
      <AnyForceGraph2D
        ref={graphRef}
        graphData={data}
        backgroundColor="#111111"
        linkColor={() => "rgba(255,255,255,0.12)"}
        linkHoverColor={() => "#ffffff"}
        nodeRelSize={4}
        cooldownTicks={60}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        onNodeClick={(node: FGNode) => {
          // Center on node
          const x = (node.x ?? 0);
          const y = (node.y ?? 0);
          graphRef.current?.centerAt(x, y, 600);
          graphRef.current?.zoom(2, 600);
        }}
        onNodeRightClick={(node: FGNode, event: MouseEvent) => {
          onNodeContextAction?.(node, { x: event.clientX, y: event.clientY });
        }}
      />
    </div>
  );
}

export type { GraphNode, GraphLink };
