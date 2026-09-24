"use client";

import { useEffect, useRef, useState } from "react";
import { ROOMS } from "@/lib/content";
import { KEYS, TOTAL_KEYS, TOTAL_ROOMS, resetProgress, useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";

type Toast = { id: number; text: string };

const TOAST_MS = 3400;
let toastSeq = 0;

export function ToastStack() {
  const progress = useProgress();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const seenAt = useRef<number | null>(null);
  const celebrated = useRef(false);

  useEffect(() => {
    const { last, rooms, keys } = progress;
    if (!last || last.at === seenAt.current) return;
    seenAt.current = last.at;

    const text =
      last.kind === "room"
        ? `${ROOMS.find((r) => r.id === last.id)?.place ?? "A room"} is lit · ${rooms.length} of ${TOTAL_ROOMS}`
        : `Key found · ${KEYS.find((k) => k.id === last.id)?.label ?? last.id} · ${keys.length} of ${TOTAL_KEYS}`;

    const id = ++toastSeq;
    // Keep at most two on screen: a fast scroll past several rooms shouldn't
    // bury the page in a column of pills.
    setToasts((t) => [...t.slice(-1), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_MS);

    if (last.kind === "room" && rooms.length === TOTAL_ROOMS && !celebrated.current) {
      celebrated.current = true;
      window.setTimeout(() => setCelebrate(true), 700);
    }
  }, [progress]);

  useEffect(() => {
    if (!celebrate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCelebrate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [celebrate]);

  return (
    <>
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <p
            key={t.id}
            className="toast-in clay-sm pointer-events-auto max-w-[calc(100vw-2.5rem)] rounded-full bg-card px-5 py-2.5 text-center text-sm font-medium text-foreground sm:max-w-sm"
          >
            {t.text}
          </p>
        ))}
      </div>

      {celebrate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="castle-complete-heading"
          onClick={() => setCelebrate(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-5 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="clay toast-in max-w-sm rounded-[var(--radius-lg)] bg-card p-8 text-center"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              The castle is lit
            </p>
            <h3
              id="castle-complete-heading"
              className="mt-3 font-heading text-3xl font-semibold tracking-tight"
            >
              All six rooms found
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {progress.keys.length} of {TOTAL_KEYS} keys collected along the way.
              Thanks for exploring the whole castle.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  resetProgress();
                  celebrated.current = false;
                  setCelebrate(false);
                }}
              >
                Explore again
              </Button>
              <Button variant="ghost" onClick={() => setCelebrate(false)}>
                Keep browsing
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
