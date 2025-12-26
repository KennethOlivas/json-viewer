"use client";

import { useCallback, useRef, useEffect } from "react";
import { useJson } from "@/providers/JsonProvider";
import { Graph3DCanvas, type Graph3DRef } from "@/components/graph-3d/Graph3DCanvas";
import { Graph3DControls } from "@/components/graph-3d/Graph3DControls";
import { Graph3DLegend } from "@/components/graph-3d/Graph3DLegend";
import { Graph3DNodeInfo } from "@/components/graph-3d/Graph3DNodeInfo";
import { useGraph3D } from "@/hooks/graph-3d/useGraph3D";
import type { Node3D } from "@/lib/json-to-3d-graph";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";

export default function ThreeDViewPage() {
    const { data } = useJson();
    const graphRef = useRef<Graph3DRef | null>(null);

    const {
        graph,
        layoutMode,
        highlightPath,
        focusedNodeId,
        selectedNode,
        collapsedNodes,
        searchQuery,
        searchResults,
        visualSettings,
        toggleCollapse,
        focusNode,
        selectNode,
        expandAll,
        collapseAll,
        setLayoutMode,
        setSearchQuery,
        nextSearchResult,
        prevSearchResult,
        isCollapsed,
        updateVisualSetting,
        resetView,
    } = useGraph3D(data);

    const handleNodeClick = useCallback(
        (node: Node3D) => {
            selectNode(node);
        },
        [selectNode]
    );

    const handleNodeDoubleClick = useCallback(
        (node: Node3D) => {
            if (node.type === "object" || node.type === "array") {
                toggleCollapse(node.id);
            }
        },
        [toggleCollapse]
    );

    const handleBackgroundClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    const handleGraphRef = useCallback((ref: Graph3DRef) => {
        graphRef.current = ref;
    }, []);

    const handleZoomIn = useCallback(() => {
        graphRef.current?.zoom(1.5, 400);
    }, []);

    const handleZoomOut = useCallback(() => {
        graphRef.current?.zoom(0.7, 400);
    }, []);

    const handleCenter = useCallback(() => {
        graphRef.current?.zoomToFit(400, 50);
    }, []);

    const handleReset = useCallback(() => {
        resetView();
        graphRef.current?.zoomToFit(600, 100);
    }, [resetView]);

    const handleFocusCamera = useCallback(() => {
        if (selectedNode && graphRef.current) {
            graphRef.current.zoomToFit(500, 80);
        }
    }, [selectedNode]);

    const handleCloseInfo = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    const handleToggleCollapse = useCallback(() => {
        if (selectedNode) {
            toggleCollapse(selectedNode.id);
        }
    }, [selectedNode, toggleCollapse]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key.toLowerCase()) {
                case "f":
                    handleCenter();
                    break;
                case "r":
                    handleReset();
                    break;
                case " ":
                    e.preventDefault();
                    updateVisualSetting("autoRotate", !visualSettings.autoRotate);
                    break;
                case "e":
                    expandAll();
                    break;
                case "c":
                    collapseAll();
                    break;
                case "escape":
                    selectNode(null);
                    break;
                case "/":
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('input[placeholder="Search nodes..."]')?.focus();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleCenter, handleReset, updateVisualSetting, visualSettings.autoRotate, expandAll, collapseAll, selectNode]);

    return (
        <div className="relative h-[calc(100dvh-56px)] w-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-[#0d0d1a] to-[#0a0a0f]" />

            {/* Starfield effect */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute left-[10%] top-[20%] h-1 w-1 animate-pulse rounded-full bg-blue-400" />
                <div className="absolute left-[30%] top-[60%] h-0.5 w-0.5 animate-pulse rounded-full bg-cyan-400 delay-75" />
                <div className="absolute left-[50%] top-[15%] h-1 w-1 animate-pulse rounded-full bg-purple-400 delay-150" />
                <div className="absolute left-[70%] top-[40%] h-0.5 w-0.5 animate-pulse rounded-full bg-pink-400 delay-100" />
                <div className="absolute left-[85%] top-[70%] h-1 w-1 animate-pulse rounded-full bg-blue-300 delay-200" />
                <div className="absolute left-[20%] top-[80%] h-0.5 w-0.5 animate-pulse rounded-full bg-cyan-300" />
                <div className="absolute left-[60%] top-[85%] h-1 w-1 animate-pulse rounded-full bg-indigo-400 delay-300" />
                <div className="absolute left-[90%] top-[25%] h-0.5 w-0.5 animate-pulse rounded-full bg-violet-400" />
            </div>

            {/* Empty state */}
            {!data && (
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-white/5 p-6">
                        <Box className="h-16 w-16 text-white/20" />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium text-white/80">No JSON Data</h2>
                        <p className="mt-1 text-sm text-white/40">
                            Load a JSON file to explore it in 3D space
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="mt-2 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        Import JSON
                    </Button>
                </div>
            )}

            {/* 3D Canvas */}
            {data && (
                <>
                    <Graph3DCanvas
                        nodes={graph.nodes}
                        links={graph.links}
                        layoutMode={layoutMode}
                        highlightPath={highlightPath}
                        focusedNodeId={focusedNodeId}
                        collapsedNodes={collapsedNodes}
                        searchMatchIds={searchResults.map((n) => n.id)}
                        nodeScale={visualSettings.nodeScale}
                        linkOpacity={visualSettings.linkOpacity}
                        showParticles={visualSettings.showParticles}
                        autoRotate={visualSettings.autoRotate}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onNodeHover={(node) => {
                            // Light hover effect - don't select, just show tooltip
                        }}
                        onGraphRef={handleGraphRef}
                        onBackgroundClick={handleBackgroundClick}
                    />

                    {/* Node Info Panel (left side) */}
                    <Graph3DNodeInfo
                        node={selectedNode}
                        isCollapsed={selectedNode ? isCollapsed(selectedNode.id) : false}
                        onClose={handleCloseInfo}
                        onToggleCollapse={handleToggleCollapse}
                        onFocusCamera={handleFocusCamera}
                    />

                    {/* Legend (right side, only if no node selected) */}
                    {!selectedNode && <Graph3DLegend />}

                    {/* Controls (search bar at top, toolbar at bottom) */}
                    <Graph3DControls
                        layoutMode={layoutMode}
                        onLayoutChange={setLayoutMode}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onCenter={handleCenter}
                        onReset={handleReset}
                        nodeScale={visualSettings.nodeScale}
                        onNodeScaleChange={(v) => updateVisualSetting("nodeScale", v)}
                        linkOpacity={visualSettings.linkOpacity}
                        onLinkOpacityChange={(v) => updateVisualSetting("linkOpacity", v)}
                        showParticles={visualSettings.showParticles}
                        onShowParticlesChange={(v) => updateVisualSetting("showParticles", v)}
                        autoRotate={visualSettings.autoRotate}
                        onAutoRotateChange={(v) => updateVisualSetting("autoRotate", v)}
                        onExpandAll={expandAll}
                        onCollapseAll={collapseAll}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchResultCount={searchResults.length}
                        onNextResult={nextSearchResult}
                        onPrevResult={prevSearchResult}
                    />

                    {/* Node count info */}
                    <div className="absolute bottom-4 right-4 z-20 text-xs text-white/30">
                        {graph.nodes.length} nodes • {graph.links.length} links
                        {collapsedNodes.size > 0 && ` • ${collapsedNodes.size} collapsed`}
                    </div>
                </>
            )}
        </div>
    );
}
