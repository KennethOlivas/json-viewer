"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  parseLooseJSONValue,
  validateKeyName,
  validateKeysUnique,
  deepValidateJSON,
  getType,
} from "@/utils/json-validate";
import { type JSONValue } from "@/lib/json";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, ArrowUp, ArrowDown, SquarePen } from "lucide-react";
import { withViewTransition } from "@/utils/useModalAnimation";

export function ObjectEditModal({
  open,
  onOpenChangeAction,
  initialValue,
  onSaveAction,
  title,
  fieldKey,
  autoAddRowOnOpen,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  initialValue: Record<string, JSONValue> | JSONValue[];
  onSaveAction: (value: Record<string, JSONValue> | JSONValue[]) => void;
  title?: string;
  fieldKey?: string;
  autoAddRowOnOpen?: boolean;
}) {
  const isArray = Array.isArray(initialValue);
  const [rows, setRows] = useState<Array<{ key: string; value: string }>>([]);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedIdx, setNestedIdx] = useState<number | null>(null);
  const [nestedInit, setNestedInit] = useState<Record<string, JSONValue> | JSONValue[] | null>(null);
  const errors = useMemo(() => {
    // Compute per-row errors and overall ability to save
    const rowErrs = rows.map(() => ({ key: "" as string | null, value: "" as string | null }));
    if (!isArray) {
      // key presence and duplicates
      for (let i = 0; i < rows.length; i++) {
        const kErr = validateKeyName(rows[i].key);
        if (kErr) rowErrs[i].key = kErr;
      }
      const dupe = validateKeysUnique(rows);
      if (dupe) {
        // mark duplicates roughly by setting a general message on all (keeps UI simple)
        for (let i = 0; i < rowErrs.length; i++) rowErrs[i].key = rowErrs[i].key || dupe;
      }
    }
    // value parse errors
    for (let i = 0; i < rows.length; i++) {
      const res = parseLooseJSONValue(rows[i].value);
      if (!res.ok) rowErrs[i].value = res.error;
    }
    const hasErrors = rowErrs.some((e) => e.key || e.value);
    return { rowErrs, canSave: !hasErrors };
  }, [rows, isArray]);

  const computeRows = () => {
    if (isArray) {
      const arr = initialValue as JSONValue[];
      return arr.map((v, i) => ({ key: String(i), value: JSON.stringify(v) }));
    }
    const obj = initialValue as Record<string, JSONValue>;
    return Object.entries(obj).map(([k, v]) => ({ key: k, value: JSON.stringify(v) }));
  };

  const onAdd = () => {
    setRows((r) => [...r, { key: isArray ? String(r.length) : "", value: "null" }]);
  };
  const onRemove = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const onSaveInternal = () => {
    if (!errors.canSave) {
      return toast.warning("Please fix validation errors before saving");
    }
    // Parse values (guaranteed ok if canSave)
    const parsed: Array<{ key: string; value: JSONValue }> = [];
    for (const r of rows) {
      const p = parseLooseJSONValue(r.value);
      if (!p.ok) return toast.warning(p.error);
      parsed.push({ key: r.key.trim(), value: p.value });
    }

    // Build output
    let next: Record<string, JSONValue> | JSONValue[];
    if (isArray) {
      next = parsed.map((p) => p.value);
    } else {
      const obj: Record<string, JSONValue> = {};
      for (const { key, value } of parsed) obj[key] = value;
      next = obj;
    }

    const deepErr = deepValidateJSON(next as JSONValue);
    if (deepErr) return toast.warning(deepErr);

    onSaveAction(next);
    onOpenChangeAction(false);
    toast.success("Saved");
  };

  const startTransitionOpen = withViewTransition((v) => {
    if (v) {
      const base = computeRows();
      const next = autoAddRowOnOpen
        ? [...base, { key: isArray ? String(base.length) : "", value: "null" }]
        : base;
      setRows(next);
    }
    onOpenChangeAction(v);
  });

  return (
    <>
    <Dialog open={open} onOpenChange={startTransitionOpen}>
      <DialogContent className="sm:max-w-3xl w-[96vw] glass-panel">
        <DialogHeader>
          <DialogTitle>{title ?? (isArray ? "Edit Array" : `Edit ${fieldKey ?? "Object"}`)}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-auto pr-1">
          <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2">
            {rows.map((r, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.03 }}
                className="contents"
              >
                <Row
                  index={idx}
                  isArray={isArray}
                  row={r}
                  error={errors.rowErrs[idx]}
                  totalRows={rows.length}
                  onChange={(nr) =>
                    setRows((prev) => prev.map((p, i) => (i === idx ? nr : p)))
                  }
                  onRemove={() => onRemove(idx)}
                  onMoveUp={() =>
                    idx > 0 &&
                    setRows((prev) => {
                      const next = prev.slice();
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      return next;
                    })
                  }
                  onMoveDown={() =>
                    idx < rows.length - 1 &&
                    setRows((prev) => {
                      const next = prev.slice();
                      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                      return next;
                    })
                  }
                  onEditNested={() => {
                    try {
                      const parsed = JSON.parse(r.value) as JSONValue;
                      if (Array.isArray(parsed) || (parsed && typeof parsed === "object")) {
                        setNestedIdx(idx);
                        setNestedInit(parsed as Record<string, JSONValue> | JSONValue[]);
                        setNestedOpen(true);
                      }
                    } catch {}
                  }}
                />
              </motion.div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={onAdd} className="mt-3">
            <Plus className="h-4 w-4 mr-1" /> Add {isArray ? "item" : "field"}
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveInternal} disabled={!errors.canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {nestedOpen && nestedInit && nestedIdx !== null ? (
      <ObjectEditModal
        open={nestedOpen}
        onOpenChangeAction={setNestedOpen}
        initialValue={nestedInit as Record<string, JSONValue> | JSONValue[]}
        onSaveAction={(nv) => {
          setRows((prev) =>
            prev.map((row, i) => (i === nestedIdx ? { ...row, value: JSON.stringify(nv) } : row)),
          );
          setNestedOpen(false);
        }}
        title={"Edit nested"}
      />
    ) : null}
    </>
  );
}

