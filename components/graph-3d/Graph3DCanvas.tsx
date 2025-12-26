"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import type { Node3D, Link3D } from "@/lib/json-to-3d-graph";
import type { LayoutMode } from "@/hooks/graph-3d/useGraph3D";
import * as THREE from "three";

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
    ssr: false,
});

// Extended node type with 3D positions - using index signature for compatibility
interface GraphNode3D {
    id: string;
    label: string;
    type: "object" | "array" | "string" | "number" | "boolean" | "null";
    path: (string | number)[];
    depth: number;
    childCount: number;
    color: string;
    val: number;
    x?: number;
    y?: number;
    z?: number;
    fx?: number;
    fy?: number;
    fz?: number;
    [key: string]: unknown;
}

// Extended link type
interface GraphLink3D {
    source: string | GraphNode3D;
    target: string | GraphNode3D;
    label?: string;
    [key: string]: unknown;
}

// ForceGraph ref type - using any to avoid complex type gymnastics with the library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphInstance = any;

export type Graph3DRef = {
    centerAt: (x: number, y: number, z: number, ms?: number) => void;
    zoom: (k: number, ms?: number) => void;
    cameraPosition: (
        position?: { x: number; y: number; z: number },
        lookAt?: { x: number; y: number; z: number },
        ms?: number
    ) => void;
    zoomToFit: (ms?: number, padding?: number) => void;
};

interface Graph3DCanvasProps {
    nodes: Node3D[];
    links: Link3D[];
    layoutMode: LayoutMode;
    highlightPath: string[];
    focusedNodeId: string | null;
    collapsedNodes: Set<string>;
    searchMatchIds?: string[];
    // Visual settings
    nodeScale?: number;
    linkOpacity?: number;
    showParticles?: boolean;
    autoRotate?: boolean;
    // Callbacks
    onNodeClick?: (node: Node3D) => void;
    onNodeDoubleClick?: (node: Node3D) => void;
    onNodeHover?: (node: Node3D | null) => void;
    onGraphRef?: (ref: Graph3DRef) => void;
    onBackgroundClick?: () => void;
}

