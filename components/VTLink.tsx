"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { startViewTransition } from "@/lib/view-transition";
import { type ReactNode, useCallback } from "react";

export function VTLink({ href, children, ...props }: LinkProps & { children: ReactNode; className?: string }) {
  const router = useRouter();
  const onClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>((e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    void startViewTransition(async () => {
      router.push(typeof href === "string" ? href : href.toString());
    });
  }, [router, href]);

  return (
    <Link href={href} {...props} onClick={onClick}>
      {children}
    </Link>
   );
}
