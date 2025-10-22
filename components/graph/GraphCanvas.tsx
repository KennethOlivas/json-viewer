"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { forceCollide } from "d3-force";
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
type ForceGraphRef = {
  centerAt: (x: number, y: number, ms?: number) => void;
  zoom: (k: number, ms?: number) => void;
  exportNodePng?: (nodeId: string, opts?: { width?: number; height?: number; margin?: number }) => string | undefined;
  exportNodeSvg?: (node: GraphNode, opts?: { padding?: number }) => string;
};

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
  onNodeHoverAction,
  linkModeActive,
  onNodePickAction,
  onBackgroundClickAction,
  extraLinks,
}: {
  value: JSONValue;
  onNodeContextAction?: (node: GraphNode, position: { x: number; y: number }) => void;
  onGraphRefAction?: (api: ForceGraphRef) => void;
  onNodeHoverAction?: (node: GraphNode | null) => void;
  linkModeActive?: boolean;
  onNodePickAction?: (node: GraphNode) => void;
  onBackgroundClickAction?: () => void;
  extraLinks?: GraphLink[];
}) {
  const base = useMemo(() => toGraph(value), [value]);
  const data = useMemo(() => {
    if (!extraLinks?.length) return base;
    // attach extra flag so we can style them differently
    const merged = {
      nodes: base.nodes,
      links: [
        ...base.links,
        ...extraLinks.map((l) => ({ ...l, extra: true as const })),
      ] as Array<GraphLink & { extra?: boolean }>,
    };
    return merged;
  }, [base, extraLinks]);
  const graphRef = useRef<ForceGraphRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!graphRef.current || !onGraphRefAction) return;
    // Build a public API that includes export helpers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fg: any = graphRef.current;
    const api: ForceGraphRef = {
      centerAt: (x, y, ms) => fg.centerAt?.(x, y, ms),
      zoom: (k, ms) => fg.zoom?.(k, ms),
      exportNodePng: (nodeId, opts) => {
        const w = opts?.width ?? 220;
        const h = opts?.height ?? 90;
        const margin = opts?.margin ?? 12;
        const el = containerRef.current;
        if (!el) return undefined;
        const canvas = el.querySelector('canvas');
        if (!canvas) return undefined;
        const ctxCanvas = canvas as HTMLCanvasElement;
        const node = base.nodes.find(n => n.id === nodeId);
        if (!node) return undefined;
        // Try to map graph coords to screen coords
        let cx = 0, cy = 0;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = fg.graph2ScreenCoords?.(node as any);
          if (p && typeof p.x === 'number' && typeof p.y === 'number') {
            cx = p.x; cy = p.y;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } else if ((node as any).x && (node as any).y) {
            // fallback assumption: world coords approximate screen
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cx = (node as any).x; cy = (node as any).y;
          }
        } catch {}
        const cropW = w + margin * 2;
        const cropH = h + margin * 2;
        const sx = Math.max(0, Math.floor(cx - cropW / 2));
        const sy = Math.max(0, Math.floor(cy - cropH / 2));
        const sw = Math.min(cropW, ctxCanvas.width - sx);
        const sh = Math.min(cropH, ctxCanvas.height - sy);
        const out = document.createElement('canvas');
        out.width = sw; out.height = sh;
        const octx = out.getContext('2d');
        if (!octx) return undefined;
        octx.drawImage(ctxCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
        return out.toDataURL('image/png');
      },
      exportNodeSvg: (node, opts) => {
        const padding = opts?.padding ?? 10;
        const color = colorForType(node.type);
        const label = node.label;
        const charW = 7; // approx
        const width = Math.max(64, label.length * charW + padding * 2);
        const height = 40 + padding * 2;
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="2" y="2" rx="8" ry="8" width="${width-4}" height="${height-4}" fill="rgba(255,255,255,0.06)" stroke="${color}66" stroke-width="1" filter="url(#glow)"/>
  <text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="central" font-family="ui-sans-serif, system-ui" font-size="12" fill="#e5e7eb">${label}</text>
</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
      }
    };
    onGraphRefAction(api);
  }, [onGraphRefAction, base.nodes]);

  // Configure d3 forces to reduce overlaps and spread nodes out
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = graphRef.current;
    if (!g) return;
    try {
      const charge = g.d3Force && g.d3Force("charge");
      if (charge && typeof charge.strength === "function") charge.strength(-200);
      // Add a collide force for spacing
      if (g.d3Force) g.d3Force("collide", forceCollide(22));
      if (g.d3VelocityDecay) g.d3VelocityDecay(0.3);
    } catch {
      // no-op if methods aren't available yet
    }
  }, [data]);

  const nodeCanvasObject = useCallback((node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const color = colorForType(node.type);
    const fontSize = Math.max(8, 13 / globalScale);
    const x = (node.x ?? 0);
    const y = (node.y ?? 0);

    // card sizes scale slightly with zoom
    const paddingX = 10 + 2 / globalScale;
    const paddingY = 6 + 1 / globalScale;
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system`;
    const textWidth = ctx.measureText(label).width;
    const width = Math.max(64, textWidth + paddingX * 2);
    const height = 26 + paddingY * 2;

    // draw rounded rect helper
    const r = 6;
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = color + "80"; // glow
    ctx.beginPath();
    ctx.moveTo(x - width / 2 + r, y - height / 2);
    ctx.lineTo(x + width / 2 - r, y - height / 2);
    ctx.quadraticCurveTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + r);
    ctx.lineTo(x + width / 2, y + height / 2 - r);
    ctx.quadraticCurveTo(x + width / 2, y + height / 2, x + width / 2 - r, y + height / 2);
    ctx.lineTo(x - width / 2 + r, y + height / 2);
    ctx.quadraticCurveTo(x - width / 2, y + height / 2, x - width / 2, y + height / 2 - r);
    ctx.lineTo(x - width / 2, y - height / 2 + r);
    ctx.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + r, y - height / 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color + "40";
    ctx.lineWidth = 1;
    ctx.stroke();

    // header/text
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(label, x, y);
    ctx.restore();
  }, []);

  const nodePointerAreaPaint = useCallback((node: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, 8, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <AnyForceGraph2D
        ref={graphRef}
        graphData={data}
        backgroundColor="#111111"
        linkColor={(l: { source: unknown; target: unknown; extra?: boolean }) => {
          if (l.extra) return "#22d3ee"; // cyan for manual links
          if (!hoverId) return "rgba(255,255,255,0.12)";
          const sid = (l.source as { id?: string } | string);
          const tid = (l.target as { id?: string } | string);
          const s = typeof sid === "string" ? sid : sid.id;
          const t = typeof tid === "string" ? tid : tid.id;
          return s === hoverId || t === hoverId ? "#38bdf8" : "rgba(255,255,255,0.12)";
        }}
        linkHoverColor={() => "#ffffff"}
        linkDirectionalArrowLength={3}
        linkDirectionalParticles={(l: { extra?: boolean }) => (l.extra ? 3 : 1)}
        linkDirectionalParticleWidth={(l: { extra?: boolean }) => (l.extra ? 3 : 2)}
        linkDirectionalParticleSpeed={(l: { extra?: boolean }) => (l.extra ? 0.008 : 0.004)}
        linkDirectionalParticleColor={(l: { extra?: boolean }) => (l.extra ? "#22d3ee" : "#ffffff")}
        linkWidth={(l: { extra?: boolean }) => (l.extra ? 2.5 : 1)}
        linkCanvasObjectMode={() => "after"}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D) => {
          if (!link.extra) return;
          const sx = (typeof link.source === "object" ? link.source.x : 0) ?? 0;
          const sy = (typeof link.source === "object" ? link.source.y : 0) ?? 0;
          const tx = (typeof link.target === "object" ? link.target.x : 0) ?? 0;
          const ty = (typeof link.target === "object" ? link.target.y : 0) ?? 0;
          const grad = ctx.createLinearGradient(sx, sy, tx, ty);
          grad.addColorStop(0, "#22d3ee"); // cyan
          grad.addColorStop(1, "#fb7185"); // rose
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#22d3ee";
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.restore();
        }}
        linkDistance={80}
        nodeRelSize={4}
        cooldownTicks={100}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        onNodeHover={(node: FGNode | null) => {
          setHoverId(node?.id ?? null);
          onNodeHoverAction?.(node as GraphNode | null);
        }}
        onNodeClick={(node: FGNode) => {
          if (linkModeActive && onNodePickAction) {
            onNodePickAction(node);
            return;
          }
          // Center on node
          const x = (node.x ?? 0);
          const y = (node.y ?? 0);
          graphRef.current?.centerAt(x, y, 600);
          graphRef.current?.zoom(2, 600);
        }}
        onNodeRightClick={(node: FGNode, event: MouseEvent) => {
          // Place menu just below the node card, accounting for zoom/pan
          // Prevent the native context menu
          try { (event as unknown as { preventDefault?: () => void }).preventDefault?.(); } catch {}

          // Default to pointer location as a fallback
          let sx = (event as MouseEvent).clientX;
          let sy = (event as MouseEvent).clientY;

          // Try to map graph (x,y) to viewport coordinates
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fg: any = graphRef.current as unknown as any;
          const cx = node.x ?? 0;
          const cy = node.y ?? 0;
          if (fg && typeof fg.graph2ScreenCoords === "function") {
            try {
              const p = fg.graph2ScreenCoords(cx, cy) as { x: number; y: number } | undefined;
              const canvas = containerRef.current?.querySelector('canvas');
              const rect = canvas?.getBoundingClientRect();
              if (p && rect) {
                sx = rect.left + p.x;
                // Add a bit of vertical offset so the menu appears below the card
                sy = rect.top + p.y + 14;
              }
            } catch {}
          }

          onNodeContextAction?.(node, { x: sx, y: sy });
        }}
        onBackgroundClick={() => onBackgroundClickAction?.()}
      />
    </div>
  );
}

export type { GraphNode, GraphLink };
