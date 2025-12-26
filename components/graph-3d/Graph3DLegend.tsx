"use client";

import { TYPE_COLORS } from "@/lib/json-to-3d-graph";

const legendItems = [
    { type: "object", label: "Object {}", shape: "sphere" },
    { type: "array", label: "Array []", shape: "cube" },
    { type: "string", label: "String", shape: "diamond" },
    { type: "number", label: "Number", shape: "diamond" },
    { type: "boolean", label: "Boolean", shape: "diamond" },
    { type: "null", label: "Null", shape: "diamond" },
] as const;

export function Graph3DLegend() {
    return (
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1 rounded-lg border border-white/10 bg-black/60 p-3 text-xs backdrop-blur-md">
            <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                Legend
            </span>
            {legendItems.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                    <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{
                            backgroundColor: TYPE_COLORS[item.type],
                            borderRadius: item.shape === "sphere" ? "50%" : item.shape === "diamond" ? "2px" : "0",
                            transform: item.shape === "diamond" ? "rotate(45deg) scale(0.8)" : undefined,
                        }}
                    />
                    <span className="text-white/70">{item.label}</span>
                </div>
            ))}
            <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-white/40">
                <p>Click: Focus node</p>
                <p>Double-click: Collapse/Expand</p>
                <p>Drag: Orbit camera</p>
                <p>Scroll: Zoom</p>
            </div>
        </div>
    );
}

export default Graph3DLegend;
