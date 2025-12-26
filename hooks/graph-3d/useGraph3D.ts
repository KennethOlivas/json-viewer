"use client";

import { useState, useMemo, useCallback } from "react";
import type { JSONValue } from "@/lib/json";
import { jsonTo3DGraph, pathToString, type Node3D } from "@/lib/json-to-3d-graph";

export type LayoutMode = "force" | "radial" | "tree";

export interface VisualSettings {
    nodeScale: number;
    linkOpacity: number;
    showParticles: boolean;
    autoRotate: boolean;
}

export function useGraph3D(data: JSONValue | null) {
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
    const [layoutMode, setLayoutMode] = useState<LayoutMode>("force");
    const [highlightPath, setHighlightPath] = useState<string[]>([]);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchIndex, setSearchIndex] = useState(0);

    // Visual settings
    const [visualSettings, setVisualSettings] = useState<VisualSettings>({
        nodeScale: 1,
        linkOpacity: 0.6,
        showParticles: true,
        autoRotate: false,
    });

    // Convert JSON to graph structure
    const fullGraph = useMemo(() => {
        if (!data) return { nodes: [], links: [] };
        return jsonTo3DGraph(data);
    }, [data]);

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return fullGraph.nodes.filter((node) => {
            const label = node.label.toLowerCase();
            const path = pathToString(node.path).toLowerCase();
            const lastKey = node.path.length > 0 ? String(node.path[node.path.length - 1]).toLowerCase() : "";
            return label.includes(query) || path.includes(query) || lastKey.includes(query);
        });
    }, [fullGraph.nodes, searchQuery]);

    // Filter out collapsed branches
    const visibleGraph = useMemo(() => {
        if (collapsedNodes.size === 0) return fullGraph;

        const hiddenNodeIds = new Set<string>();

        // Find all nodes that are descendants of collapsed nodes
        fullGraph.links.forEach((link) => {
            const sourceId =
                typeof link.source === "string" ? link.source : (link.source as Node3D).id;
            if (collapsedNodes.has(sourceId) || hiddenNodeIds.has(sourceId)) {
                const targetId =
                    typeof link.target === "string" ? link.target : (link.target as Node3D).id;
                hiddenNodeIds.add(targetId);
            }
        });

        // Filter nodes and links
        const nodes = fullGraph.nodes.filter((n) => !hiddenNodeIds.has(n.id));
        const links = fullGraph.links.filter((l) => {
            const sourceId =
                typeof l.source === "string" ? l.source : (l.source as Node3D).id;
            const targetId =
                typeof l.target === "string" ? l.target : (l.target as Node3D).id;
            return !hiddenNodeIds.has(sourceId) && !hiddenNodeIds.has(targetId);
        });

        return { nodes, links };
    }, [fullGraph, collapsedNodes]);

    // Toggle node collapse state
    const toggleCollapse = useCallback((nodeId: string) => {
        setCollapsedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    // Expand all nodes
    const expandAll = useCallback(() => {
        setCollapsedNodes(new Set());
    }, []);

    // Collapse all nodes with children
    const collapseAll = useCallback(() => {
        const nodesToCollapse = fullGraph.nodes
            .filter((n) => n.childCount > 0 && n.id !== "root")
            .map((n) => n.id);
        setCollapsedNodes(new Set(nodesToCollapse));
    }, [fullGraph.nodes]);

    // Focus on a specific node
    const focusNode = useCallback(
        (node: Node3D | null) => {
            if (!node) {
                setFocusedNodeId(null);
                setHighlightPath([]);
                return;
            }

            setFocusedNodeId(node.id);

            // Build path from root to this node
            const path: string[] = ["root"];
            let currentPath = "";
            for (const segment of node.path) {
                if (typeof segment === "number") {
                    currentPath = currentPath
                        ? `${currentPath}.${segment}`
                        : String(segment);
                } else {
                    currentPath = currentPath ? `${currentPath}.${segment}` : segment;
                }
                path.push(currentPath);
            }
            setHighlightPath(path);
        },
        []
    );

    // Select a node (for info panel)
    const selectNode = useCallback((node: Node3D | null) => {
        setSelectedNode(node);
        if (node) {
            focusNode(node);
        }
    }, [focusNode]);

    // Get path string for a node
    const getNodePath = useCallback((node: Node3D) => {
        return pathToString(node.path);
    }, []);

    // Check if a node is collapsed
    const isCollapsed = useCallback(
        (nodeId: string) => collapsedNodes.has(nodeId),
        [collapsedNodes]
    );

    // Check if a node/link is in highlight path
    const isInHighlightPath = useCallback(
        (id: string) => highlightPath.includes(id),
        [highlightPath]
    );

    // Check if a node matches search
    const isSearchMatch = useCallback(
        (nodeId: string) => searchResults.some((n) => n.id === nodeId),
        [searchResults]
    );

    // Current search result
    const currentSearchResult = useMemo(() => {
        if (searchResults.length === 0) return null;
        return searchResults[searchIndex % searchResults.length];
    }, [searchResults, searchIndex]);

    // Navigate search results
    const nextSearchResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const nextIndex = (searchIndex + 1) % searchResults.length;
        setSearchIndex(nextIndex);
        selectNode(searchResults[nextIndex]);
    }, [searchResults, searchIndex, selectNode]);

    const prevSearchResult = useCallback(() => {
        if (searchResults.length === 0) return;
        const prevIndex = (searchIndex - 1 + searchResults.length) % searchResults.length;
        setSearchIndex(prevIndex);
        selectNode(searchResults[prevIndex]);
    }, [searchResults, searchIndex, selectNode]);

    // Update visual settings
    const updateVisualSetting = useCallback(<K extends keyof VisualSettings>(
        key: K,
        value: VisualSettings[K]
    ) => {
        setVisualSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Reset view
    const resetView = useCallback(() => {
        setCollapsedNodes(new Set());
        setFocusedNodeId(null);
        setSelectedNode(null);
        setHighlightPath([]);
        setSearchQuery("");
        setSearchIndex(0);
    }, []);

    return {
        graph: visibleGraph,
        fullGraph,
        collapsedNodes,
        focusedNodeId,
        selectedNode,
        layoutMode,
        highlightPath,
        searchQuery,
        searchResults,
        currentSearchResult,
        visualSettings,
        toggleCollapse,
        expandAll,
        collapseAll,
        focusNode,
        selectNode,
        setLayoutMode,
        setSearchQuery,
        nextSearchResult,
        prevSearchResult,
        getNodePath,
        isCollapsed,
        isInHighlightPath,
        isSearchMatch,
        updateVisualSetting,
        resetView,
    };
}
