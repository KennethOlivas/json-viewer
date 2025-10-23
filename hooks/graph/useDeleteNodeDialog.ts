"use client";

import { useCallback, useState, startTransition } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";
import { useJson } from "@/providers/JsonProvider";
import { deleteAtPath } from "@/lib/json-utils";
import { toast } from "sonner";

interface State {
  open: boolean;
  node?: GraphNode;
}

export function useDeleteNodeDialog() {
  const { data, setData } = useJson();
  const [state, setState] = useState<State>({ open: false });

  const openDialog = useCallback((node: GraphNode) => {
    setState({ open: true, node });
  }, []);

  const closeDialog = useCallback(() => setState({ open: false, node: undefined }), []);

  const confirmDelete = useCallback(() => {
    const node = state.node;
    if (!node || !data) return;
    if (node.path.length === 0) {
      toast("Cannot delete root");
      return;
    }
    const next = deleteAtPath(data, node.path);
    startTransition(() => setData(next));
    toast.success("Node deleted");
    closeDialog();
  }, [data, setData, state.node, closeDialog]);

  return {
    ...state,
    openDialog,
    closeDialog,
    confirmDelete,
  } as const;
}
