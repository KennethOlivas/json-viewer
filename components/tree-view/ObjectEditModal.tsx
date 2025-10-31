"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, ArrowUp, ArrowDown, SquarePen } from "lucide-react";
import { withViewTransition } from "@/utils/useModalAnimation";
import { Label } from "@/components/ui/label";

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
  const [justAddedIndex, setJustAddedIndex] = useState<number | null>(null);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedIdx, setNestedIdx] = useState<number | null>(null);
  const [nestedInit, setNestedInit] = useState<
    Record<string, JSONValue> | JSONValue[] | null
  >(null);
  // Maintain a flat ordered list of input refs for keyboard navigation
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const registerInput = (
    idx: number,
    part: "key" | "value",
    el: HTMLInputElement | null,
    isArrayLocal: boolean,
  ) => {
    if (!el) return;
    // For objects, order is key then value per row; for arrays, only value per row
    const flatIndex = isArrayLocal ? idx : idx * 2 + (part === "value" ? 1 : 0);
    inputRefs.current[flatIndex] = el;
  };
  const errors = useMemo(() => {
    // Compute per-row errors and overall ability to save
    const rowErrs = rows.map(() => ({
      key: "" as string | null,
      value: "" as string | null,
    }));
    if (!isArray) {
      // key presence and duplicates
      for (let i = 0; i < rows.length; i++) {
        const kErr = validateKeyName(rows[i].key);
        if (kErr) rowErrs[i].key = kErr;
      }
      const dupe = validateKeysUnique(rows);
      if (dupe) {
        // mark duplicates roughly by setting a general message on all (keeps UI simple)
        for (let i = 0; i < rowErrs.length; i++)
          rowErrs[i].key = rowErrs[i].key || dupe;
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
    return Object.entries(obj).map(([k, v]) => ({
      key: k,
      value: JSON.stringify(v),
    }));
  };

  const onAdd = () => {
    setRows((r) => [
      ...r,
      { key: isArray ? String(r.length) : "", value: "null" },
    ]);
    setJustAddedIndex(rows.length);
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
    onOpenChangeAction(v);
  });

  // Ensure rows are populated whenever the modal opens or the initial value changes
  useEffect(() => {
    if (!open) return;
    const base = computeRows();
    const next = autoAddRowOnOpen
      ? [...base, { key: isArray ? String(base.length) : "", value: "null" }]
      : base;
    setRows(next);
    setJustAddedIndex(autoAddRowOnOpen ? next.length - 1 : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  // Auto-focus behavior when adding a new row or opening with auto-add
  useEffect(() => {
    if (justAddedIndex === null) return;
    const isObject = !isArray;
    // Compute target ref index
    const targetFlatIndex = isObject ? justAddedIndex * 2 : justAddedIndex;
    const el = inputRefs.current[targetFlatIndex];
    if (el && typeof el.focus === "function") {
      // delay to ensure element is mounted
      setTimeout(() => el.focus(), 0);
    }
    setJustAddedIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  return (
    <>
      <Dialog open={open} onOpenChange={startTransitionOpen}>
        <DialogContent className="sm:max-w-3xl w-[96vw] glass-panel">
          <DialogHeader>
            <DialogTitle>
              {title ??
                (isArray ? "Edit Array" : `Edit ${fieldKey ?? "Object"}`)}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-auto pr-1">
            {!isArray ? (
              <div className="sticky top-0 z-10  backdrop-blur p-2 bg-background/20 mb-2 rounded-lg">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Key
                  </Label>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs text-muted-foreground font-semibold">
                      Value
                    </Label>
                    <Button variant="ghost" size="sm" onClick={onAdd}>
                      <Plus className="h-4 w-4 mr-1" /> Add field
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            <div
              className={`grid ${isArray ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-2"} items-center gap-2`}
            >
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
                    registerInput={registerInput}
                    onKeySubmit={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (errors.canSave) onSaveInternal();
                        return;
                      }
                      if (e.key === "Enter") {
                        e.preventDefault();
                        // Find current element in refs and move to next
                        const flat = inputRefs.current;
                        const currentIndex = flat.findIndex(
                          (el) => el === e.currentTarget,
                        );
                        if (currentIndex >= 0) {
                          const next = flat[currentIndex + 1];
                          if (next) next.focus();
                        }
                      }
                    }}
                    onChange={(nr) =>
                      setRows((prev) =>
                        prev.map((p, i) => (i === idx ? nr : p)),
                      )
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
                        if (
                          Array.isArray(parsed) ||
                          (parsed && typeof parsed === "object")
                        ) {
                          setNestedIdx(idx);
                          setNestedInit(
                            parsed as Record<string, JSONValue> | JSONValue[],
                          );
                          setNestedOpen(true);
                        }
                      } catch {}
                    }}
                  />
                </motion.div>
              ))}
            </div>
            {isArray ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAdd}
                className="mt-3"
              >
                <Plus className="h-4 w-4 mr-1" /> Add item
              </Button>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveInternal} disabled={!errors.canSave}>
              Save
            </Button>
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
              prev.map((row, i) =>
                i === nestedIdx ? { ...row, value: JSON.stringify(nv) } : row,
              ),
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
  registerInput,
  onKeySubmit,
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
  registerInput: (
    idx: number,
    part: "key" | "value",
    el: HTMLInputElement | null,
    isArrayLocal: boolean,
  ) => void;
  onKeySubmit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
            onKeyDown={onKeySubmit}
            ref={(el) => registerInput(index, "key", el, false)}
            placeholder="Key"
            className={`glass-input ${error?.key ? "ring-1 ring-red-500/50" : ""}`}
          />
          {error?.key ? (
            <span className="text-xs text-red-500">{error.key}</span>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-mono w-14 text-right pr-1">
          {index}
        </div>
      )}
      {isArray ? (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col gap-1">
                  <Input
                    value={row.value}
                    onChange={(e) =>
                      onChange({ ...row, value: e.target.value })
                    }
                    onKeyDown={onKeySubmit}
                    ref={(el) => registerInput(index, "value", el, isArray)}
                    placeholder="Value"
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
        </>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    value={row.value}
                    onChange={(e) =>
                      onChange({ ...row, value: e.target.value })
                    }
                    onKeyDown={onKeySubmit}
                    ref={(el) => registerInput(index, "value", el, isArray)}
                    placeholder="Value (JSON)"
                    className={`glass-input flex-1 ${error?.value ? "ring-1 ring-red-500/50" : ""}`}
                  />
                  {(type === "object" || type === "array") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEditNested}
                      title="Edit nested"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMoveUp}
                    title="Move up"
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMoveDown}
                    title="Move down"
                    disabled={index === totalRows - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
      )}
      {isArray ? (
        <div className="flex items-center justify-end gap-1">
          {(type === "object" || type === "array") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditNested}
              title="Edit nested"
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            title="Move up"
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            title="Move down"
            disabled={index === totalRows - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} title="Remove">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </>
  );
}
