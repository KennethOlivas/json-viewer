"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DuplicateSessionDialog({
  open,
  onOpenChangeAction,
  sessionName,
  onOverwriteAction,
  onCreateNewAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  sessionName: string;
  onOverwriteAction: () => void;
  onCreateNewAction: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle>Duplicate session detected</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          A session with identical JSON already exists: <span className="font-medium text-foreground">{sessionName}</span>.
          What would you like to do?
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChangeAction(false)}>Cancel</Button>
          <Button variant="outline" onClick={onCreateNewAction}>Create new</Button>
          <Button onClick={onOverwriteAction}>Overwrite existing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DuplicateSessionDialog;
