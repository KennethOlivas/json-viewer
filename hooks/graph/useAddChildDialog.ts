"use client";

import { useCallback, useMemo, useState, startTransition } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";
import { useJson } from "@/providers/JsonProvider";
import { getAtPath, setAtPath, type JSONArray, type JSONObject, type JSONValue } from "@/lib/json-utils";
import { toast } from "sonner";

interface State {
  open: boolean;
  node?: GraphNode;
  keyText: string;
  valueText: string;
  error?: string;
}

export function useAddChildDialog() {
  const { data, setData } = useJson();
  const [state, setState] = useState<State>({ open: false, keyText: "", valueText: "" });

  const parentInfo = useMemo(() => {
    if (!state.node || !data) return { isObject: false, isArray: false };
    const v = getAtPath(data, state.node.path);
    return { isObject: !!v && typeof v === "object" && !Array.isArray(v), isArray: Array.isArray(v) };
  }, [data, state.node]);

  const openDialog = useCallback(
    (node: GraphNode) => {
      if (!data) return;
      const v = getAtPath(data, node.path);
      const isObj = v && typeof v === "object" && !Array.isArray(v);
      const isArr = Array.isArray(v);
      if (!isObj && !isArr) {
        toast("Add child is only available for objects/arrays");
        return;
      }
      setState({ open: true, node, keyText: "", valueText: "", error: undefined });
    },
    [data]
  );

  const closeDialog = useCallback(() => {
    setState({ open: false, node: undefined, keyText: "", valueText: "", error: undefined });
  }, []);

  const setKeyText = useCallback((k: string) => setState((s) => ({ ...s, keyText: k })), []);
  const setValueText = useCallback((v: string) => {
    try {
      JSON.parse(v);
      setState((s) => ({ ...s, valueText: v, error: undefined }));
    } catch (e) {
      setState((s) => ({ ...s, valueText: v, error: (e as Error).message }));
    }
  }, []);

  const applyChanges = useCallback(() => {
    const node = state.node;
    if (!node || !data) return;
    const cur = getAtPath(data, node.path);
    const isObj = cur && typeof cur === "object" && !Array.isArray(cur);
    const isArr = Array.isArray(cur);
    if (!isObj && !isArr) return;

    try {
      const val = JSON.parse(state.valueText) as JSONValue;
      if (isObj) {
        const key = state.keyText.trim();
        if (!key) {
          toast.error("Key is required for objects");
          return;
        }
        if ((cur as Record<string, unknown>)[key] !== undefined) {
          toast.error("Key already exists");
          return;
        }
        const newObj: JSONObject = { ...(cur as JSONObject), [key]: val };
        const updated = setAtPath(data, node.path, newObj as never);
        startTransition(() => setData(updated));
      } else if (isArr) {
        const newArr: JSONArray = [...(cur as JSONArray), val];
        const updated = setAtPath(data, node.path, newArr as never);
        startTransition(() => setData(updated));
      }
      toast.success("Child added");
      closeDialog();
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message }));
    }
  }, [data, setData, state.node, state.keyText, state.valueText, closeDialog]);

  return {
    ...state,
    isObjectParent: parentInfo.isObject,
    isArrayParent: parentInfo.isArray,
    openDialog,
    closeDialog,
    setKeyText,
    setValueText,
    applyChanges,
    isValid: !state.error,
  } as const;
}
