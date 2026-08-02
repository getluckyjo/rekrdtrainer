"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../useReducedMotion";

const DURATION = 220;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Tweens to a target over 220ms. Digits do not roll or slot-machine — that
 * reads as hype, and this page is trying to be believed, not admired.
 *
 * Snaps instantly when the user has asked for reduced motion, which is handled
 * by returning `target` directly rather than by scheduling anything.
 */
export function useTweenedNumber(target: number): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(target);
  const latestRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) return;

    const from = latestRef.current;
    if (from === target) return;

    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const next = t < 1 ? from + (target - from) * easeOutCubic(t) : target;
      latestRef.current = next;
      setValue(next);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, reduce]);

  if (reduce) return target;
  return value;
}
