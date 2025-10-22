"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSONValue, JsonPath } from "@/lib/json";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from "d3-force";
import { motion } from "framer-motion";
import { getAtPath } from "@/lib/json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type DOMGraphNode = {
  id: string;
  label: string;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: JsonPath;
  x?: number;
  y?: number;
};

export type DOMGraphLink = { source: string; target: string; extra?: boolean };

function colorForType(type: DOMGraphNode["type"]): string {
  switch (type) {
    case "object":
      return "#06b6d4";
    case "array":
      return "#a78bfa";
    case "string":
      return "#22c55e";
    case "number":
      return "#fb923c";
    case "boolean":
      return "#ec4899";
    case "null":
      return "#64748b";
  }
}

function toGraph(root: JSONValue): { nodes: DOMGraphNode[]; links: DOMGraphLink[] } {
  const nodes: DOMGraphNode[] = [];
  const links: DOMGraphLink[] = [];

  const pushNode = (path: JsonPath, v: JSONValue, label: string) => {
    const type: DOMGraphNode["type"] = Array.isArray(v)
      ? "array"
      : v === null
      ? "null"
      : typeof v === "object"
      ? "object"
      : (typeof v as DOMGraphNode["type"]);
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

export type DOMGraphApi = {
  centerAt: (x: number, y: number, ms?: number) => void;
  zoom: (k: number, ms?: number) => void;
  exportNodeSvg?: (node: DOMGraphNode, opts?: { padding?: number }) => string;
};

export function DOMGraph({
  value,
  onNodeContextAction,
  onNodeLongPressAction,
  onNodeHoverAction,
  onGraphRefAction,
  linkModeActive,
  onNodePickAction,
  onBackgroundClickAction,
  extraLinks,
}: {
  value: JSONValue;
  onNodeContextAction?: (node: DOMGraphNode, position: { x: number; y: number }) => void;
  onNodeLongPressAction?: (node: DOMGraphNode) => void;
  onNodeHoverAction?: (node: DOMGraphNode | null) => void;
  onGraphRefAction?: (api: DOMGraphApi) => void;
  linkModeActive?: boolean;
  onNodePickAction?: (node: DOMGraphNode) => void;
  onBackgroundClickAction?: () => void;
  extraLinks?: DOMGraphLink[];
}) {
  const base = useMemo(() => toGraph(value), [value]);
  const data = useMemo(() => {
    if (!extraLinks?.length) return base;
    return {
      nodes: base.nodes,
      links: [...base.links, ...extraLinks],
    } as { nodes: DOMGraphNode[]; links: DOMGraphLink[] };
  }, [base, extraLinks]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 800, h: 600 });
  const [k, setK] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<DOMGraphNode[]>([]);
  const [tip, setTip] = useState<{ open: boolean; x: number; y: number; type?: string; children?: number }>(() => ({ open: false, x: 0, y: 0 }));

  // Setup simulation
  useEffect(() => {
    const simNodes: DOMGraphNode[] = data.nodes.map((n) => ({ ...n }));
    const linkForce = forceLink<DOMGraphNode, DOMGraphLink>(data.links)
      .id((d) => d.id)
      .distance(90)
      .strength(0.9);
    const sim = forceSimulation(simNodes)
      .force("link", linkForce)
      .force("charge", forceManyBody().strength(-180))
      .force("center", forceCenter(dims.w / 2, dims.h / 2))
      .force("collide", forceCollide(28))
      .velocityDecay(0.3)
      .alpha(1)
      .alphaTarget(0)
      .on("tick", () => {
        // throttle via rAF
        requestAnimationFrame(() => setNodes([...simNodes]));
      });
    return () => {
      sim.stop();
    };
  }, [data.nodes, data.links, dims.w, dims.h]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Simple API for toolbar
  useEffect(() => {
    if (!onGraphRefAction) return;
    const api: DOMGraphApi = {
      centerAt: (x, y) => {
        const w = dims.w;
        const h = dims.h;
        setTx(w / 2 - x * k);
        setTy(h / 2 - y * k);
      },
      zoom: (nk) => {
        setK((prev) => prev * nk);
      },
      exportNodeSvg: (node, opts) => {
        const padding = opts?.padding ?? 12;
        const color = colorForType(node.type);
        const label = node.label;
        const charW = 7;
        const width = Math.max(64, label.length * charW + padding * 2);
        const height = 48 + padding * 2;
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">\n  <defs>\n    <filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">\n      <feGaussianBlur stdDeviation=\"3\" result=\"coloredBlur\"/>\n      <feMerge>\n        <feMergeNode in=\"coloredBlur\"/>\n        <feMergeNode in=\"SourceGraphic\"/>\n      </feMerge>\n    </filter>\n  </defs>\n  <rect x=\"2\" y=\"2\" rx=\"10\" ry=\"10\" width=\"${width-4}\" height=\"${height-4}\" fill=\"rgba(255,255,255,0.06)\" stroke=\"${color}66\" stroke-width=\"1\" filter=\"url(#glow)\"/>\n  <text x=\"${width/2}\" y=\"${height/2}\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"ui-sans-serif, system-ui\" font-size=\"12\" fill=\"#e5e7eb\">${label}</text>\n</svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        return URL.createObjectURL(blob);
      },
    };
    onGraphRefAction(api);
  }, [onGraphRefAction, dims.w, dims.h, k]);

  const onBgClick = useCallback(() => {
    onBackgroundClickAction?.();
  }, [onBackgroundClickAction]);

  // pan/zoom interactions
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-node-card]") ) return;
    dragging.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.x;
    const dy = e.clientY - dragging.current.y;
    dragging.current = { x: e.clientX, y: e.clientY };
    setTx((t) => t + dx);
    setTy((t) => t + dy);
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = null; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    setK((prev) => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  const transform = `translate(${tx}px, ${ty}px) scale(${k})`;

  return (
    <div ref={containerRef} className="relative h-full w-full" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>
      {/* SVG links layer */}
      <svg className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <defs>
          <linearGradient id="manualLinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <g style={{ transform }}>
          {data.links.map((l, i) => {
            const s = nodes.find((n) => n.id === (l.source as string));
            const t = nodes.find((n) => n.id === (l.target as string));
            if (!s || !t) return null;
            const stroke = l.extra ? "url(#manualLinkGrad)" : (hoverId && (s.id === hoverId || t.id === hoverId) ? "#38bdf8" : "rgba(255,255,255,0.12)");
            const width = l.extra ? 2.5 : 1;
            return (
              <line key={i} x1={s.x ?? 0} y1={s.y ?? 0} x2={t.x ?? 0} y2={t.y ?? 0} stroke={stroke} strokeWidth={width} opacity={l.extra ? 0.95 : 1} />
            );
          })}
        </g>
      </svg>

      {/* Node cards layer */}
      <div className="absolute inset-0" onClick={onBgClick} />
      <div className="absolute inset-0" style={{ transform }}>
        {nodes.map((n) => {
          const color = colorForType(n.type);
          const left = (n.x ?? 0) - 60;
          const top = (n.y ?? 0) - 24;
          return (
            <div key={n.id} className="absolute" style={{ left, top, perspective: 600 }}>
              <motion.div
                data-node-card
                className="select-none rounded-lg border px-3 py-2 text-xs shadow-lg"
                style={{ borderColor: `${color}66`, background: "rgba(255,255,255,0.06)", transformStyle: "preserve-3d" }}
                onMouseEnter={(e) => {
                  setHoverId(n.id);
                  onNodeHoverAction?.(n);
                  // compute tooltip info
                  try {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const v = getAtPath(value, n.path);
                    const childCount = Array.isArray(v) ? v.length : (v && typeof v === 'object') ? Object.keys(v as object).length : 0;
                    setTip({ open: true, x: rect.left + 8, y: rect.top - 8, type: n.type, children: childCount });
                  } catch {
                    setTip({ open: true, x: 0, y: 0, type: n.type, children: undefined });
                  }
                }}
                onMouseLeave={() => { setHoverId(null); onNodeHoverAction?.(null); setTip((t) => ({ ...t, open: false })); }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const card = e.currentTarget as HTMLElement;
                  const rect = card.getBoundingClientRect();
                  onNodeContextAction?.(n, { x: rect.left, y: rect.bottom + 6 });
                }}
                onTouchStart={(e) => {
                  if (!onNodeLongPressAction) return;
                  const target = e.currentTarget as HTMLElement;
                  // Start a long-press timer
                  const timer = window.setTimeout(() => {
                    try {
                      onNodeLongPressAction?.(n);
                    } catch {}
                  }, 450);
                  const startX = e.touches[0]?.clientX ?? 0;
                  const startY = e.touches[0]?.clientY ?? 0;

                  const cancel = () => { window.clearTimeout(timer); target.removeEventListener('touchend', cancel as EventListener); target.removeEventListener('touchcancel', cancel as EventListener); target.removeEventListener('touchmove', move as EventListener); };
                  const move = (te: TouchEvent) => {
                    const x = te.touches[0]?.clientX ?? 0;
                    const y = te.touches[0]?.clientY ?? 0;
                    const dx = x - startX, dy = y - startY;
                    if (dx*dx + dy*dy > 10*10) {
                      window.clearTimeout(timer);
                    }
                  };
                  target.addEventListener('touchend', cancel as EventListener, { passive: true });
                  target.addEventListener('touchcancel', cancel as EventListener, { passive: true });
                  target.addEventListener('touchmove', move as EventListener, { passive: true });
                }}
                onClick={(e) => { e.stopPropagation(); if (linkModeActive && onNodePickAction) onNodePickAction(n); }}
                whileHover={{ rotateX: 2, rotateY: -2, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="font-medium">{n.label}</div>
                <div className="text-muted-foreground">{n.type}</div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Single mounted tooltip for performance */}
      {tip.open && (
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <button className="invisible fixed size-2" style={{ left: tip.x, top: tip.y, position: 'fixed' }}>.</button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10} className="z-50 max-w-[240px] rounded-md border border-white/10 bg-background/70 px-3 py-2 text-xs text-foreground shadow-lg backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{tip.type}</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-muted-foreground">Children:</span>
              <span className="font-medium">{typeof tip.children === 'number' ? tip.children : 0}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
