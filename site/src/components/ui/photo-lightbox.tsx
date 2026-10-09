"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PHOTOS } from "@/lib/content";

const EVENT = "photo:open";

/** Open the lightbox on a given photo. */
export function openPhoto(file: string) {
  window.dispatchEvent(new CustomEvent<{ file: string }>(EVENT, { detail: { file } }));
}

/** Full-size photo viewer: Esc / arrows / swipe, focus trapped and restored. */
export function PhotoLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;

  useEffect(() => {
    const onOpen = (e: Event) => {
      const file = (e as CustomEvent<{ file: string }>).detail?.file;
      const at = PHOTOS.findIndex((p) => p === file);
      if (at < 0) return;
      lastFocused.current = document.activeElement;
      setIndex(at);
    };
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    (lastFocused.current as HTMLElement | null)?.focus?.();
  }, []);

  const step = useCallback((delta: 1 | -1) => {
    setIndex((i) => (i === null ? i : (i + delta + PHOTOS.length) % PHOTOS.length));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (index === null) return null;
  const file = PHOTOS[index];

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${PHOTOS.length}`}
      ref={dialogRef}
      onClick={close}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 p-5 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative max-w-[min(92vw,720px)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- variable-aspect photo, static export, unoptimized images */}
        <img
          src={`/gallery/${file}`}
          alt=""
          className="max-h-[78svh] w-auto object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        />

        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="Close photo"
          className="absolute -top-12 right-0 flex size-11 items-center justify-center rounded-full text-foreground transition-opacity hover:opacity-60"
        >
          <X className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="absolute top-1/2 -left-6 hidden size-11 -translate-x-full -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-opacity hover:opacity-60 sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="absolute top-1/2 -right-6 hidden size-11 translate-x-full -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-opacity hover:opacity-60 sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>

        <p className="label mt-4 text-muted-foreground tabular-nums">
          {index + 1} / {PHOTOS.length}
        </p>
      </div>
    </div>
  );
}
