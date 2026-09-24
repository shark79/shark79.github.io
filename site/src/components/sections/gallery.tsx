"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTOS, ROOMS } from "@/lib/content";
import { RoomShell } from "@/components/ui/room-shell";
import { openPaintingLightbox } from "@/components/ui/painting-lightbox";
import { cn } from "@/lib/utils";

const room = ROOMS.find((r) => r.id === "gallery")!;

const FRAMES = ["clay-blush", "clay-apricot", "clay-butter", "clay-cream"] as const;

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // A plain mouse wheel has no horizontal delta — translate vertical
    // scroll into horizontal movement (trackpads send deltaX and already
    // work natively).
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    let startScrollLeft: number | null = null;
    const updateArrowState = () => {
      if (startScrollLeft === null) startScrollLeft = track.scrollLeft;
      setCanScrollLeft(track.scrollLeft > startScrollLeft + 4);
      setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    };

    updateArrowState();
    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);
    return () => {
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
    };
  }, []);

  const scrollByOne = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const frame = track.querySelector<HTMLElement>("[data-gallery-frame]");
    const gap = 28;
    const step = (frame?.offsetWidth ?? 200) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <RoomShell room={room}>
      <div className="relative -mx-5 sm:-mx-8 lg:mx-0">
        {/* the cord the frames hang from */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-10 border-t border-dashed border-border sm:inset-x-8 lg:inset-x-0"
        />

        <div
          ref={trackRef}
          className="scrollbar-none flex gap-7 overflow-x-auto px-5 pt-10 pb-3 sm:px-8 lg:px-0"
        >
          {PHOTOS.map((file, i) => (
            <button
              key={file}
              type="button"
              data-gallery-frame
              onClick={() => openPaintingLightbox(file)}
              aria-label={`View photo ${i + 1} of ${PHOTOS.length}`}
              className="group relative shrink-0"
            >
              <span
                aria-hidden="true"
                className="absolute -top-[26px] left-1/2 h-[26px] w-px -translate-x-1/2 bg-border"
              />
              <span
                aria-hidden="true"
                className="clay-pin absolute -top-[31px] left-1/2 -translate-x-1/2"
              />
              <div
                className={cn(
                  "clay-sm clay-interactive rounded-[var(--radius-md)] p-2",
                  FRAMES[i % FRAMES.length],
                )}
              >
                <div className="relative aspect-[4/5] w-[58vw] max-w-[220px] overflow-hidden rounded-[16px] sm:w-[190px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 640px pre-sized painting texture, static export */}
                  <img
                    src={`/gallery/paintings/${file}`}
                    alt=""
                    loading="lazy"
                    className="gallery-img absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByOne(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll gallery left"
          className="clay-sm clay-interactive absolute top-[calc(50%+20px)] left-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground disabled:pointer-events-none disabled:opacity-0 sm:left-3"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByOne(1)}
          disabled={!canScrollRight}
          aria-label="Scroll gallery right"
          className="clay-sm clay-interactive absolute top-[calc(50%+20px)] right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground disabled:pointer-events-none disabled:opacity-0 sm:right-3"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </RoomShell>
  );
}
