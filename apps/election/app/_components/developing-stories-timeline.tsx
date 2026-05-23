"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

export type DevelopingStoryTimelineItem = {
  id: string;
  headline: string;
  deck: string;
  statusLabel: string;
  showStatus: boolean;
  tagsLabel?: string;
  yearLabel: string;
  dateLabel: string;
};

function DevelopingStoryCard({ story }: { story: DevelopingStoryTimelineItem }) {
  return (
    <div>
      <p className="eyebrow text-[9px]">
        {story.showStatus ? story.statusLabel : "Developing story"}
      </p>
      <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-[-0.025em]">
        {story.headline}
      </h3>
      <p className="mt-2 line-clamp-4 text-xs leading-snug text-[var(--ink-2)]">
        {story.deck}
      </p>
      {story.tagsLabel ? (
        <p className="mt-3 font-mono text-[8px] font-semibold uppercase leading-snug tracking-[0.08em] text-[var(--ink-3)]">
          {story.tagsLabel}
        </p>
      ) : null}
    </div>
  );
}

export function DevelopingStoriesTimeline({
  stories,
}: {
  stories: DevelopingStoryTimelineItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  const updateThumb = () => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const overflow = scroller.scrollWidth - scroller.clientWidth;
    const width =
      overflow <= 0 ? 100 : (scroller.clientWidth / scroller.scrollWidth) * 100;
    const left = overflow <= 0 ? 0 : (scroller.scrollLeft / overflow) * (100 - width);

    setThumb({ left, width });
  };

  const revealIndicator = () => {
    setIsScrolling(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 900);
  };

  const startDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    };
    scroller.setPointerCapture(event.pointerId);
    setIsDragging(true);
    revealIndicator();
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;

    if (!scroller || !dragRef.current.active) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.startX;
    scroller.scrollLeft = dragRef.current.scrollLeft - deltaX;
    updateThumb();
    revealIndicator();
    event.preventDefault();
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;

    dragRef.current.active = false;
    setIsDragging(false);

    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    updateThumb();

    const scroller = scrollerRef.current;
    if (!scroller) {
      return undefined;
    }

    const handleScroll = () => {
      updateThumb();
      revealIndicator();
    };

    const handleResize = () => updateThumb();

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mt-12 w-full">
      <div
        ref={scrollerRef}
        className={`overflow-x-auto pb-2 pl-6 pr-3 select-none sm:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] sm:pr-8 timeline-scroll ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        aria-label="Developing stories timeline"
        tabIndex={0}
        onWheel={revealIndicator}
        onPointerDown={startDragging}
        onPointerMove={drag}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={() => {
          dragRef.current.active = false;
          setIsDragging(false);
        }}
        onTouchStart={revealIndicator}
      >
        <div className="relative flex min-w-max snap-x snap-mandatory py-4 pr-3 sm:pr-8">
          {stories.map((story, index) => {
            const isTop = index % 2 === 0;

            return (
              <article
                key={story.id}
                className="relative h-[28rem] w-[16rem] shrink-0 snap-start px-4 sm:h-[30rem] sm:w-[18rem]"
              >
                <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--ink)]" />
                <div className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--paper-2)] bg-[var(--accent)]" />
                <div
                  className={`absolute left-1/2 h-14 w-px -translate-x-1/2 bg-[var(--rule)] ${
                    isTop ? "bottom-1/2 mb-2" : "top-1/2 mt-2"
                  }`}
                  aria-hidden="true"
                />
                <p
                  className={`absolute left-1/2 -translate-x-1/2 font-mono text-3xl font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)] ${
                    isTop ? "top-[calc(50%+1.25rem)]" : "bottom-[calc(50%+1.25rem)]"
                  }`}
                >
                  {story.yearLabel}
                </p>
                <p
                  className={`absolute left-1/2 w-36 -translate-x-1/2 text-center font-mono text-[8px] font-bold uppercase leading-snug tracking-[0.12em] text-[var(--ink-3)] ${
                    isTop ? "top-[calc(50%+4.25rem)]" : "bottom-[calc(50%+4.25rem)]"
                  }`}
                >
                  {story.dateLabel}
                </p>
                <div className={`absolute left-4 right-4 ${isTop ? "top-0" : "bottom-0"}`}>
                  <DevelopingStoryCard story={story} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div
        className={`relative mt-4 h-px bg-[var(--rule)] transition-opacity duration-200 ${
          isScrolling ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 bg-[var(--ink)]"
          style={{
            left: `${thumb.left}%`,
            width: `${thumb.width}%`,
          }}
        />
      </div>
    </div>
  );
}
