"use client";

import { useMemo } from "react";
import type { Node } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// JSON value helper types
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

function isPlainObject(v: unknown): v is Record<string, JSONValue> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isJSONArray(v: unknown): v is JSONValue[] {
  return Array.isArray(v);
}
function uniqueKey(base: string, obj: Record<string, JSONValue>) {
  let idx = 1;
  let k = base;
  while (Object.prototype.hasOwnProperty.call(obj, k)) {
    k = `${base}_${idx++}`;
  }
  return k;
}

function PrimitiveEditor({
  value,
  onChange,
}: {
  value: JSONValue;
  onChange: (v: JSONValue) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-xs text-muted-foreground">boolean</span>
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <Input
        type="number"
        value={Number.isFinite(value) ? String(value) : ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : Number(v));
        }}
      />
    );
  }
  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="null"
          value={""}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange("")}
          title="Convert null → empty string"
        >
          to &quot;&quot;
        </Button>
      </div>
    );
  }
  // string fallback
  return (
    <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
  );
}

function ArrayEditor({
  value,
  onChange,
}: {
  value: JSONValue[];
  onChange: (v: JSONValue[]) => void;
}) {
  const updateAt = (idx: number, next: JSONValue) => {
    const arr = value.slice();
    arr[idx] = next;
    onChange(arr);
  };
  const removeAt = (idx: number) => {
    const arr = value.slice();
    arr.splice(idx, 1);
    onChange(arr);
  };
  const addItem = () => {
    onChange([...value, ""]);
  };

  return (
    <div className="grid gap-2">
      {value.length === 0 ? (
        <div className="text-xs text-muted-foreground">Empty list</div>
      ) : null}
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            {isPlainObject(item) ? (
              <ObjectEditor
                value={item}
                onChange={(next) => updateAt(i, next)}
              />
            ) : isJSONArray(item) ? (
              <ArrayEditor
                value={item}
                onChange={(next) => updateAt(i, next)}
              />
            ) : (
              <PrimitiveEditor
                value={item}
                onChange={(next) => updateAt(i, next)}
              />
            )}
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeAt(i)}
            title="Delete item"
          >
            Delete
          </Button>
        </div>
      ))}
      <div>
        <Button size="sm" variant="outline" onClick={addItem}>
          Add item
        </Button>
      </div>
    </div>
  );
}

function ObjectEditor({
  value,
  onChange,
}: {
  value: Record<string, JSONValue>;
  onChange: (v: Record<string, JSONValue>) => void;
}) {
  const setKeyValue = (k: string, nextVal: JSONValue) => {
    const next = { ...value, [k]: nextVal };
    onChange(next);
  };
  const deleteKey = (k: string) => {
    const next = { ...value };
    delete next[k];
    onChange(next);
  };
  const renameKey = (oldK: string, newK: string) => {
    if (!newK || oldK === newK) return;
    if (Object.prototype.hasOwnProperty.call(value, newK)) return;
    const next = { ...value };
    next[newK] = next[oldK];
    delete next[oldK];
    onChange(next);
  };
  const addField = () => {
    const k = uniqueKey("field", value);
    onChange({ ...value, [k]: "" });
  };

  const entries = Object.entries(value);

  return (
    <div className="grid gap-3">
      {entries.length === 0 ? (
        <div className="text-xs text-muted-foreground">No fields</div>
      ) : null}
      {entries.map(([k, v]) => (
        <div key={k} className="rounded border p-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Key</span>
            <Input
              className="h-8"
              value={k}
              onChange={(e) => renameKey(k, e.target.value)}
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteKey(k)}
              title="Delete field"
            >
              Delete
            </Button>
          </div>
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">Value</div>
            {isPlainObject(v) ? (
              <ObjectEditor
                value={v}
                onChange={(next) => setKeyValue(k, next)}
              />
            ) : isJSONArray(v) ? (
              <ArrayEditor
                value={v}
                onChange={(next) => setKeyValue(k, next)}
              />
            ) : (
              <PrimitiveEditor
                value={v}
                onChange={(next) => setKeyValue(k, next)}
              />
            )}
          </div>
        </div>
      ))}
      <div>
        <Button size="sm" variant="outline" onClick={addField}>
          Add field
        </Button>
      </div>
    </div>
  );
}

export function NodeSidebar({
  node,
  onChangeAction,
  onDeleteAction,
  onDuplicateAction,
}: {
  node: Node | null;
  onChangeAction: (nodeId: string, data: Record<string, unknown>) => void;
  onDeleteAction: (nodeId: string) => void;
  onDuplicateAction: (nodeId: string) => void;
}) {
  const type = node?.type as string | undefined;
  const data = useMemo(
    () =>
      ((node?.data as Record<string, JSONValue>) || {}) as Record<
        string,
        JSONValue
      >,
    [node],
  );

  const body = useMemo(() => {
    if (!node)
      return (
        <div className="text-sm text-muted-foreground">No node selected</div>
      );
    const onRootChange = (next: Record<string, JSONValue>) => {
      // Adapter to expected signature (unknown)
      onChangeAction(node.id, next as unknown as Record<string, unknown>);
    };
    // Always show full data editor for the "card" node (and any type)
    return <ObjectEditor value={data} onChange={onRootChange} />;
  }, [node, data, onChangeAction]);

  return (
    <aside className="h-[calc(100vh-120px)] w-full border-l bg-background text-primary flex flex-col p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-xs text-muted-foreground truncate max-w-[16rem]">
            {node?.id ?? ""}
          </div>
          <div className="text-sm font-semibold">Node Editor</div>
        </div>
        {type ? <Badge variant="secondary">{type}</Badge> : null}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <div className="grid gap-4">{body}</div>
      </div>

      {/* Footer actions */}
      <div className="border-t px-4 py-3">
        {node ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteAction(node.id)}
            >
              Delete Node
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicateAction(node.id)}
            >
              Duplicate Node
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Select a node to edit
          </div>
        )}
      </div>
    </aside>
  );
}

export default NodeSidebar;
