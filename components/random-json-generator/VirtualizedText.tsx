"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function VirtualizedText({
  text,
  lineHeight = 18,
  overscan = 200,
  className,
}: {
  text: string;
  lineHeight?: number;
  overscan?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeight(el.clientHeight);
    });
    ro.observe(el);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const lines = useMemo(() => (text ? text.split("\n") : []), [text]);
  const totalHeight = lines.length * lineHeight;
  const startIndex = clamp(Math.floor(scrollTop / lineHeight) - overscan, 0, Math.max(0, lines.length - 1));
  const endIndex = clamp(Math.ceil((scrollTop + height) / lineHeight) + overscan, 0, lines.length);
  const slice = lines.slice(startIndex, endIndex);
  const offsetY = startIndex * lineHeight;

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={
        "relative h-full w-full overflow-auto rounded border bg-background/50 p-3 " + (className ?? "")
      }
      role="region"
      aria-label="Virtualized output"
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <pre
            className="whitespace-pre font-mono text-xs"
            style={{ lineHeight: `${lineHeight}px` }}
          >
            {slice.map((line, i) => (
              <React.Fragment key={startIndex + i}>
                {line}
                {i < slice.length - 1 ? "\n" : ""}
              </React.Fragment>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default memo(VirtualizedText);
