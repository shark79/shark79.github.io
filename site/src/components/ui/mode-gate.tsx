"use client";

import { BookOpen, Gamepad2 } from "lucide-react";
import { setMode, useMode } from "@/lib/mode";
import { TOTAL_LEVELS } from "@/lib/progress";

export function ModeGate() {
  const mode = useMode();
  if (mode !== null) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-background/80 px-4 pb-4 backdrop-blur-md sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-gate-title"
        className="race-pop glass-panel w-full max-w-lg px-6 py-7 shadow-xl sm:px-8 sm:py-9"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Shashank Jamkhandi · AI Engineer
        </p>
        <h2
          id="mode-gate-title"
          className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          How do you want this?
        </h2>

        <div className="mt-7 grid gap-3">
          <button
            type="button"
            onClick={() => setMode("read")}
            className="group flex items-start gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary sm:p-5"
          >
            <BookOpen className="mt-0.5 size-5 flex-none text-muted-foreground transition-colors group-hover:text-primary" />
            <span>
              <span className="block font-heading text-lg font-semibold tracking-tight">
                Just read it
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                Everything laid out plainly. Projects, work, the numbers. About
                five minutes, no interruptions.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("play")}
            className="group flex items-start gap-4 rounded-xl border border-primary bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10 sm:p-5"
          >
            <Gamepad2 className="mt-0.5 size-5 flex-none text-primary" />
            <span>
              <span className="block font-heading text-lg font-semibold tracking-tight">
                Play through it
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {`${TOTAL_LEVELS} short levels. Same information, but you unlock it — one call per level, and the answer opens the real numbers behind it. Ten minutes, and you'll actually remember it.`}
              </span>
            </span>
          </button>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          You can switch at any time from the top bar
        </p>
      </div>
    </div>
  );
}
