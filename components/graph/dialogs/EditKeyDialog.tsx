"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EditKeyDialogProps {
  open: boolean;
  keyText: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditKeyDialog({ open, keyText, onChange, onSave, onCancel }: EditKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit key</DialogTitle>
          <DialogDescription>Rename this property key. Only supported for object properties.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          <Input placeholder="newKey" value={keyText} onChange={(e) => onChange(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
