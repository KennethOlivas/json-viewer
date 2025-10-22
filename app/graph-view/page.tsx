"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useJson } from "@/providers/JsonProvider";
import { GraphCanvas, type ContextMenuState, type GraphNode } from "@/components/graph/GraphCanvas";
import { DOMGraph } from "@/components/graph/DOMGraph";
import { GraphToolbar } from "@/components/graph/GraphToolbar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteAtPath } from "@/lib/json";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VTLink } from "@/components/VTLink";
import { Menu } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Toggle } from "@/components/ui/toggle";

export default function GraphViewPage() {
  const { data, setData } = useJson();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphApiRef = useRef<{
    centerAt: (x: number, y: number, ms?: number) => void;
    zoom: (k: number, ms?: number) => void;
    exportNodePng?: (nodeId: string, opts?: { width?: number; height?: number; margin?: number }) => string | undefined;
    exportNodeSvg?: (node: GraphNode, opts?: { padding?: number }) => string;
  } | null>(null);
  const [menu, setMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  const [linkMode, setLinkMode] = useState<{ active: boolean; source?: GraphNode }>({ active: false });
  const [extraLinks, setExtraLinks] = useState<Array<{ source: string; target: string }>>([]);
  const [domMode, setDomMode] = useState(false);

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

  const startLinkMode = useCallback(() => {
    if (!menu.node) return;
    setLinkMode({ active: true, source: menu.node });
    setMenu((m) => ({ ...m, open: false }));
  }, [menu.node]);

  const cancelLinkMode = useCallback(() => setLinkMode({ active: false }), []);

  const pickLinkTarget = useCallback((node: GraphNode) => {
    const src = linkMode.source;
    if (!linkMode.active || !src) return;
    if (node.id === src.id) {
      setLinkMode({ active: false });
      return;
    }
    setExtraLinks((prev) => {
      const exists = prev.some((l) => (l.source === src.id && l.target === node.id) || (l.source === node.id && l.target === src.id));
      if (exists) return prev;
      return [...prev, { source: src.id, target: node.id }];
    });
    setLinkMode({ active: false });
  }, [linkMode]);

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

  const exportNodePng = useCallback(() => {
    if (!menu.node || !graphApiRef.current?.exportNodePng) return;
    const url = graphApiRef.current.exportNodePng(menu.node.id, { width: 240, height: 100, margin: 16 });
    if (!url) return toast.error("Export failed");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${menu.node.label || "node"}.png`;
    a.click();
    setMenu((m) => ({ ...m, open: false }));
  }, [menu.node]);

  const exportNodeSvg = useCallback(() => {
    if (!menu.node || !graphApiRef.current?.exportNodeSvg) return;
    const url = graphApiRef.current.exportNodeSvg(menu.node, { padding: 12 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${menu.node.label || "node"}.svg`;
    a.click();
    setMenu((m) => ({ ...m, open: false }));
    // Revoke on next tick to allow download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [menu.node]);

  return (
    <div className="relative w-full">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Drawer>
              <DrawerTrigger className="mr-1 inline-flex items-center justify-center rounded-md p-2 md:hidden">
                <Menu className="size-5" />
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4">
                  <nav className="grid gap-2">
                    <VTLink href="/">Home</VTLink>
                    <VTLink href="/tree-view">Tree</VTLink>
                    <VTLink href="/raw-view">Raw</VTLink>
                    <VTLink href="/graph-view">Graph</VTLink>
                    <VTLink href="/compare">Compare</VTLink>
                  </nav>
                </div>
              </DrawerContent>
            </Drawer>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <VTLink href="/">Home</VTLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <VTLink href="/tree-view">Tree</VTLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <VTLink href="/raw-view">Raw</VTLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <VTLink href="/graph-view">Graph</VTLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <VTLink href="/compare">Compare</VTLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Toggle pressed={domMode} onPressedChange={setDomMode} aria-label="Toggle DOM mode">DOM</Toggle>
          </div>
        </div>
      </div>

      {/* Canvas area */}
  <div ref={containerRef} className="relative h-[calc(100dvh-56px)] w-full overflow-hidden bg-linear-to-b from-[#0d0d0d] to-[#1a1a1a]">
      {!data && (
        <div className="flex h-full items-center justify-center text-muted-foreground">Load JSON to visualize.</div>
      )}
      {data && (
        domMode ? (
          <DOMGraph
            value={data}
            onNodeContextAction={(n, pos) => onNodeContext(n as unknown as GraphNode, pos)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onGraphRefAction={(api) => (graphApiRef.current = api as any)}
            linkModeActive={linkMode.active}
            onNodePickAction={(n) => pickLinkTarget(n as unknown as GraphNode)}
            onBackgroundClickAction={cancelLinkMode}
            extraLinks={extraLinks}
          />
        ) : (
          <GraphCanvas
            value={data}
            onNodeContextAction={onNodeContext}
            onGraphRefAction={(api) => (graphApiRef.current = api)}
            linkModeActive={linkMode.active}
            onNodePickAction={pickLinkTarget}
            onBackgroundClickAction={cancelLinkMode}
            extraLinks={extraLinks}
          />
        )
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
        <DropdownMenuContent side="bottom" align="start" sideOffset={6}>
          <DropdownMenuItem onClick={onCopyPath}>Copy path</DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message("Edit key", { description: "Coming soon" })}>Edit key</DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message("Edit value", { description: "Coming soon" })}>Edit value</DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message("Add child", { description: "Coming soon" })}>Add child</DropdownMenuItem>
          <DropdownMenuItem onClick={startLinkMode}>Link to node</DropdownMenuItem>
          <DropdownMenuItem onClick={exportNodePng}>Export node PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={exportNodeSvg}>Export node SVG</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeleteNode} className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {linkMode.active && (
        <div className="pointer-events-auto fixed right-6 top-[72px] z-30 flex items-center gap-2 rounded-md border border-cyan-500/30 bg-background/80 px-3 py-2 text-sm shadow-lg backdrop-blur supports-backdrop-filter:bg-background/60">
          <span className="text-cyan-400">Link mode:</span>
          <span className="text-muted-foreground">Select a target node</span>
          <Button size="sm" variant="secondary" onClick={cancelLinkMode}>Cancel</Button>
        </div>
      )}
      </div>
    </div>
  );
}
