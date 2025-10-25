"use client";

import { useState } from "react";
import { useJson, type Session } from "@/providers/JsonProvider";
import { Trash2, RotateCcw, Eye } from "lucide-react";
import { SessionPreviewDialog } from "@/components/sessions/SessionPreviewDialog";

export default function SessionsPage() {
  const { sessions, restoreSession, deleteSession } = useJson();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Sessions</h1>
      <ul className="space-y-2">
        {sessions.length === 0 && (
          <li className="text-muted-foreground">No sessions yet.</li>
        )}
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-secondary"
                onClick={() => {
                  setSelected(s);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="mr-1 inline-block h-4 w-4" /> Preview
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-secondary"
                onClick={() => restoreSession(s.id)}
              >
                <RotateCcw className="mr-1 inline-block h-4 w-4" /> Restore
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-secondary"
                onClick={() => deleteSession(s.id)}
              >
                <Trash2 className="mr-1 inline-block h-4 w-4" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <SessionPreviewDialog
        open={previewOpen}
        onOpenChangeAction={(o) => {
          setPreviewOpen(o);
          if (!o) setSelected(null);
        }}
        session={selected}
      />
    </div>
  );
}
