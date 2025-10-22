"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 p-2 backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarButton({
  children,
  onClickAction,
  title,
}: {
  children: ReactNode;
  onClickAction?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      title={title}
      className="inline-flex items-center gap-2 rounded border px-3 py-1 text-sm hover:bg-secondary"
    >
      {children}
    </button>
  );
}
