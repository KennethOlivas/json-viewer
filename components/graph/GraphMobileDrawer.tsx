"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export interface GraphMobileDrawerProps {
  open: boolean;
  nodeLabel?: string;
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

export function GraphMobileDrawer(props: GraphMobileDrawerProps) {
  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-4">
          <div className="mb-3 text-sm text-muted-foreground">
            {props.nodeLabel}
          </div>
          <div className="grid gap-2">
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onCopyPath}
            >
              Copy path
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onEditKey}
            >
              Edit key
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onEditValue}
            >
              Edit value
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onAddChild}
            >
              Add child
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onStartLinkMode}
            >
              Link to node
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onExportNodePng}
            >
              Export node PNG
            </Button>
            <Button
              variant="secondary"
              className="h-12 justify-start text-base"
              onClick={props.onExportNodeSvg}
            >
              Export node SVG
            </Button>
            <Button
              variant="destructive"
              className="h-12 justify-start text-base"
              onClick={props.onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
