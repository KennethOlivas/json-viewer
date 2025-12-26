"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Settings2,
    Play,
    Pause,
    Expand,
    Shrink,
    Search,
    Keyboard,
} from "lucide-react";
import type { LayoutMode } from "@/hooks/graph-3d/useGraph3D";

interface Graph3DControlsProps {
    // View controls
    layoutMode: LayoutMode;
    onLayoutChange: (mode: LayoutMode) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenter: () => void;
    onReset: () => void;
    // Visual settings
    nodeScale: number;
    onNodeScaleChange: (scale: number) => void;
    linkOpacity: number;
    onLinkOpacityChange: (opacity: number) => void;
    showParticles: boolean;
    onShowParticlesChange: (show: boolean) => void;
    autoRotate: boolean;
    onAutoRotateChange: (rotate: boolean) => void;
    // Collapse controls
    onExpandAll: () => void;
    onCollapseAll: () => void;
    // Search
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchResultCount: number;
    onNextResult: () => void;
    onPrevResult: () => void;
}

const layoutOptions: { value: LayoutMode; label: string }[] = [
    { value: "force", label: "Force" },
    { value: "radial", label: "Radial" },
    { value: "tree", label: "Tree" },
];

export function Graph3DControls({
    layoutMode,
    onLayoutChange,
    onZoomIn,
    onZoomOut,
    onCenter,
    onReset,
    nodeScale,
    onNodeScaleChange,
    linkOpacity,
    onLinkOpacityChange,
    showParticles,
    onShowParticlesChange,
    autoRotate,
    onAutoRotateChange,
    onExpandAll,
    onCollapseAll,
    searchQuery,
    onSearchChange,
    searchResultCount,
    onNextResult,
    onPrevResult,
}: Graph3DControlsProps) {
    const [showKeyboard, setShowKeyboard] = useState(false);

    return (
        <TooltipProvider delayDuration={200}>
            {/* Main bottom toolbar */}
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/70 px-3 py-2 shadow-xl backdrop-blur-xl">
                {/* Zoom controls */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onZoomIn}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Zoom In (Scroll Up)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onZoomOut}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Zoom Out (Scroll Down)</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Navigation */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onCenter}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Fit to View (F)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Reset View (R)</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Auto rotate */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${autoRotate ? "bg-cyan-500/20 text-cyan-400" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                            onClick={() => onAutoRotateChange(!autoRotate)}
                        >
                            {autoRotate ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {autoRotate ? "Stop Auto-Rotate (Space)" : "Auto-Rotate (Space)"}
                    </TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Expand/Collapse all */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onExpandAll}
                        >
                            <Expand className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Expand All (E)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onCollapseAll}
                        >
                            <Shrink className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Collapse All (C)</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Layout selector */}
                <div className="flex items-center gap-1 rounded-full bg-white/5 p-0.5">
                    {layoutOptions.map((opt) => (
                        <Button
                            key={opt.value}
                            variant="ghost"
                            size="sm"
                            className={`h-7 rounded-full px-3 text-xs ${layoutMode === opt.value
                                ? "bg-white/20 text-white"
                                : "text-white/50 hover:text-white/80"
                                }`}
                            onClick={() => onLayoutChange(opt.value)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Settings popover */}
                <Popover>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">Visual Settings</TooltipContent>
                    </Tooltip>
                    <PopoverContent
                        side="top"
                        align="end"
                        className="w-64 border-white/10 bg-black/90 backdrop-blur-xl"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-white/70">Node Size</Label>
                                    <span className="text-xs text-white/50">{nodeScale.toFixed(1)}x</span>
                                </div>
                                <Slider
                                    value={[nodeScale]}
                                    onValueChange={([v]) => onNodeScaleChange(v)}
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-white/70">Link Opacity</Label>
                                    <span className="text-xs text-white/50">{Math.round(linkOpacity * 100)}%</span>
                                </div>
                                <Slider
                                    value={[linkOpacity]}
                                    onValueChange={([v]) => onLinkOpacityChange(v)}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-white/70">Particle Effects</Label>
                                <Switch
                                    checked={showParticles}
                                    onCheckedChange={onShowParticlesChange}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Keyboard shortcuts */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${showKeyboard ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                            onClick={() => setShowKeyboard(!showKeyboard)}
                        >
                            <Keyboard className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Keyboard Shortcuts (?)</TooltipContent>
                </Tooltip>
            </div>

            {/* Search bar (top) */}
            <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-xl">
                    <Search className="h-4 w-4 text-white/50" />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-48 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    />
                    {searchResultCount > 0 && (
                        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                            <span className="text-xs text-white/50">{searchResultCount} found</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-white/50 hover:text-white"
                                onClick={onPrevResult}
                            >
                                ‹
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-white/50 hover:text-white"
                                onClick={onNextResult}
                            >
                                ›
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard shortcuts panel */}
            {showKeyboard && (
                <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl">
                    <div className="mb-3 text-sm font-medium text-white/80">Keyboard Shortcuts</div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Drag</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Orbit</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Scroll</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Zoom</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Right Drag</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Pan</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Click Node</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Select</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Double Click</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Collapse</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Fit View</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">F</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Reset</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">R</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Auto-Rotate</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Space</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Search</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">/</kbd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-white/50">Escape</span>
                            <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/70">Deselect</kbd>
                        </div>
                    </div>
                </div>
            )}
        </TooltipProvider>
    );
}

export default Graph3DControls;
