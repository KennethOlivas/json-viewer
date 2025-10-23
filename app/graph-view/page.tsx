"use client";

import { useCallback, useRef, useState } from "react";
import { useJson } from "@/providers/JsonProvider";
import {
  GraphCanvas,
  type ContextMenuState,
  type GraphNode,
} from "@/components/graph/GraphCanvas";
import { DOMGraph } from "@/components/graph/DOMGraph";
import { GraphToolbar } from "@/components/graph/GraphToolbar";
import { GraphContextMenu } from "@/components/graph/GraphContextMenu";
import { GraphMobileDrawer } from "@/components/graph/GraphMobileDrawer";
import { EditValueDialog } from "@/components/graph/dialogs/EditValueDialog";
import { EditKeyDialog } from "@/components/graph/dialogs/EditKeyDialog";
import { AddChildDialog } from "@/components/graph/dialogs/AddChildDialog";
import { DeleteConfirmDialog } from "@/components/graph/dialogs/DeleteConfirmDialog";
import { useGraphControls, type GraphApi } from "@/hooks/graph/useGraphControls";
import { useGraphLinks } from "@/hooks/graph/useGraphLinks";
import { useEditValueDialog } from "@/hooks/graph/useEditValueDialog";
import { useEditKeyDialog } from "@/hooks/graph/useEditKeyDialog";
import { useAddChildDialog } from "@/hooks/graph/useAddChildDialog";
import { useDeleteNodeDialog } from "@/hooks/graph/useDeleteNodeDialog";
import { pathToDisplayString } from "@/lib/json-utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GraphViewPage() {
  const { data } = useJson();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphApiRef = useRef<GraphApi | null>(null);
  const [menu, setMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  const { linkMode, extraLinks, startLinkMode, cancelLinkMode, pickLinkTarget } = useGraphLinks();
  const [domMode] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<{ open: boolean; node?: GraphNode }>({ open: false });

  // Dialog hooks
  const editValue = useEditValueDialog();
  const editKey = useEditKeyDialog();
  const addChild = useAddChildDialog();
  const delNode = useDeleteNodeDialog();
  // Graph controls
  const controls = useGraphControls(containerRef, graphApiRef);

  const onNodeContext = useCallback((node: GraphNode, pos: { x: number; y: number }) => {
    setMenu({ open: true, x: pos.x, y: pos.y, node });
  }, []);

  // Long-press from either renderer opens mobile sheet (handled inline below)

  const handleNodeLongPress = useCallback((node: GraphNode) => {
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: true, node });
  }, []);

  const handleMenuOpenChange = useCallback((open: boolean) => {
    setMenu((m) => ({ ...m, open }));
  }, []);

  const handleMobileOpenChange = useCallback((open: boolean) => {
    setMobileSheet((s) => ({ ...s, open }));
  }, []);

  const handleGraphRef = useCallback((api: GraphApi) => {
    graphApiRef.current = api;
  }, []);

  const handleDomGraphRef = useCallback((api: unknown) => {
    graphApiRef.current = api as GraphApi;
  }, []);

  const onCopyPath = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    const pathStr = pathToDisplayString(node.path);
    navigator.clipboard.writeText(pathStr);
    toast.success("Path copied");
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node]);

  // Handlers to open dialogs via hooks
  const handleOpenEditValue = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    editValue.openDialog(node);
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node, editValue]);

  const handleOpenEditKey = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    editKey.openDialog(node);
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node, editKey]);

  const handleOpenAddChild = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    addChild.openDialog(node);
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node, addChild]);

  const handleOpenDelete = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    delNode.openDialog(node);
  }, [menu.node, mobileSheet.node, delNode]);

  const handleStartLinkFromMenu = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    startLinkMode(node);
    setMenu((m) => ({ ...m, open: false }));
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node, startLinkMode]);

  const handleStartLinkFromMobile = useCallback(() => {
    const node = menu.node ?? mobileSheet.node;
    if (!node) return;
    startLinkMode(node);
    setMobileSheet({ open: false, node: undefined });
  }, [menu.node, mobileSheet.node, startLinkMode]);

  return (
    <div className="relative w-full">
      {/* Canvas area */}
      <div ref={containerRef} className="relative h-[calc(100dvh-56px)] w-full overflow-hidden bg-linear-to-b from-[#0d0d0d] to-[#1a1a1a]">
        {!data && (
          <div className="flex h-full items-center justify-center text-muted-foreground">Load JSON to visualize.</div>
        )}
        {data && (domMode ? (
          <DOMGraph
            value={data}
            onNodeContextAction={(n, pos) => onNodeContext(n as unknown as GraphNode, pos)}
            onGraphRefAction={handleDomGraphRef}
            onNodeLongPressAction={(n) => handleNodeLongPress(n as unknown as GraphNode)}
            linkModeActive={linkMode.active}
            onNodePickAction={(n) => pickLinkTarget(n as unknown as GraphNode)}
            onBackgroundClickAction={cancelLinkMode}
            extraLinks={extraLinks}
          />
        ) : (
          <GraphCanvas
            value={data}
            onNodeContextAction={onNodeContext}
            onGraphRefAction={handleGraphRef}
            onNodeLongPressAction={handleNodeLongPress}
            linkModeActive={linkMode.active}
            onNodePickAction={pickLinkTarget}
            onBackgroundClickAction={cancelLinkMode}
            extraLinks={extraLinks}
          />
        ))}

        {/* Floating toolbar */}
        <GraphToolbar
          onZoomInAction={controls.handleZoomIn}
          onZoomOutAction={controls.handleZoomOut}
          onCenterAction={controls.handleCenter}
          onResetAction={controls.handleReset}
          onExportPngAction={controls.exportCanvasPng}
        />

        {/* Context menu at pointer */}
        <GraphContextMenu
          open={menu.open}
          x={menu.x}
          y={menu.y}
          onOpenChange={handleMenuOpenChange}
          onCopyPath={onCopyPath}
          onEditKey={handleOpenEditKey}
          onEditValue={handleOpenEditValue}
          onAddChild={handleOpenAddChild}
          onStartLinkMode={handleStartLinkFromMenu}
          onExportNodePng={() => {
            controls.exportNodePng(menu.node ?? mobileSheet.node);
            setMenu((m) => ({ ...m, open: false }));
            setMobileSheet({ open: false, node: undefined });
          }}
          onExportNodeSvg={() => {
            controls.exportNodeSvg(menu.node ?? mobileSheet.node);
            setMenu((m) => ({ ...m, open: false }));
            setMobileSheet({ open: false, node: undefined });
          }}
          onDelete={handleOpenDelete}
        />

        {/* Mobile bottom sheet for long-press */}
        <GraphMobileDrawer
          open={mobileSheet.open}
          nodeLabel={mobileSheet.node?.label}
          onOpenChange={handleMobileOpenChange}
          onCopyPath={onCopyPath}
          onEditKey={handleOpenEditKey}
          onEditValue={handleOpenEditValue}
          onAddChild={handleOpenAddChild}
          onStartLinkMode={handleStartLinkFromMobile}
          onExportNodePng={() => {
            controls.exportNodePng(menu.node ?? mobileSheet.node);
            setMobileSheet({ open: false, node: undefined });
          }}
          onExportNodeSvg={() => {
            controls.exportNodeSvg(menu.node ?? mobileSheet.node);
            setMobileSheet({ open: false, node: undefined });
          }}
          onDelete={handleOpenDelete}
        />

        {/* Edit Value Dialog */}
        <EditValueDialog
          open={editValue.open}
          text={editValue.text}
          error={editValue.error}
          onChange={editValue.setText}
          onSave={editValue.applyChanges}
          onCancel={editValue.closeDialog}
          onFormat={() => {
            try {
              const v = JSON.parse(editValue.text);
              editValue.setText(JSON.stringify(v, null, 2));
            } catch {}
          }}
          onMinify={() => {
            try {
              const v = JSON.parse(editValue.text);
              editValue.setText(JSON.stringify(v));
            } catch {}
          }}
          onQuote={() => editValue.setText(JSON.stringify(editValue.text))}
          onUnquote={() => {
            try {
              const v = JSON.parse(editValue.text);
              if (typeof v === "string") editValue.setText(v);
            } catch {}
          }}
        />

        {/* Edit Key Dialog */}
        <EditKeyDialog
          open={editKey.open}
          keyText={editKey.keyText}
          onChange={editKey.setKeyText}
          onSave={editKey.applyChanges}
          onCancel={editKey.closeDialog}
        />

        {/* Add Child Dialog */}
        <AddChildDialog
          open={addChild.open}
          isObjectParent={addChild.isObjectParent}
          keyText={addChild.keyText}
          valueText={addChild.valueText}
          error={addChild.error}
          onKeyChange={addChild.setKeyText}
          onValueChange={addChild.setValueText}
          onFormat={() => {
            try {
              const v = JSON.parse(addChild.valueText);
              addChild.setValueText(JSON.stringify(v, null, 2));
            } catch {}
          }}
          onMinify={() => {
            try {
              const v = JSON.parse(addChild.valueText);
              addChild.setValueText(JSON.stringify(v));
            } catch {}
          }}
          onQuote={() => addChild.setValueText(JSON.stringify(addChild.valueText))}
          onUnquote={() => {
            try {
              const v = JSON.parse(addChild.valueText);
              if (typeof v === "string") addChild.setValueText(v);
            } catch {}
          }}
          onAdd={addChild.applyChanges}
          onCancel={addChild.closeDialog}
        />

        {/* Delete confirmation */}
        <DeleteConfirmDialog
          open={delNode.open}
          onOpenChange={(open) => (open ? undefined : delNode.closeDialog())}
          onConfirm={delNode.confirmDelete}
        />
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
