"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useJson } from "@/providers/JsonProvider";
import {
  GraphCanvas,
  type ContextMenuState,
  type GraphNode,
} from "@/components/graph/GraphCanvas";
import { DOMGraph } from "@/components/graph/DOMGraph";
import { GraphToolbar } from "@/components/graph/GraphToolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  deleteAtPath,
  getAtPath,
  setAtPath,
  type JSONObject,
  type JSONArray,
  type JSONValue,
} from "@/lib/json";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VTLink } from "@/components/VTLink";
import { Menu } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GraphViewPage() {
  const { data, setData } = useJson();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphApiRef = useRef<{
    centerAt: (x: number, y: number, ms?: number) => void;
    zoom: (k: number, ms?: number) => void;
    exportNodePng?: (
      nodeId: string,
      opts?: { width?: number; height?: number; margin?: number },
    ) => string | undefined;
    exportNodeSvg?: (node: GraphNode, opts?: { padding?: number }) => string;
  } | null>(null);
  const [menu, setMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
  });
  const [linkMode, setLinkMode] = useState<{
    active: boolean;
    source?: GraphNode;
  }>({ active: false });
  const [extraLinks, setExtraLinks] = useState<
    Array<{ source: string; target: string }>
  >([]);
  const [domMode, setDomMode] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<{
    open: boolean;
    node?: GraphNode;
  }>({ open: false });
  const [editDlg, setEditDlg] = useState<{
    open: boolean;
    node?: GraphNode;
    text: string;
  }>({ open: false, text: "" });
  const [deleteDlg, setDeleteDlg] = useState<{
    open: boolean;
    node?: GraphNode;
  }>({ open: false });
  const [editKeyDlg, setEditKeyDlg] = useState<{
    open: boolean;
    node?: GraphNode;
    keyText: string;
  }>({ open: false, keyText: "" });
  const [addChildDlg, setAddChildDlg] = useState<{
    open: boolean;
    node?: GraphNode;
    keyText: string;
    valueText: string;
  }>({ open: false, keyText: "", valueText: "" });
  const [editValid, setEditValid] = useState<{ ok: boolean; error?: string }>({
    ok: true,
  });
  const [addValid, setAddValid] = useState<{ ok: boolean; error?: string }>({
    ok: true,
  });

  const onNodeContext = useCallback(
    (node: GraphNode, pos: { x: number; y: number }) => {
      setMenu({ open: true, x: pos.x, y: pos.y, node });
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    const node = deleteDlg.node ?? menu.node ?? mobileSheet.node;
    if (!node || !data) return;
    if (node.path.length === 0) {
      toast("Cannot delete root");
      return;
    }
    const next = deleteAtPath(data, node.path);
    setData(next);
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
    setDeleteDlg({ open: false, node: undefined });
    toast.success("Node deleted");
  }, [data, deleteDlg.node, menu.node, mobileSheet.node, setData]);

  const onCopyPath = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    const pathStr =
      node.path
        .map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`))
        .join("") || "root";
    navigator.clipboard.writeText(
      pathStr.startsWith(".") ? pathStr.slice(1) : pathStr,
    );
    toast.success("Path copied");
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node]);

  const startLinkMode = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    setLinkMode({ active: true, source: node });
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node]);

  const cancelLinkMode = useCallback(() => setLinkMode({ active: false }), []);

  const pickLinkTarget = useCallback(
    (node: GraphNode) => {
      const src = linkMode.source;
      if (!linkMode.active || !src) return;
      if (node.id === src.id) {
        setLinkMode({ active: false });
        return;
      }
      setExtraLinks((prev) => {
        const exists = prev.some(
          (l) =>
            (l.source === src.id && l.target === node.id) ||
            (l.source === node.id && l.target === src.id),
        );
        if (exists) return prev;
        return [...prev, { source: src.id, target: node.id }];
      });
      setLinkMode({ active: false });
    },
    [linkMode],
  );

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

  const menuTriggerStyle = useMemo(
    () => ({ left: menu.x, top: menu.y, position: "fixed" as const }),
    [menu.x, menu.y],
  );

  const exportNodePng = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
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
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node]);

  const exportNodeSvg = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node || !graphApiRef.current?.exportNodeSvg) return;
    const url = graphApiRef.current.exportNodeSvg(node, { padding: 12 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${node.label || "node"}.svg`;
    a.click();
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
    // Revoke on next tick to allow download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [menu.node, mobileSheet.node]);

  // Long-press from either renderer opens mobile sheet
  const onNodeLongPress = useCallback((node: GraphNode) => {
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: true, node });
  }, []);

  // Edit value
  const openEditValue = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node || !data) return;
    const v = getAtPath(data, node.path);
    const text =
      typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v, null, 2);
    setEditDlg({ open: true, node, text });
    setEditValid({ ok: true });
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [data, menu.node, mobileSheet.node]);

  const applyEditValue = useCallback(() => {
    if (!editDlg.open || !editDlg.node || !data) return;
    let newVal: unknown = editDlg.text;
    try {
      newVal = JSON.parse(editDlg.text);
      setEditValid({ ok: true });
    } catch (e) {
      setEditValid({ ok: false, error: (e as Error).message });
      return;
    }
    const next = setAtPath(data, editDlg.node.path, newVal as unknown as never);
    setData(next);
    setEditDlg({ open: false, node: undefined, text: "" });
    toast.success("Value updated");
  }, [data, editDlg, setData]);

  const openEditKey = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node || !data) return;
    if (node.path.length === 0) {
      toast("Cannot rename root");
      return;
    }
    const parentPath = node.path.slice(0, -1);
    const last = node.path[node.path.length - 1];
    const parent = getAtPath(data, parentPath);
    if (
      !parent ||
      typeof parent !== "object" ||
      Array.isArray(parent) ||
      typeof last !== "string"
    ) {
      toast("Edit key is only available for object properties");
      return;
    }
    setEditKeyDlg({ open: true, node, keyText: last });
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [data, menu.node, mobileSheet.node]);

  const applyEditKey = useCallback(() => {
    const node = editKeyDlg.node;
    if (!node || !data) return;
    const parentPath = node.path.slice(0, -1);
    const last = node.path[node.path.length - 1];
    const parent = getAtPath(data, parentPath) as Record<string, unknown>;
    if (
      !parent ||
      typeof parent !== "object" ||
      Array.isArray(parent) ||
      typeof last !== "string"
    )
      return;
    const newKey = editKeyDlg.keyText.trim();
    if (!newKey) {
      toast.error("Key cannot be empty");
      return;
    }
    if (
      Object.prototype.hasOwnProperty.call(parent, newKey) &&
      newKey !== last
    ) {
      toast.error("Key already exists");
      return;
    }
    const childVal = parent[last];
    const nextParent: Record<string, unknown> = { ...parent };
    delete nextParent[last];
    nextParent[newKey] = childVal;
    const next = setAtPath(data, parentPath, nextParent as never);
    setData(next);
    setEditKeyDlg({ open: false, node: undefined, keyText: "" });
    toast.success("Key updated");
  }, [data, editKeyDlg, setData]);

  const openAddChild = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node || !data) return;
    const v = getAtPath(data, node.path);
    const isObj = v && typeof v === "object" && !Array.isArray(v);
    const isArr = Array.isArray(v);
    if (!isObj && !isArr) {
      toast("Add child is only available for objects/arrays");
      return;
    }
    setAddChildDlg({ open: true, node, keyText: "", valueText: "" });
    setAddValid({ ok: true });
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [data, menu.node, mobileSheet.node]);

  const applyAddChild = useCallback(() => {
    const node = addChildDlg.node;
    if (!node || !data) return;
    const cur = getAtPath(data, node.path);
    const isObj = cur && typeof cur === "object" && !Array.isArray(cur);
    const isArr = Array.isArray(cur);
    if (!isObj && !isArr) return;
    let val: unknown = addChildDlg.valueText;
    try {
      val = JSON.parse(addChildDlg.valueText);
      setAddValid({ ok: true });
    } catch (e) {
      setAddValid({ ok: false, error: (e as Error).message });
      return;
    }
    if (isObj) {
      const key = addChildDlg.keyText.trim();
      if (!key) {
        toast.error("Key is required for objects");
        return;
      }
      if ((cur as Record<string, unknown>)[key] !== undefined) {
        toast.error("Key already exists");
        return;
      }
      const newObj: JSONObject = {
        ...(cur as JSONObject),
        [key]: val as JSONValue,
      };
      const updated = setAtPath(data, node.path, newObj as unknown as never);
      setData(updated);
    } else if (isArr) {
      const newArr: JSONArray = [...(cur as JSONArray), val as JSONValue];
      const updated = setAtPath(data, node.path, newArr as unknown as never);
      setData(updated);
    }
    setAddChildDlg({
      open: false,
      node: undefined,
      keyText: "",
      valueText: "",
    });
    toast.success("Child added");
  }, [data, addChildDlg, setData]);

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
            <Toggle
              pressed={domMode}
              onPressedChange={setDomMode}
              aria-label="Toggle DOM mode"
            >
              DOM
            </Toggle>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative h-[calc(100dvh-56px)] w-full overflow-hidden bg-linear-to-b from-[#0d0d0d] to-[#1a1a1a]"
      >
        {!data && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Load JSON to visualize.
          </div>
        )}
        {data &&
          (domMode ? (
            <DOMGraph
              value={data}
              onNodeContextAction={(n, pos) =>
                onNodeContext(n as unknown as GraphNode, pos)
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onGraphRefAction={(api) => (graphApiRef.current = api as any)}
              onNodeLongPressAction={(n) =>
                onNodeLongPress(n as unknown as GraphNode)
              }
              linkModeActive={linkMode.active}
              onNodePickAction={(n) =>
                pickLinkTarget(n as unknown as GraphNode)
              }
              onBackgroundClickAction={cancelLinkMode}
              extraLinks={extraLinks}
            />
          ) : (
            <GraphCanvas
              value={data}
              onNodeContextAction={onNodeContext}
              onGraphRefAction={(api) => (graphApiRef.current = api)}
              onNodeLongPressAction={onNodeLongPress}
              linkModeActive={linkMode.active}
              onNodePickAction={pickLinkTarget}
              onBackgroundClickAction={cancelLinkMode}
              extraLinks={extraLinks}
            />
          ))}

        {/* Floating toolbar */}
        <GraphToolbar
          onZoomInAction={onZoomIn}
          onZoomOutAction={onZoomOut}
          onCenterAction={onCenter}
          onResetAction={onReset}
          onExportPngAction={onExport}
        />

        {/* Context menu at pointer */}
        <DropdownMenu
          open={menu.open}
          onOpenChange={(open) => setMenu((m) => ({ ...m, open }))}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              style={menuTriggerStyle}
              className="invisible fixed"
            >
              .
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={6}>
            <DropdownMenuItem onClick={onCopyPath}>Copy path</DropdownMenuItem>
            <DropdownMenuItem onClick={openEditKey}>Edit key</DropdownMenuItem>
            <DropdownMenuItem onClick={openEditValue}>
              Edit value
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openAddChild}>
              Add child
            </DropdownMenuItem>
            <DropdownMenuItem onClick={startLinkMode}>
              Link to node
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportNodePng}>
              Export node PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportNodeSvg}>
              Export node SVG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDlg({ open: true, node: menu.node })}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile bottom sheet for long-press */}
        <Drawer
          open={mobileSheet.open}
          onOpenChange={(open) => setMobileSheet((s) => ({ ...s, open }))}
        >
          <DrawerContent>
            <div className="mx-auto w-full max-w-md p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                {mobileSheet.node?.label}
              </div>
              <div className="grid gap-2">
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={onCopyPath}
                >
                  Copy path
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={openEditKey}
                >
                  Edit key
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={openEditValue}
                >
                  Edit value
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={openAddChild}
                >
                  Add child
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={startLinkMode}
                >
                  Link to node
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={exportNodePng}
                >
                  Export node PNG
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 justify-start text-base"
                  onClick={exportNodeSvg}
                >
                  Export node SVG
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 justify-start text-base"
                  onClick={() =>
                    setDeleteDlg({ open: true, node: mobileSheet.node })
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Edit Value Dialog */}
        <Dialog
          open={editDlg.open}
          onOpenChange={(open) => setEditDlg((d) => ({ ...d, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit value</DialogTitle>
              <DialogDescription>
                Update the JSON value for this node. Live JSON validation below.
                For strings, include quotes; objects/arrays must be valid JSON.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(editDlg.text);
                      setEditDlg((d) => ({
                        ...d,
                        text: JSON.stringify(v, null, 2),
                      }));
                      setEditValid({ ok: true });
                    } catch (e) {
                      setEditValid({ ok: false, error: (e as Error).message });
                    }
                  }}
                >
                  Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(editDlg.text);
                      setEditDlg((d) => ({ ...d, text: JSON.stringify(v) }));
                      setEditValid({ ok: true });
                    } catch (e) {
                      setEditValid({ ok: false, error: (e as Error).message });
                    }
                  }}
                >
                  Minify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditDlg((d) => ({ ...d, text: JSON.stringify(d.text) }))
                  }
                >
                  Quote
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(editDlg.text);
                      if (typeof v === "string")
                        setEditDlg((d) => ({ ...d, text: v }));
                    } catch {}
                  }}
                >
                  Unquote
                </Button>
              </div>
              <Textarea
                value={editDlg.text}
                onChange={(e) => {
                  const t = e.target.value;
                  setEditDlg((d) => ({ ...d, text: t }));
                  try {
                    JSON.parse(t);
                    setEditValid({ ok: true });
                  } catch (er) {
                    setEditValid({ ok: false, error: (er as Error).message });
                  }
                }}
                className="min-h-32"
              />
              <div className="text-xs">
                {editValid.ok ? (
                  <span className="text-emerald-400">Valid JSON</span>
                ) : (
                  <span className="text-red-400">{editValid.error}</span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() =>
                  setEditDlg({ open: false, node: undefined, text: "" })
                }
              >
                Cancel
              </Button>
              <Button onClick={applyEditValue} disabled={!editValid.ok}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Key Dialog */}
        <Dialog
          open={editKeyDlg.open}
          onOpenChange={(open) => setEditKeyDlg((d) => ({ ...d, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit key</DialogTitle>
              <DialogDescription>
                Rename this property key. Only supported for object properties.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-2">
              <Input
                placeholder="newKey"
                value={editKeyDlg.keyText}
                onChange={(e) =>
                  setEditKeyDlg((d) => ({ ...d, keyText: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() =>
                  setEditKeyDlg({ open: false, node: undefined, keyText: "" })
                }
              >
                Cancel
              </Button>
              <Button onClick={applyEditKey}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Child Dialog */}
        <Dialog
          open={addChildDlg.open}
          onOpenChange={(open) => setAddChildDlg((d) => ({ ...d, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add child</DialogTitle>
              <DialogDescription>
                Append a value to an array or add a key/value to an object. Live
                JSON validation for value.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-2">
              {(() => {
                const node = addChildDlg.node;
                const v = node && data ? getAtPath(data, node.path) : undefined;
                const isObj = v && typeof v === "object" && !Array.isArray(v);
                return isObj ? (
                  <Input
                    placeholder="key"
                    value={addChildDlg.keyText}
                    onChange={(e) =>
                      setAddChildDlg((d) => ({ ...d, keyText: e.target.value }))
                    }
                  />
                ) : null;
              })()}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(addChildDlg.valueText);
                      setAddChildDlg((d) => ({
                        ...d,
                        valueText: JSON.stringify(v, null, 2),
                      }));
                      setAddValid({ ok: true });
                    } catch (e) {
                      setAddValid({ ok: false, error: (e as Error).message });
                    }
                  }}
                >
                  Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(addChildDlg.valueText);
                      setAddChildDlg((d) => ({
                        ...d,
                        valueText: JSON.stringify(v),
                      }));
                      setAddValid({ ok: true });
                    } catch (e) {
                      setAddValid({ ok: false, error: (e as Error).message });
                    }
                  }}
                >
                  Minify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAddChildDlg((d) => ({
                      ...d,
                      valueText: JSON.stringify(d.valueText),
                    }))
                  }
                >
                  Quote
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const v = JSON.parse(addChildDlg.valueText);
                      if (typeof v === "string")
                        setAddChildDlg((d) => ({ ...d, valueText: v }));
                    } catch {}
                  }}
                >
                  Unquote
                </Button>
              </div>
              <Textarea
                value={addChildDlg.valueText}
                onChange={(e) => {
                  const t = e.target.value;
                  setAddChildDlg((d) => ({ ...d, valueText: t }));
                  try {
                    JSON.parse(t);
                    setAddValid({ ok: true });
                  } catch (er) {
                    setAddValid({ ok: false, error: (er as Error).message });
                  }
                }}
                className="min-h-32"
              />
              <div className="text-xs">
                {addValid.ok ? (
                  <span className="text-emerald-400">Valid JSON</span>
                ) : (
                  <span className="text-red-400">{addValid.error}</span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() =>
                  setAddChildDlg({
                    open: false,
                    node: undefined,
                    keyText: "",
                    valueText: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button onClick={applyAddChild} disabled={!addValid.ok}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog
          open={deleteDlg.open}
          onOpenChange={(open) => setDeleteDlg((d) => ({ ...d, open }))}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete node?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the node and its children from the JSON.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {linkMode.active && (
          <div className="pointer-events-auto fixed right-6 top-[72px] z-30 flex items-center gap-2 rounded-md border border-cyan-500/30 bg-background/80 px-3 py-2 text-sm shadow-lg backdrop-blur supports-backdrop-filter:bg-background/60">
            <span className="text-cyan-400">Link mode:</span>
            <span className="text-muted-foreground">Select a target node</span>
            <Button size="sm" variant="secondary" onClick={cancelLinkMode}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
