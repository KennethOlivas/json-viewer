"use client";

import { useCallback } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";
import { toast } from "sonner";

export interface GraphApi {
  centerAt: (x: number, y: number, ms?: number) => void;
  zoom: (k: number, ms?: number) => void;
  exportNodePng?: (
    nodeId: string,
    opts?: { width?: number; height?: number; margin?: number },
  ) => string | undefined;
  exportNodeSvg?: (node: GraphNode, opts?: { padding?: number }) => string;
}

export function useGraphControls(
  containerRef: React.RefObject<HTMLDivElement | null>,
  graphApiRef: React.RefObject<GraphApi | null>,
) {
  const handleCenter = useCallback(() => {
    graphApiRef.current?.centerAt(0, 0, 600);
  }, [graphApiRef]);

  const handleZoomIn = useCallback(() => {
    graphApiRef.current?.zoom(2, 300);
  }, [graphApiRef]);

  const handleZoomOut = useCallback(() => {
    graphApiRef.current?.zoom(0.5, 300);
  }, [graphApiRef]);

  const handleReset = useCallback(() => {
    graphApiRef.current?.centerAt(0, 0, 600);
    graphApiRef.current?.zoom(1, 600);
  }, [graphApiRef]);

  const exportCanvasPng = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return toast.error("Canvas not found");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.png";
    a.click();
  }, [containerRef]);

  const exportNodePng = useCallback(
    (node: GraphNode | undefined | null) => {
      if (!node || !graphApiRef.current?.exportNodePng) return;
      const url = graphApiRef.current.exportNodePng(node.id, {
        width: 240,
        height: 100,
        margin: 16,
      });
      if (!url) return toast.error("Export failed");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${node.label || "node"}.png`;
      a.click();
    },
    [graphApiRef],
  );

  const exportNodeSvg = useCallback(
    (node: GraphNode | undefined | null) => {
      if (!node || !graphApiRef.current?.exportNodeSvg) return;
      const url = graphApiRef.current.exportNodeSvg(node, { padding: 12 });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${node.label || "node"}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [graphApiRef],
  );

  return {
    handleCenter,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    exportCanvasPng,
    exportNodePng,
    exportNodeSvg,
  } as const;
}
