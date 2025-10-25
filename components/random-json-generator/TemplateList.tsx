"use client";

import { useState } from "react";
import type { SavedTemplate } from "@/utils/localStorageTemplates";
import {
  getTemplates,
  deleteTemplate,
  updateTemplate,
} from "@/utils/localStorageTemplates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function TemplateList({
  onSelectAction,
}: {
  onSelectAction: (tpl: SavedTemplate) => void;
}) {
  const [templates, setTemplates] = useState<SavedTemplate[]>(() =>
    getTemplates(),
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<SavedTemplate | null>(null);
  const [renameName, setRenameName] = useState("");

  const refresh = () => {
    const list = getTemplates();
    setTemplates(list);
  };

  // initial list is loaded via state initializer above

  return (
    <div className="grid gap-2">
      {templates.length === 0 ? (
        <div className="text-sm text-muted-foreground">No saved templates.</div>
      ) : (
        <ul className="grid gap-2">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                  <span className="mx-1">•</span>
                  <span>
                    Updated: {new Date(t.lastModified).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectAction(t)}
                >
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setRenameTarget(t);
                    setRenameName(t.name);
                    setRenameOpen(true);
                  }}
                >
                  Rename
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    deleteTemplate(t.id);
                    toast.success("Template deleted");
                    refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename template</DialogTitle>
            <DialogDescription>Update the template name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Input
              placeholder="Template name"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const n = renameName.trim();
                if (!n || !renameTarget) return;
                const updated = updateTemplate(renameTarget.id, { name: n });
                if (updated) {
                  toast.success("Template renamed");
                  setRenameOpen(false);
                  setRenameTarget(null);
                  refresh();
                } else {
                  toast.error("Failed to rename");
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateList;
