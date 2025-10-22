"use client";

export function withViewTransition(handler: (open: boolean) => void) {
  return (open: boolean) => {
    const run = () => handler(open);
    const docVT = document as unknown as { startViewTransition?: (cb: () => void) => void };
    if (docVT && typeof docVT.startViewTransition === "function") {
      docVT.startViewTransition(run);
    } else {
      run();
    }
  };
}
