"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crosshair,
  Download,
  Home,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { VTLink } from "@/components/VTLink";

export function GraphToolbar({
  onZoomInAction,
  onZoomOutAction,
  onCenterAction,
  onResetAction,
  onExportPngAction,
}: {
  onZoomInAction?: () => void;
  onZoomOutAction?: () => void;
  onCenterAction?: () => void;
  onResetAction?: () => void;
  onExportPngAction?: () => void;
}) {
  return (
    <TooltipProvider>
      <div className="pointer-events-auto fixed bottom-6 right-6 z-20 flex gap-2 rounded-xl border border-white/10 bg-background/70 p-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              onClick={onZoomOutAction}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              onClick={onZoomInAction}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              onClick={onCenterAction}
              aria-label="Center"
            >
              <Crosshair className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Center</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              onClick={onResetAction}
              aria-label="Reset layout"
            >
              <RotateCcw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset layout</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              onClick={onExportPngAction}
              aria-label="Export PNG"
            >
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export PNG</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <VTLink href="/">
              <Button size="icon" variant="secondary" aria-label="Home">
                <Home className="size-4" />
              </Button>
            </VTLink>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
