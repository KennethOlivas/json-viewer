"use client";

import { useCallback, useState, startTransition } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";
import { useJson } from "@/providers/JsonProvider";
import { getAtPath, setAtPath } from "@/lib/json-utils";
import { toast } from "sonner";

interface State {
  open: boolean;
  node?: GraphNode;
  keyText: string;
}

export function useEditKeyDialog() {
  const { data, setData } = useJson();
  const [state, setState] = useState<State>({ open: false, keyText: "" });

  const openDialog = useCallback(
    (node: GraphNode) => {
      if (!data) return;
      if (node.path.length === 0) {
        toast("Cannot rename root");
        return;
      }
      const parentPath = node.path.slice(0, -1);
      const last = node.path[node.path.length - 1];
      const parent = getAtPath(data, parentPath);
      if (!parent || typeof parent !== "object" || Array.isArray(parent) || typeof last !== "string") {
        toast("Edit key is only available for object properties");
        return;
      }
      setState({ open: true, node, keyText: last });
    },
    [data]
  );

  const closeDialog = useCallback(() => {
    setState({ open: false, node: undefined, keyText: "" });
  }, []);

  const setKeyText = useCallback((k: string) => {
    setState((s) => ({ ...s, keyText: k }));
  }, []);

  const applyChanges = useCallback(() => {
    const node = state.node;
    if (!node || !data) return;
    const parentPath = node.path.slice(0, -1);
    const last = node.path[node.path.length - 1];
    const parent = getAtPath(data, parentPath) as Record<string, unknown>;
    if (!parent || typeof parent !== "object" || Array.isArray(parent) || typeof last !== "string") return;

    const newKey = state.keyText.trim();
    if (!newKey) {
      toast.error("Key cannot be empty");
      return;
    }
    if (Object.prototype.hasOwnProperty.call(parent, newKey) && newKey !== last) {
      toast.error("Key already exists");
      return;
    }
    const childVal = parent[last];
    const nextParent: Record<string, unknown> = { ...parent };
    delete nextParent[last];
    nextParent[newKey] = childVal;
    const next = setAtPath(data, parentPath, nextParent as never);
    startTransition(() => setData(next));
    toast.success("Key updated");
    closeDialog();
  }, [data, setData, state.node, state.keyText, closeDialog]);

  return {
    ...state,
    openDialog,
    closeDialog,
    setKeyText,
    applyChanges,
  } as const;
}
