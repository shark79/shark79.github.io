"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PHOTOS = [
  "IMG_0148.jpg",
  "IMG_0150.jpg",
  "IMG_0158.jpg",
  "IMG_0161.jpg",
  "IMG_0170.jpg",
  "IMG_0249.jpg",
  "IMG_0369.jpg",
  "IMG_0722.jpg",
  "IMG_1234.jpg",
  "IMG_1369.jpg",
  "IMG_2609.jpg",
  "IMG_3560.jpg",
  "IMG_4732.jpg",
];

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // React's synthetic onWheel is passive by default, so preventDefault()
    // inside it throws. A plain mouse wheel has no horizontal delta, so
    // this translates vertical scroll into horizontal movement for mouse
    // users (trackpads already send deltaX and keep working natively).
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    // scroll-snap-align combined with the track's own side padding means
    // the natural "resting" scrollLeft at the very first photo isn't 0 —
    // it settles at roughly the padding width. Capture that as the real
    // baseline instead of assuming 0, so the left arrow correctly starts
    // disabled.
    let startScrollLeft: number | null = null;

    const updateArrowState = () => {
      if (startScrollLeft === null) startScrollLeft = track.scrollLeft;
      setCanScrollLeft(track.scrollLeft > startScrollLeft + 4);
      setCanScrollRight(
        track.scrollLeft < track.scrollWidth - track.clientWidth - 4
      );
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
    const tile = track.querySelector<HTMLElement>("[data-gallery-tile]");
    const gap = 16; // matches gap-4
    const step = (tile?.offsetWidth ?? 320) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="gallery" className="border-b border-border py-24">
      <div className="mx-auto mb-12 max-w-5xl px-6 sm:px-10">
        <div className="glass-panel flex items-baseline gap-6 px-6 py-5 sm:px-8">
          <span className="font-mono text-xs text-muted-foreground">05</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Off the clock
          </h2>
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:px-10"
        >
          {PHOTOS.map((file, i) => (
            <div
              key={file}
              data-gallery-tile
              className="relative aspect-[4/5] w-[70vw] flex-none snap-start overflow-hidden rounded-lg border border-border sm:w-[320px]"
            >
              <Image
                src={`/gallery/${file}`}
                alt=""
                fill
                sizes="(max-width: 640px) 70vw, 320px"
                className="gallery-img object-cover transition-transform duration-500 hover:scale-105"
                priority={i < 2}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByOne(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll gallery left"
          className="gallery-arrow left-2 sm:left-4"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByOne(1)}
          disabled={!canScrollRight}
          aria-label="Scroll gallery right"
          className="gallery-arrow right-2 sm:right-4"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
