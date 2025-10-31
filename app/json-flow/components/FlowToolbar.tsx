"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Save, Download, RotateCcw } from "lucide-react";

export function FlowToolbar({
  onAddNodeAction,
  onSaveAction,
  onExportAction,
  onResetAction,
}: {
  onAddNodeAction: (type: "Start" | "SayText" | "SwitchNode") => void;
  onSaveAction: () => void;
  onExportAction: () => void;
  onResetAction: () => void;
}) {
  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-6 text-primary">
      <div className="text-lg font-semibold">JSON Flow Visualizer</div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1">
              <Plus className="h-4 w-4" /> Add Node
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddNodeAction("Start")}>
              Start
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddNodeAction("SayText")}>
              SayText
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddNodeAction("SwitchNode")}>
              SwitchNode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" className="gap-1" onClick={onSaveAction}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button variant="ghost" className="gap-1" onClick={onExportAction}>
          <Download className="h-4 w-4" /> Export JSON
        </Button>
        <Button variant="ghost" className="gap-1" onClick={onResetAction}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}

export default FlowToolbar;
