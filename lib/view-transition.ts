export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export async function startViewTransition<T>(cb: () => T | Promise<T>): Promise<T> {
  if (supportsViewTransitions()) {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    doc.startViewTransition?.(() => {
      void cb();
    });
    return await cb();
  }
  return await cb();
}
