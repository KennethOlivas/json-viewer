"use client";

import React, { memo } from "react";
import { Textarea } from "@/components/ui/textarea";

export function TemplateEditor({
  text,
  onTextChangeAction,
}: {
  text: string;
  onTextChangeAction: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Textarea
        className="min-h-48 font-mono text-xs"
        value={text}
        onChange={(e) => onTextChangeAction(e.target.value)}
      />
    </div>
  );
}
export default memo(TemplateEditor);