function Row({
  isArray,
  row,
  onChange,
  onRemove,
  index,
  error,
  onMoveUp,
  onMoveDown,
  onEditNested,
  totalRows,
}: {
  isArray: boolean;
  index: number;
  row: { key: string; value: string };
  onChange: (row: { key: string; value: string }) => void;
  onRemove: () => void;
  error?: { key: string | null; value: string | null };
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditNested: () => void;
  totalRows: number;
}) {
  const type = useMemo(() => {
    try {
      return getType(JSON.parse(row.value) as JSONValue);
    } catch {
      return "string";
    }
  }, [row.value]);

  return (
    <>
      {!isArray ? (
        <div className="flex flex-col gap-1">
          <Input
            value={row.key}
            onChange={(e) => onChange({ ...row, key: e.target.value })}
            placeholder="Key"
            className={`glass-input ${error?.key ? "ring-1 ring-red-500/50" : ""}`}
          />
          {error?.key ? (
            <span className="text-xs text-red-500">{error.key}</span>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-mono w-14 text-right pr-1">{index}</div>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-1">
              <Input
                value={row.value}
                onChange={(e) => onChange({ ...row, value: e.target.value })}
                placeholder={isArray ? "Value" : "Value (JSON)"}
                className={`glass-input ${error?.value ? "ring-1 ring-red-500/50" : ""}`}
              />
              {error?.value ? (
                <span className="text-xs text-red-500">{error.value}</span>
              ) : null}
            </div>
          </TooltipTrigger>
          <TooltipContent className="glass-tooltip" side="top">
            Type: {type}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        {(type === "object" || type === "array") && (
          <Button variant="ghost" size="icon" onClick={onEditNested} title="Edit nested">
            <SquarePen className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onMoveUp} title="Move up" disabled={index === 0}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onMoveDown} title="Move down" disabled={index === totalRows - 1}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} title="Remove">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
