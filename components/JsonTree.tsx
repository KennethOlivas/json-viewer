"use client";

import { type JSONValue } from "@/lib/json";
import { Tree, type TreeNodePath } from "@/components/tree-view/Tree";

export function JsonTree({
  value,
  onChangeAction,
}: {
  value: JSONValue;
  onChangeAction: (path: TreeNodePath, value: JSONValue) => void;
}) {
  return (
    <div className="font-mono text-sm">
      <Tree value={value} onChangeAction={onChangeAction} />
    </div>
  );
}
