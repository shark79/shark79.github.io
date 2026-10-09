"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PHOTOS } from "@/lib/content";
import { openPhoto } from "@/components/ui/photo-lightbox";
import { SectionHead } from "@/components/ui/section-head";

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
    const gap = 16;
    const step = (frame?.offsetWidth ?? 200) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="gallery" className="py-28 sm:py-40">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-12">
        <SectionHead n="04" label="Gallery">
          Off the clock.
        </SectionHead>
      </div>

      <div className="relative mt-16 lg:mt-24">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 sm:scroll-px-12 sm:px-12"
        >
          {PHOTOS.map((file, i) => (
            <button
              key={file}
              type="button"
              data-gallery-frame
              onClick={() => openPhoto(file)}
              aria-label={`View photo ${i + 1} of ${PHOTOS.length}`}
              className="group relative aspect-[4/5] w-[72vw] shrink-0 snap-start overflow-hidden bg-soft sm:w-[300px] lg:w-[340px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 640px web copy, static export */}
              <img
                src={`/gallery/paintings/${file}`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover grayscale transition-[filter,transform] duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-visible:grayscale-0"
              />
              <span className="label absolute bottom-4 left-4 text-white opacity-0 mix-blend-difference transition-opacity duration-500 group-hover:opacity-100">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => scrollByOne(side === "left" ? -1 : 1)}
            disabled={side === "left" ? !canScrollLeft : !canScrollRight}
            aria-label={`Scroll gallery ${side}`}
            className={`glass absolute top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full transition-opacity disabled:pointer-events-none disabled:opacity-0 sm:flex ${side === "left" ? "left-4" : "right-4"}`}
          >
            {side === "left" ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        ))}
      </div>
    </section>
  );
}
