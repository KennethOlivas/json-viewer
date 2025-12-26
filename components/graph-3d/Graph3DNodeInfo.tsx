"use client";

import { useMemo } from "react";
import type { Node3D } from "@/lib/json-to-3d-graph";
import { pathToString } from "@/lib/json-to-3d-graph";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    X,
    Copy,
    ChevronRight,
    ChevronDown,
    Maximize2,
    Hash,
    Type,
    ToggleLeft,
    Circle,
    Braces,
    Brackets,
} from "lucide-react";
import { toast } from "sonner";

const typeIcons = {
    object: Braces,
    array: Brackets,
    string: Type,
    number: Hash,
    boolean: ToggleLeft,
    null: Circle,
};

interface Graph3DNodeInfoProps {
    node: Node3D | null;
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
    onFocusCamera: () => void;
}

export function Graph3DNodeInfo({
    node,
    isCollapsed,
    onClose,
    onToggleCollapse,
    onFocusCamera,
}: Graph3DNodeInfoProps) {
    const valuePreview = useMemo(() => {
        if (!node?.rawValue) return null;
        const val = node.rawValue;
        if (val === null) return "null";
        if (typeof val === "boolean") return val ? "true" : "false";
        if (typeof val === "number") return String(val);
        if (typeof val === "string") {
            return val.length > 100 ? val.slice(0, 100) + "..." : val;
        }
        if (Array.isArray(val)) {
            return JSON.stringify(val, null, 2).slice(0, 300);
        }
        if (typeof val === "object") {
            return JSON.stringify(val, null, 2).slice(0, 300);
        }
        return String(val);
    }, [node?.rawValue]);

    const copyPath = () => {
        if (!node) return;
        navigator.clipboard.writeText(pathToString(node.path));
        toast.success("Path copied to clipboard");
    };

    const copyValue = () => {
        if (!node?.rawValue) return;
        navigator.clipboard.writeText(JSON.stringify(node.rawValue, null, 2));
        toast.success("Value copied to clipboard");
    };

    if (!node) return null;

    const TypeIcon = typeIcons[node.type];

    return (
        <div className="absolute left-4 top-4 z-30 w-80 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: node.color + "30" }}
                    >
                        <TypeIcon className="h-4 w-4" style={{ color: node.color }} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white/90">
                            {node.path.length === 0
                                ? "Root"
                                : node.path[node.path.length - 1]}
                        </div>
                        <div className="text-xs text-white/50">{node.type}</div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Path */}
            <div className="border-b border-white/5 px-4 py-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                        Path
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-white/40 hover:bg-white/10 hover:text-white"
                        onClick={copyPath}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
                <code className="mt-1 block break-all font-mono text-xs text-cyan-400">
                    {pathToString(node.path) || "root"}
                </code>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px border-b border-white/5 bg-white/5">
                <div className="bg-black/50 px-3 py-2 text-center">
                    <div className="text-lg font-semibold text-white/90">{node.depth}</div>
                    <div className="text-[10px] text-white/40">Depth</div>
                </div>
                <div className="bg-black/50 px-3 py-2 text-center">
                    <div className="text-lg font-semibold text-white/90">
                        {node.childCount}
                    </div>
                    <div className="text-[10px] text-white/40">Children</div>
                </div>
                <div className="bg-black/50 px-3 py-2 text-center">
                    <div
                        className="text-lg font-semibold"
                        style={{ color: node.color }}
                    >
                        ●
                    </div>
                    <div className="text-[10px] text-white/40">Type</div>
                </div>
            </div>

            {/* Value Preview */}
            {valuePreview && (
                <div className="border-b border-white/5 px-4 py-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                            Value
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-white/40 hover:bg-white/10 hover:text-white"
                            onClick={copyValue}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <ScrollArea className="mt-1 max-h-32">
                        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-white/70">
                            {valuePreview}
                        </pre>
                    </ScrollArea>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 p-3">
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={onFocusCamera}
                >
                    <Maximize2 className="mr-1.5 h-3 w-3" />
                    Focus
                </Button>
                {node.childCount > 0 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                        onClick={onToggleCollapse}
                    >
                        {isCollapsed ? (
                            <>
                                <ChevronRight className="mr-1.5 h-3 w-3" />
                                Expand
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-1.5 h-3 w-3" />
                                Collapse
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default Graph3DNodeInfo;
