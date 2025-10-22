"use client";

import { useState, useCallback } from "react";
import { isObject, type JSONValue } from "@/lib/json";
import { ChevronRight, ChevronDown, Pencil, Check, X } from "lucide-react";

export type TreeNodePath = Array<string | number>;

function Node({
  k,
  v,
  path,
  onChangeAction,
}: {
  k: string | number;
  v: JSONValue;
  path: TreeNodePath;
  onChangeAction: (path: TreeNodePath, value: JSONValue) => void;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");

  const isObj = isObject(v) || Array.isArray(v);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const startEdit = () => {
    setEditing(true);
    setEditValue(typeof v === "string" ? v : JSON.stringify(v));
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    let newV: JSONValue = editValue;
    try {
      newV = JSON.parse(editValue);
    } catch {
      // keep string
    }
    onChangeAction(path, newV);
    setEditing(false);
  };

  return (
    <div className="pl-3">
      <div className="group flex items-center gap-1 py-0.5 text-sm">
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
        <span className="font-mono text-xs text-muted-foreground">
          {String(k)}
        </span>
        {!editing ? (
          <>
            <span className="truncate">: {renderValue(v)}</span>
            <button
              type="button"
              onClick={startEdit}
              className="ml-1 hidden rounded p-1 text-muted-foreground hover:bg-muted group-hover:inline-flex"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-64 rounded border bg-background px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={saveEdit}
              className="rounded p-1 hover:bg-secondary"
              title="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded p-1 hover:bg-secondary"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>
      {isObj && open && (
        <div className="border-l pl-3">
          {Array.isArray(v)
            ? v.map((vv, idx) => (
                <Node
                  key={idx}
                  k={idx}
                  v={vv}
                  path={[...path, idx]}
                  onChangeAction={onChangeAction}
                />
              ))
            : Object.entries(v as Record<string, JSONValue>).map(([kk, vv]) => (
                <Node
                  key={kk}
                  k={kk}
                  v={vv}
                  path={[...path, kk]}
                  onChangeAction={onChangeAction}
                />
              ))}
        </div>
      )}
    </div>
  );
}

function renderValue(v: JSONValue) {
  if (typeof v === "string")
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        &quot;{v}&quot;
      </span>
    );
  if (typeof v === "number")
    return (
      <span className="text-blue-600 dark:text-blue-400">{String(v)}</span>
    );
  if (typeof v === "boolean")
    return (
      <span className="text-purple-600 dark:text-purple-400">{String(v)}</span>
    );
  if (v === null) return <span className="text-zinc-500">null</span>;
  if (Array.isArray(v))
    return <span className="text-zinc-500">Array[{v.length}]</span>;
  return <span className="text-zinc-500">Object</span>;
}

export function JsonTree({
  value,
  onChangeAction,
}: {
  value: JSONValue;
  onChangeAction: (path: TreeNodePath, value: JSONValue) => void;
}) {
  return (
    <div className="font-mono text-sm">
      {isObject(value) || Array.isArray(value) ? (
        Array.isArray(value) ? (
          value.map((v, i) => (
            <Node
              key={i}
              k={i}
              v={v}
              path={[i]}
              onChangeAction={onChangeAction}
            />
          ))
        ) : (
          Object.entries(value).map(([k, v]) => (
            <Node
              key={k}
              k={k}
              v={v}
              path={[k]}
              onChangeAction={onChangeAction}
            />
          ))
        )
      ) : (
        <div className="text-zinc-500">Root must be object or array</div>
      )}
    </div>
  );
}
