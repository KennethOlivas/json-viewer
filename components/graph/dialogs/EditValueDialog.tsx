"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface EditValueDialogProps {
  open: boolean;
  text: string;
  error?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onFormat?: () => void;
  onMinify?: () => void;
  onQuote?: () => void;
  onUnquote?: () => void;
}

export function EditValueDialog({ open, text, error, onChange, onSave, onCancel, onFormat, onMinify, onQuote, onUnquote }: EditValueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit value</DialogTitle>
          <DialogDescription>
            Update the JSON value for this node. Live JSON validation below. For strings, include quotes; objects/arrays must be valid JSON.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onFormat}>Format</Button>
            <Button variant="outline" size="sm" onClick={onMinify}>Minify</Button>
            <Button variant="outline" size="sm" onClick={onQuote}>Quote</Button>
            <Button variant="outline" size="sm" onClick={onUnquote}>Unquote</Button>
          </div>
          <Textarea value={text} onChange={(e) => onChange(e.target.value)} className="min-h-32" />
          <div className="text-xs">
            {!error ? (
              <span className="text-emerald-400">Valid JSON</span>
            ) : (
              <span className="text-red-400">{error}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave} disabled={!!error}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
