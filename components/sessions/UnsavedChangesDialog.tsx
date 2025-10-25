"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UnsavedChangesDialog({
  open,
  onOpenChangeAction,
  sessionName,
  onSaveAndContinueAction,
  onDiscardAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  sessionName?: string | null;
  onSaveAndContinueAction: () => void;
  onDiscardAction: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          You have unsaved changes{sessionName ? (
            <> in <span className="font-medium text-foreground">{sessionName}</span></>
          ) : null}. Do you want to save them before proceeding?
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChangeAction(false)}>Cancel</Button>
          <Button variant="outline" onClick={onDiscardAction}>Discard Changes</Button>
          <Button onClick={onSaveAndContinueAction}>Save and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnsavedChangesDialog;