export function Graph3DCanvas({
    nodes,
    links,
    layoutMode,
    highlightPath,
    focusedNodeId,
    collapsedNodes,
    searchMatchIds = [],
    nodeScale = 1,
    linkOpacity = 0.6,
    showParticles = true,
    autoRotate = false,
    onNodeClick,
    onNodeDoubleClick,
    onNodeHover,
    onGraphRef,
    onBackgroundClick,
}: Graph3DCanvasProps) {
    const fgRef = useRef<ForceGraphInstance>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle container resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Expose ref API
    useEffect(() => {
        if (fgRef.current && onGraphRef) {
            const fg = fgRef.current;
            onGraphRef({
                centerAt: (x, y, z, ms) => {
                    fg.cameraPosition({ x, y, z }, undefined, ms);
                },
                zoom: (k, ms) => {
                    const currentPos = fg.camera().position;
                    const distance = 300 / k;
                    const len = currentPos.length() || 1;
                    fg.cameraPosition(
                        {
                            x: currentPos.x * (distance / len),
                            y: currentPos.y * (distance / len),
                            z: currentPos.z * (distance / len),
                        },
                        undefined,
                        ms
                    );
                },
                cameraPosition: fg.cameraPosition.bind(fg),
                zoomToFit: fg.zoomToFit.bind(fg),
            });
        }
    }, [onGraphRef]);

    // Graph data with proper typing
    const graphData = useMemo(
        () => ({
            nodes: nodes.map((n) => ({ ...n })) as GraphNode3D[],
            links: links.map((l) => ({ ...l })) as GraphLink3D[],
        }),
        [nodes, links]
    );

    // Handle node click with double-click detection
    const handleNodeClick = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => {
            const n = node as GraphNode3D;
            if (clickTimeoutRef.current) {
                // Double click
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
                onNodeDoubleClick?.(n as Node3D);
            } else {
                // Single click with delay
                clickTimeoutRef.current = setTimeout(() => {
                    clickTimeoutRef.current = null;
                    onNodeClick?.(n as Node3D);

                    // Animate camera to focus on node
                    if (fgRef.current && n.x !== undefined) {
                        const distance = 100;
                        fgRef.current.cameraPosition(
                            {
                                x: n.x + distance,
                                y: (n.y ?? 0) + distance * 0.5,
                                z: (n.z ?? 0) + distance,
                            },
                            { x: n.x, y: n.y ?? 0, z: n.z ?? 0 },
                            1000
                        );
                    }
                }, 200);
            }
        },
        [onNodeClick, onNodeDoubleClick]
    );

    // Custom node rendering with Three.js geometries
    const nodeThreeObject = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any) => {
            const n = node as GraphNode3D;
            const isHighlighted = highlightPath.includes(n.id);
            const isFocused = focusedNodeId === n.id;
            const isCollapsed = collapsedNodes.has(n.id);
            const isSearchMatch = searchMatchIds.includes(n.id);
            const baseSize = (n.val || 1) * 3 * nodeScale;

            let geometry: THREE.BufferGeometry;
            let material: THREE.Material;

            const color = new THREE.Color(n.color);
            const emissiveIntensity = isHighlighted || isFocused || isSearchMatch ? 0.6 : 0.15;

            // Choose geometry based on type
            switch (n.type) {
                case "object":
                    geometry = new THREE.SphereGeometry(baseSize, 16, 12);
                    material = new THREE.MeshLambertMaterial({
                        color,
                        emissive: color,
                        emissiveIntensity,
                        transparent: true,
                        opacity: isCollapsed ? 0.9 : 0.7,
                    });
                    break;
                case "array":
                    geometry = new THREE.BoxGeometry(
                        baseSize * 1.5,
                        baseSize * 1.5,
                        baseSize * 1.5
                    );
                    material = new THREE.MeshLambertMaterial({
                        color,
                        emissive: color,
                        emissiveIntensity,
                        transparent: true,
                        opacity: isCollapsed ? 0.9 : 0.7,
                    });
                    break;
                default:
                    // Primitives: octahedron (diamond-like)
                    geometry = new THREE.OctahedronGeometry(baseSize);
                    material = new THREE.MeshLambertMaterial({
                        color,
                        emissive: color,
                        emissiveIntensity: emissiveIntensity + 0.1,
                    });
            }

            const mesh = new THREE.Mesh(geometry, material);

            // Add wireframe for arrays
            if (n.type === "array") {
                const wireframeGeometry = new THREE.EdgesGeometry(geometry);
                const wireframeMaterial = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5,
                });
                const wireframe = new THREE.LineSegments(
                    wireframeGeometry,
                    wireframeMaterial
                );
                mesh.add(wireframe);
            }

            // Add glow ring for focused/highlighted nodes
            if (isHighlighted || isFocused) {
                const ringGeometry = new THREE.RingGeometry(
                    baseSize * 1.5,
                    baseSize * 1.8,
                    32
                );
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: isFocused ? 0xffff00 : 0x00ffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6,
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                mesh.add(ring);
            }

            // Add collapse indicator
            if (isCollapsed && n.childCount > 0) {
                const indicatorGeometry = new THREE.RingGeometry(
                    baseSize * 0.3,
                    baseSize * 0.5,
                    16
                );
                const indicatorMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff6600,
                    side: THREE.DoubleSide,
                });
                const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                indicator.position.y = baseSize + 2;
                mesh.add(indicator);
            }

            return mesh;
        },
        [highlightPath, focusedNodeId, collapsedNodes, nodeScale, searchMatchIds]
    );

    // Custom link rendering
    const linkColor = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (link: any) => {
            const l = link as GraphLink3D;
            const sourceId =
                typeof l.source === "string" ? l.source : (l.source as GraphNode3D).id;
            const targetId =
                typeof l.target === "string" ? l.target : (l.target as GraphNode3D).id;

            if (
                highlightPath.includes(sourceId) &&
                highlightPath.includes(targetId)
            ) {
                return "rgba(0, 255, 255, 0.9)";
            }
            return "rgba(255, 255, 255, 0.2)";
        },
        [highlightPath]
    );

    const linkWidth = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (link: any) => {
            const l = link as GraphLink3D;
            const sourceId =
                typeof l.source === "string" ? l.source : (l.source as GraphNode3D).id;
            const targetId =
                typeof l.target === "string" ? l.target : (l.target as GraphNode3D).id;

            if (
                highlightPath.includes(sourceId) &&
                highlightPath.includes(targetId)
            ) {
                return 2;
            }
            return 0.5;
        },
        [highlightPath]
    );

    // Node label
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeLabel = useCallback((node: any) => {
        const n = node as GraphNode3D;
        return `${n.label}`;
    }, []);

    // Apply layout-specific forces
    useEffect(() => {
        if (!fgRef.current) return;

        const fg = fgRef.current;

        switch (layoutMode) {
            case "radial":
                // Radial layout: push nodes outward based on depth
                fg.d3Force("charge")?.strength(-150);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fg.d3Force("link")?.distance((link: any) => {
                    const source =
                        typeof link.source === "string"
                            ? nodes.find((n) => n.id === link.source)
                            : (link.source as Node3D);
                    return 50 + (source?.depth || 0) * 30;
                });
                break;

            case "tree":
                // Tree layout: stronger hierarchy
                fg.d3Force("charge")?.strength(-200);
                fg.d3Force("link")?.distance(80);
                break;

            default:
                // Force-directed: default settings
                fg.d3Force("charge")?.strength(-100);
                fg.d3Force("link")?.distance(50);
        }

        fg.d3ReheatSimulation();
    }, [layoutMode, nodes]);

    return (
        <div ref={containerRef} className="h-full w-full">
            <ForceGraph3D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeId="id"
                nodeVal="val"
                nodeLabel={nodeLabel}
                nodeThreeObject={nodeThreeObject}
                nodeThreeObjectExtend={false}
                linkColor={linkColor}
                linkWidth={linkWidth}
                linkOpacity={linkOpacity}
                linkDirectionalParticles={showParticles ? 2 : 0}
                linkDirectionalParticleWidth={1}
                linkDirectionalParticleSpeed={0.005}
                onNodeClick={handleNodeClick}
                onNodeHover={(node) => onNodeHover?.(node as Node3D | null)}
                onBackgroundClick={onBackgroundClick}
                backgroundColor="rgba(0,0,0,0)"
                showNavInfo={false}
                enableNodeDrag={!autoRotate}
                enableNavigationControls={true}
                controlType="orbit"
            />
        </div>
    );
}

export default Graph3DCanvas;
