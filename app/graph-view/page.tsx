"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useJson } from "@/providers/JsonProvider";
import { GraphCanvas, type ContextMenuState, type GraphNode } from "@/components/graph/GraphCanvas";
import { GraphToolbar } from "@/components/graph/GraphToolbar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteAtPath } from "@/lib/json";

export default function GraphViewPage() {
  const { data, setData } = useJson();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphApiRef = useRef<{ centerAt: (x: number, y: number, ms?: number) => void; zoom: (k: number, ms?: number) => void } | null>(null);
  const [menu, setMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });

  const onNodeContext = useCallback((node: GraphNode, pos: { x: number; y: number }) => {
    setMenu({ open: true, x: pos.x, y: pos.y, node });
  }, []);

  const onDeleteNode = useCallback(() => {
    if (!menu.open || !menu.node || !data) return;
    // Root guard
    if (menu.node.path.length === 0) {
      toast("Cannot delete root");
      return;
    }
    const next = deleteAtPath(data, menu.node.path);
    setData(next);
    setMenu((m) => ({ ...m, open: false }));
    toast.success("Node deleted");
  }, [data, menu, setData]);

  const onCopyPath = useCallback(() => {
    if (!menu.node) return;
    const pathStr = menu.node.path.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("") || "root";
    navigator.clipboard.writeText(pathStr.startsWith(".") ? pathStr.slice(1) : pathStr);
    toast.success("Path copied");
    setMenu((m) => ({ ...m, open: false }));
  }, [menu.node]);

  const onCenter = useCallback(() => {
    // recenters entire graph
    graphApiRef.current?.centerAt(0, 0, 600);
  }, []);

  const onZoomIn = useCallback(() => graphApiRef.current?.zoom(2, 300), []);
  const onZoomOut = useCallback(() => graphApiRef.current?.zoom(0.5, 300), []);
  const onReset = useCallback(() => {
    graphApiRef.current?.centerAt(0, 0, 600);
    graphApiRef.current?.zoom(1, 600);
  }, []);

  const onExport = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return toast.error("Canvas not found");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.png";
    a.click();
  }, []);

  const menuTriggerStyle = useMemo(() => ({ left: menu.x, top: menu.y, position: "fixed" as const }), [menu.x, menu.y]);

  return (
    <div ref={containerRef} className="relative h-[calc(100dvh-64px)] w-full overflow-hidden">
      {!data && (
        <div className="flex h-full items-center justify-center text-muted-foreground">Load JSON to visualize.</div>
      )}
      {data && (
        <GraphCanvas
          value={data}
          onNodeContextAction={onNodeContext}
          onGraphRefAction={(api) => (graphApiRef.current = api)}
        />
      )}

      {/* Floating toolbar */}
      <GraphToolbar
        onZoomInAction={onZoomIn}
        onZoomOutAction={onZoomOut}
        onCenterAction={onCenter}
        onResetAction={onReset}
        onExportPngAction={onExport}
      />

      {/* Context menu at pointer */}
      <DropdownMenu open={menu.open} onOpenChange={(open) => setMenu((m) => ({ ...m, open }))}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" style={menuTriggerStyle} className="invisible fixed">
            .
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4} style={menuTriggerStyle}>
          <DropdownMenuItem onClick={onCopyPath}>Copy path</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeleteNode} className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
