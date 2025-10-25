"use client";

import { useState } from "react";
import type { SavedTemplate } from "@/utils/localStorageTemplates";
import { getTemplates, deleteTemplate } from "@/utils/localStorageTemplates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TemplateList({
  onSelectAction,
}: {
  onSelectAction: (tpl: SavedTemplate) => void;
}) {
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => getTemplates());

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
            <li key={t.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                  <span className="mx-1">•</span>
                  <span>Updated: {new Date(t.lastModified).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onSelectAction(t)}>
                  Load
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
    </div>
  );
}

export default TemplateList;
