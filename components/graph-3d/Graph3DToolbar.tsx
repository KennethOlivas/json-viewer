"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Layout,
    Circle,
    GitBranch,
    Atom,
} from "lucide-react";
import type { LayoutMode } from "@/hooks/graph-3d/useGraph3D";

const layoutOptions: { value: LayoutMode; label: string; icon: typeof Atom }[] = [
    { value: "force", label: "Force-Directed", icon: Atom },
    { value: "radial", label: "Radial", icon: Circle },
    { value: "tree", label: "Tree", icon: GitBranch },
];

interface Graph3DToolbarProps {
    layoutMode: LayoutMode;
    onLayoutChange: (mode: LayoutMode) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenter: () => void;
    onReset: () => void;
}

export function Graph3DToolbar({
    layoutMode,
    onLayoutChange,
    onZoomIn,
    onZoomOut,
    onCenter,
    onReset,
}: Graph3DToolbarProps) {
    const currentLayout = layoutOptions.find((o) => o.value === layoutMode);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1.5 shadow-lg backdrop-blur-md">
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
                    <TooltipContent side="top">Zoom In</TooltipContent>
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
                    <TooltipContent side="top">Zoom Out</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Center/Fit */}
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
                    <TooltipContent side="top">Fit to View</TooltipContent>
                </Tooltip>

                {/* Reset */}
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
                    <TooltipContent side="top">Reset View</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-white/20" />

                {/* Layout selector */}
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 px-2 text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    <Layout className="h-4 w-4" />
                                    <span className="text-xs">{currentLayout?.label}</span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">Layout Mode</TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent align="center" className="w-40">
                        {layoutOptions.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => onLayoutChange(opt.value)}
                                className={layoutMode === opt.value ? "bg-accent" : ""}
                            >
                                <opt.icon className="mr-2 h-4 w-4" />
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </TooltipProvider>
    );
}

export default Graph3DToolbar;
