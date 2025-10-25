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
import { clone, stableStringify, type JSONValue } from "@/lib/json";

export type Session = {
  id: string;
  name: string;
  data: JSONValue;
  createdAt: number;
  lastModified: number;
};

type State = {
  data: JSONValue | null;
  setData: (value: JSONValue) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  sessions: Session[];
  activeSessionId: string | null;
  dirty: boolean;
  saveSession: (name?: string) => void;
  restoreSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  duplicateSession: (id: string) => void;
  findDuplicateSessionId: (value: JSONValue) => string | null;
  createSessionWithData: (value: JSONValue, name?: string) => string | null;
  overwriteSessionData: (id: string, value: JSONValue) => void;
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    getItem<string | null>("activeSession", null),
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
      setSessions((prev) => {
        const now = Date.now();
        if (activeSessionId) {
          // Update existing active session
          const next = prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, data: clone(data), lastModified: now }
              : s,
          );
          setItem("sessions", next);
          return next;
        }
        // Create new session
        const session: Session = {
          id: crypto.randomUUID(),
          name: name || `Session ${new Date().toLocaleString()}`,
          data: clone(data),
          createdAt: now,
          lastModified: now,
        };
        const next = [session, ...prev].slice(0, 50);
        setItem("sessions", next);
        setActiveSessionId(session.id);
        setItem("activeSession", session.id);
        return next;
      });
    },
    [data, activeSessionId],
  );

  const createSessionWithData = useCallback(
    (value: JSONValue, name?: string) => {
      const now = Date.now();
      // clear history for a clean slate
      undoStack.current = [];
      redoStack.current = [];
      setHistoryCounts({ undo: 0, redo: 0 });
      setDataState(value);
      setItem("current", value);
      const session: Session = {
        id: crypto.randomUUID(),
        name: name || `Session ${new Date(now).toLocaleString()}`,
        data: clone(value),
        createdAt: now,
        lastModified: now,
      };
      setSessions((prev) => {
        const next = [session, ...prev].slice(0, 50);
        setItem("sessions", next);
        return next;
      });
      setActiveSessionId(session.id);
      setItem("activeSession", session.id);
      return session.id;
    },
    [],
  );

  const overwriteSessionData = useCallback((id: string, value: JSONValue) => {
    const now = Date.now();
    // update sessions list
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, data: clone(value), lastModified: now } : s,
      );
      setItem("sessions", next);
      return next;
    });
    // activate and set current data, clear history
    undoStack.current = [];
    redoStack.current = [];
    setHistoryCounts({ undo: 0, redo: 0 });
    setDataState(value);
    setItem("current", value);
    setActiveSessionId(id);
    setItem("activeSession", id);
  }, []);

  const restoreSession = useCallback(
    (id: string) => {
      const s = sessions.find((x) => x.id === id);
      if (s) {
        // Clear history
        undoStack.current = [];
        redoStack.current = [];
        setHistoryCounts({ undo: 0, redo: 0 });
        setData(s.data);
        setActiveSessionId(s.id);
        setItem("activeSession", s.id);
      }
    },
    [sessions, setData],
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((x) => x.id !== id);
        setItem("sessions", next);
        if (activeSessionId === id) {
          setActiveSessionId(null);
          setItem("activeSession", null as unknown as string);
          setDataState(null);
          setItem("current", null as unknown as JSONValue);
          // clear history when closing active
          undoStack.current = [];
          redoStack.current = [];
          setHistoryCounts({ undo: 0, redo: 0 });
        }
        return next;
      });
    },
    [activeSessionId],
  );

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, name } : s));
      setItem("sessions", next);
      return next;
    });
  }, []);

  const duplicateSession = useCallback(
    (id: string) => {
      const s = sessions.find((x) => x.id === id);
      if (!s) return;
      const now = Date.now();
      const copy: Session = {
        id: crypto.randomUUID(),
        name: `${s.name} (copy ${new Date(now).toLocaleString()})`,
        data: clone(s.data),
        createdAt: now,
        lastModified: now,
      };
      setSessions((prev) => {
        const next = [copy, ...prev].slice(0, 50);
        setItem("sessions", next);
        return next;
      });
    },
    [sessions],
  );

  const findDuplicateSessionId = useCallback(
    (value: JSONValue) => {
      const target = stableStringify(value, 0);
      for (const s of sessions) {
        if (stableStringify(s.data, 0) === target) return s.id;
      }
      return null;
    },
    [sessions],
  );

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId],
  );
  const dirty = useMemo(() => {
    if (!activeSession || data == null) return false;
    try {
      return (
        stableStringify(activeSession.data, 0) !== stableStringify(data, 0)
      );
    } catch {
      return true;
    }
  }, [activeSession, data]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        // Save to active session if exists
        if (data != null) saveSession();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, data, saveSession]);

  const value = useMemo<State>(
    () => ({
      data,
      setData,
      undo,
      redo,
      canUndo,
      canRedo,
      sessions,
      activeSessionId,
      dirty,
      saveSession,
      createSessionWithData,
      overwriteSessionData,
      restoreSession,
      deleteSession,
      renameSession,
      duplicateSession,
      findDuplicateSessionId,
    }),
    [
      data,
      setData,
      undo,
      redo,
      canUndo,
      canRedo,
      sessions,
      activeSessionId,
      dirty,
      saveSession,
      createSessionWithData,
      overwriteSessionData,
      restoreSession,
      deleteSession,
      renameSession,
      duplicateSession,
      findDuplicateSessionId,
    ],
  );

  return <JsonCtx.Provider value={value}>{children}</JsonCtx.Provider>;
}

export function useJson() {
  const ctx = useContext(JsonCtx);
  if (!ctx) throw new Error("useJson must be used within JsonProvider");
  return ctx;
}
