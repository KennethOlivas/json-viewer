"use client";

import { useCallback, useState } from "react";
import type { GraphNode } from "@/components/graph/GraphCanvas";

export interface LinkState {
  active: boolean;
  source?: GraphNode;
}

export interface ExtraLink {
  source: string;
  target: string;
}

export function useGraphLinks() {
  const [linkMode, setLinkMode] = useState<LinkState>({ active: false });
  const [extraLinks, setExtraLinks] = useState<ExtraLink[]>([]);

  const startLinkMode = useCallback((node?: GraphNode) => {
    if (!node) return;
    setLinkMode({ active: true, source: node });
  }, []);

  const cancelLinkMode = useCallback(() => setLinkMode({ active: false }), []);

  const pickLinkTarget = useCallback(
    (node?: GraphNode) => {
      const src = linkMode.source;
      if (!linkMode.active || !src || !node) return;
      if (node.id === src.id) {
        setLinkMode({ active: false });
        return;
      }
      setExtraLinks((prev) => {
        const exists = prev.some(
          (l) =>
            (l.source === src.id && l.target === node.id) ||
            (l.source === node.id && l.target === src.id)
        );
        if (exists) return prev;
        return [...prev, { source: src.id, target: node.id }];
      });
      setLinkMode({ active: false });
    },
    [linkMode]
  );

  return {
    linkMode,
    extraLinks,
    setExtraLinks, // exposed for completeness if needed
    startLinkMode,
    cancelLinkMode,
    pickLinkTarget,
  } as const;
}
