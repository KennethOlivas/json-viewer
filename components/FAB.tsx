"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export function FAB({
  children,
  onPressAction,
  className,
}: {
  children: ReactNode;
  onPressAction?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onPressAction}
      className={clsx(
        "fixed bottom-20 right-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-lg transition hover:shadow-xl focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </button>
  );
}
