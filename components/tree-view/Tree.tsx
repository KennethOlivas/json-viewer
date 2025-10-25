"use client";

import { TreeNode, type TreeNodePath } from "./TreeNode";
export type { TreeNodePath } from "./TreeNode";
import { isObject, type JSONValue } from "@/lib/json";

export function Tree({
  value,
  onChangeAction,
  depth = 0,
}: {
  value: JSONValue;
  onChangeAction: (path: TreeNodePath, value: JSONValue) => void;
  depth?: number;
}) {
  if (!(isObject(value) || Array.isArray(value))) {
    return <div className="text-zinc-500">Root must be object or array</div>;
  }

  if (Array.isArray(value)) {
    return (
      <div>
        {value.map((v, i) => (
          <TreeNode
            key={i}
            k={i}
            v={v}
            path={[i]}
            index={i}
            depth={depth}
            onChangeAction={onChangeAction}
          >
            {isObject(v) || Array.isArray(v) ? (
              <Tree
                value={v}
                onChangeAction={(p, nv) => onChangeAction([i, ...p], nv)}
                depth={depth + 1}
              />
            ) : null}
          </TreeNode>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value as Record<string, JSONValue>);
  return (
    <div>
      {entries.map(([k, v], idx) => (
        <TreeNode
          key={k}
          k={k}
          v={v}
          path={[k]}
          index={idx}
          depth={depth}
          onChangeAction={onChangeAction}
        >
          {isObject(v) || Array.isArray(v) ? (
            <Tree
              value={v}
              onChangeAction={(p, nv) => onChangeAction([k, ...p], nv)}
              depth={depth + 1}
            />
          ) : null}
        </TreeNode>
      ))}
    </div>
  );
}
