"use client";

import { type ComponentPropsWithoutRef, type ToggleEvent, useRef } from "react";

type AutoScrollDetailsProps = ComponentPropsWithoutRef<"details"> & {
  scrollOffset?: number;
};

export function AutoScrollDetails({
  children,
  onToggle,
  /* How far above the opened row to stop — enough to clear the sticky bar, and
     no more. Set generously it works against itself: `Math.max(0, …)` clamps
     the target, so for any row near the top of the document the page scrolls to
     the very top instead and the row the reader just opened ends up below the
     fold. */
  scrollOffset = 120,
  ...props
}: AutoScrollDetailsProps) {
  const animationFrameRef = useRef<number | null>(null);

  function handleToggle(event: ToggleEvent<HTMLDetailsElement>) {
    onToggle?.(event);

    const details = event.currentTarget;
    if (!details.open) return;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      const top = details.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(0, top - scrollOffset),
        behavior: "smooth",
      });
    });
  }

  return (
    <details {...props} onToggle={handleToggle}>
      {children}
    </details>
  );
}
