"use client";

import { type ComponentPropsWithoutRef, type ToggleEvent, useRef } from "react";

type AutoScrollDetailsProps = ComponentPropsWithoutRef<"details"> & {
  scrollOffset?: number;
};

export function AutoScrollDetails({
  children,
  onToggle,
  scrollOffset = 190,
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
