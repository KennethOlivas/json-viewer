"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface AddChildDialogProps {
  open: boolean;
  isObjectParent: boolean;
  keyText: string;
  valueText: string;
  error?: string;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onFormat?: () => void;
  onMinify?: () => void;
  onQuote?: () => void;
  onUnquote?: () => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddChildDialog({
  open,
  isObjectParent,
  keyText,
  valueText,
  error,
  onKeyChange,
  onValueChange,
  onFormat,
  onMinify,
  onQuote,
  onUnquote,
  onAdd,
  onCancel,
}: AddChildDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add child</DialogTitle>
          <DialogDescription>
            Append a value to an array or add a key/value to an object. Live
            JSON validation for value.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {isObjectParent ? (
            <Input
              placeholder="key"
              value={keyText}
              onChange={(e) => onKeyChange(e.target.value)}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onFormat}>
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={onMinify}>
              Minify
            </Button>
            <Button variant="outline" size="sm" onClick={onQuote}>
              Quote
            </Button>
            <Button variant="outline" size="sm" onClick={onUnquote}>
              Unquote
            </Button>
          </div>
          <Textarea
            value={valueText}
            onChange={(e) => onValueChange(e.target.value)}
            className="min-h-32"
          />
          <div className="text-xs">
            {!error ? (
              <span className="text-emerald-400">Valid JSON</span>
            ) : (
              <span className="text-red-400">{error}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={!!error}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
