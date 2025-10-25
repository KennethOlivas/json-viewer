"use client";

import { useCallback, useState, startTransition } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";
import { useJson } from "@/providers/JsonProvider";
import { getAtPath, setAtPath } from "@/lib/json-utils";
import { toast } from "sonner";

interface State {
  open: boolean;
  node?: GraphNode;
  text: string;
  error?: string;
}

export function useEditValueDialog() {
  const { data, setData } = useJson();
  const [state, setState] = useState<State>({ open: false, text: "" });

  const openDialog = useCallback(
    (node: GraphNode) => {
      if (!data) return;
      const v = getAtPath(data, node.path);
      const text =
        typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v, null, 2);
      setState({ open: true, node, text });
    },
    [data],
  );

  const closeDialog = useCallback(() => {
    setState({ open: false, node: undefined, text: "" });
  }, []);

  const setText = useCallback((t: string) => {
    try {
      JSON.parse(t);
      setState((s) => ({ ...s, text: t, error: undefined }));
    } catch (e) {
      setState((s) => ({ ...s, text: t, error: (e as Error).message }));
    }
  }, []);

  const applyChanges = useCallback(() => {
    if (!state.node || !data) return;
    try {
      const newVal = JSON.parse(state.text);
      const next = setAtPath(data, state.node.path, newVal as never);
      startTransition(() => setData(next));
      toast.success("Value updated");
      closeDialog();
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message }));
    }
  }, [data, setData, state.node, state.text, closeDialog]);

  return {
    ...state,
    setText,
    openDialog,
    closeDialog,
    applyChanges,
    isValid: !state.error,
  } as const;
}
