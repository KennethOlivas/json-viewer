"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getItem, setItem } from "@/lib/storage";
import { clone, type JSONValue } from "@/lib/json";

export type Session = {
  id: string;
  name: string;
  data: JSONValue;
  createdAt: number;
};

type State = {
  data: JSONValue | null;
  setData: (value: JSONValue) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  sessions: Session[];
  saveSession: (name?: string) => void;
  restoreSession: (id: string) => void;
  deleteSession: (id: string) => void;
};

const JsonCtx = createContext<State | null>(null);

const HISTORY_LIMIT = 50;

export function JsonProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<JSONValue | null>(() =>
    getItem<JSONValue | null>("current", null),
  );
  const [sessions, setSessions] = useState<Session[]>(() =>
    getItem<Session[]>("sessions", []),
  );

  const undoStack = useRef<JSONValue[]>([]);
  const redoStack = useRef<JSONValue[]>([]);
  const [historyCounts, setHistoryCounts] = useState({ undo: 0, redo: 0 });

  const setData = useCallback(
    (value: JSONValue) => {
      if (data !== null) {
        undoStack.current.push(clone(data));
        if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
        redoStack.current = [];
      }
      setDataState(value);
      setItem("current", value);
      setHistoryCounts({
        undo: undoStack.current.length,
        redo: redoStack.current.length,
      });
    },
    [data],
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (prev !== undefined) {
      if (data !== null) redoStack.current.push(clone(data));
      setDataState(prev);
      setItem("current", prev);
      setHistoryCounts({
        undo: undoStack.current.length,
        redo: redoStack.current.length,
      });
    }
  }, [data]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (next !== undefined) {
      if (data !== null) undoStack.current.push(clone(data));
      setDataState(next);
      setItem("current", next);
      setHistoryCounts({
        undo: undoStack.current.length,
        redo: redoStack.current.length,
      });
    }
  }, [data]);
  const canUndo = historyCounts.undo > 0;
  const canRedo = historyCounts.redo > 0;

  const saveSession = useCallback(
    (name?: string) => {
      if (data == null) return;
      const session: Session = {
        id: crypto.randomUUID(),
        name: name || `Session ${new Date().toLocaleString()}`,
        data: clone(data),
        createdAt: Date.now(),
      };
      setSessions((prev) => {
        const next = [session, ...prev].slice(0, 50);
        setItem("sessions", next);
        return next;
      });
    },
    [data],
  );

  const restoreSession = useCallback(
    (id: string) => {
      const s = sessions.find((x) => x.id === id);
      if (s) setData(s.data);
    },
    [sessions, setData],
  );

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((x) => x.id !== id);
      setItem("sessions", next);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const value = useMemo<State>(
    () => ({
      data,
      setData,
      undo,
      redo,
      canUndo,
      canRedo,
      sessions,
      saveSession,
      restoreSession,
      deleteSession,
    }),
    [
      data,
      setData,
      undo,
      redo,
      canUndo,
      canRedo,
      sessions,
      saveSession,
      restoreSession,
      deleteSession,
    ],
  );

  return <JsonCtx.Provider value={value}>{children}</JsonCtx.Provider>;
}

export function useJson() {
  const ctx = useContext(JsonCtx);
  if (!ctx) throw new Error("useJson must be used within JsonProvider");
  return ctx;
}
