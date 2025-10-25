"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteSessionDialog({
  open,
  onOpenChangeAction,
  sessionName,
  onConfirmAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  sessionName?: string;
  onConfirmAction: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle>Delete session?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This action cannot be undone. This will permanently delete
          {sessionName ? (
            <>
              {" "}
              <span className="font-medium text-foreground">{sessionName}</span>
            </>
          ) : null}
          .
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChangeAction(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmAction}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteSessionDialog;
