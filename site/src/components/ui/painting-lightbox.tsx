"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PHOTOS } from "@/lib/content";

const EVENT = "castle:painting";

/** Open the lightbox from anywhere — the 3D castle and the gallery rail both call this. */
export function openPaintingLightbox(file: string) {
  window.dispatchEvent(new CustomEvent<{ file: string }>(EVENT, { detail: { file } }));
}

/**
 * A single shared lightbox for every photo, whether it was tapped as a
 * framed painting in the 3D castle or in the flat gallery rail.
 */
export function PaintingLightbox() {
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b1714]/70 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="lightbox-in relative max-w-[min(92vw,640px)]"
      >
        <div className="clay rounded-[var(--radius-lg)] bg-card p-3 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- variable-aspect photo, static export, unoptimized images */}
          <img
            src={`/gallery/${file}`}
            alt=""
            className="max-h-[70svh] w-auto rounded-[var(--radius-md)] object-contain"
          />
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="Close photo"
          className="clay-sm clay-interactive absolute -top-3 -right-3 flex size-10 items-center justify-center rounded-full bg-card text-foreground"
        >
          <X className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="clay-sm clay-interactive absolute top-1/2 -left-4 hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="clay-sm clay-interactive absolute top-1/2 -right-4 hidden size-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>

        <p className="clay-sm mt-3 inline-flex rounded-full bg-card px-3 py-1 font-mono text-[11px] text-muted-foreground tabular-nums">
          {index + 1} / {PHOTOS.length}
        </p>
      </div>
    </div>
  );
}
