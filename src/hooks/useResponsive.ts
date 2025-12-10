// src/hooks/useResponsive.ts
import { useEffect, useMemo, useRef, useState } from "react";

export type Breakpoints = Record<"sm"|"md"|"lg"|"xl"|"2xl", number>;

/** Tailwind-like defaults */
const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/** Window size (SSR-safe) */
export function useWindowSize() {
  const get = () => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  });

  const [size, setSize] = useState(get);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setSize(get()));
    };

    window.addEventListener("resize", onResize, { passive: true });
    // initial sync in case of late mount
    onResize();

    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size; // { width, height }
}

/** Breakpoint helpers (defaults to Tailwind breakpoints) */
export function useBreakpoint(custom?: Partial<Breakpoints>) {
  const bps = useMemo(
    () => ({ ...defaultBreakpoints, ...(custom || {}) }),
    [custom]
  );

  const { width } = useWindowSize();

  const flags = useMemo(() => {
    const sm = width >= bps.sm;
    const md = width >= bps.md;
    const lg = width >= bps.lg;
    const xl = width >= bps.xl;
    const _2xl = width >= bps["2xl"];

    return {
      sm, md, lg, xl, "2xl": _2xl,
      // helpers
      up: (bp: keyof Breakpoints) => width >= bps[bp],
      down: (bp: keyof Breakpoints) => width < bps[bp],
      between: (min: keyof Breakpoints, max: keyof Breakpoints) =>
        width >= bps[min] && width < bps[max],
      width,
    };
  }, [width, bps]);

  return flags;
}
