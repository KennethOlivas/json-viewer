"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Pencil, Check, X, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { isObject, type JSONValue } from "@/lib/json";
import { getType, parseLooseJSONValue } from "@/utils/json-validate";
import { ObjectEditModal } from "./ObjectEditModal";

export type TreeNodePath = Array<string | number>;

export function TreeNode({
  k,
  v,
  path,
  index,
  depth,
  onChangeAction,
  children,
}: {
  k: string | number;
  v: JSONValue;
  path: TreeNodePath;
  index: number;
  depth: number;
  onChangeAction: (path: TreeNodePath, value: JSONValue) => void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  const isObj = isObject(v) || Array.isArray(v);
  const dtype = useMemo(() => getType(v), [v]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const startEdit = () => {
    if (isObj) {
      setModalOpen(true);
      return;
    }
    setEditing(true);
    setEditValue(typeof v === "string" ? v : JSON.stringify(v));
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    const parsed = parseLooseJSONValue(editValue);
    if (!parsed.ok) return; // parseLoose always ok unless empty
    onChangeAction(path, parsed.value);
    setEditing(false);
  };

  const delay = index * 0.04 + depth * 0.02;

  return (
    <div className="pl-3">
      <motion.div
        className="group flex items-center gap-1 py-0.5 text-sm rounded-md hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay }}
      >
        {isObj ? (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="inline-block h-5 w-5" />
        )}
        <span className="font-mono text-xs text-muted-foreground">{String(k)}</span>
        {!editing ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate cursor-text select-text">
                    : {renderValue(v)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="glass-tooltip" side="top">
                  Type: {dtype}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              size="icon-sm"
              type="button"
              onClick={startEdit}
              className="ml-1 hidden rounded p-0 text-muted-foreground hover:bg-muted group-hover:inline-flex"
              title={isObj ? "Edit object" : "Edit"}
              variant="ghost"
            >
              {isObj ? (
                <SquarePen className="h-3.5 w-3.5" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
            </Button>
          </>
        ) : (
          <motion.span
            className="flex items-center gap-1"
            initial={{ scale: 0.98, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-64 glass-input"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={saveEdit}
              className="rounded p-1 hover:bg-secondary"
              title="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={cancelEdit}
              className="rounded p-1 hover:bg-secondary"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {isObj && open && (
          <motion.div
            key="children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="border-l pl-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {isObj && (
        <ObjectEditModal
          open={modalOpen}
          onOpenChangeAction={setModalOpen}
          initialValue={Array.isArray(v) ? (v as JSONValue[]) : (v as Record<string, JSONValue>)}
          onSaveAction={(nv) => onChangeAction(path, nv as JSONValue)}
          title={Array.isArray(v) ? "Edit Array" : `Edit ${String(k)}`}
        />
      )}
    </div>
  );
}

export function renderValue(v: JSONValue) {
  if (typeof v === "string")
    return (
      <span className="text-emerald-600 dark:text-emerald-400">&quot;{v}&quot;</span>
    );
  if (typeof v === "number")
    return <span className="text-blue-600 dark:text-blue-400">{String(v)}</span>;
  if (typeof v === "boolean")
    return (
      <span className="text-purple-600 dark:text-purple-400">{String(v)}</span>
    );
  if (v === null) return <span className="text-zinc-500">null</span>;
  if (Array.isArray(v)) return <span className="text-zinc-500">Array[{v.length}]</span>;
  return <span className="text-zinc-500">Object</span>;
}
