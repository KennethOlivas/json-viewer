"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export interface GraphContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  onOpenChange: (open: boolean) => void;
  onCopyPath: () => void;
  onEditKey: () => void;
  onEditValue: () => void;
  onAddChild: () => void;
  onStartLinkMode: () => void;
  onExportNodePng: () => void;
  onExportNodeSvg: () => void;
  onDelete: () => void;
}

export function GraphContextMenu(props: GraphContextMenuProps) {
  const style = useMemo(
    () => ({ left: props.x, top: props.y, position: "fixed" as const }),
    [props.x, props.y],
  );

  return (
    <DropdownMenu open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          style={style}
          className="invisible fixed"
        >
          .
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" sideOffset={6}>
        <DropdownMenuItem onClick={props.onCopyPath}>
          Copy path
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onEditKey}>Edit key</DropdownMenuItem>
        <DropdownMenuItem onClick={props.onEditValue}>
          Edit value
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onAddChild}>
          Add child
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onStartLinkMode}>
          Link to node
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onExportNodePng}>
          Export node PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.onExportNodeSvg}>
          Export node SVG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={props.onDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
