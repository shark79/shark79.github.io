"use client";

import { useEffect, useState } from "react";
import { Trophy, Flag } from "lucide-react";
import { MILESTONE, TOTAL_LEVELS, levelOf, useProgress } from "@/lib/progress";
import { useMode } from "@/lib/mode";

/** Cheers on every clear, with a louder one at the halfway mark. */
export function Achievements() {
  const mode = useMode();
  const { cleared, last } = useProgress();
  // Which clear has already been acknowledged — the only thing worth storing.
  const [dismissed, setDismissed] = useState<number | null>(null);

  const level = last ? levelOf(last.id) : undefined;
  const count = cleared.length;
  const milestone = count === MILESTONE;
  const showing =
    mode === "play" && !!last && !!level && dismissed !== last.at;

  useEffect(() => {
    if (!showing || !last) return;
    const at = last.at;
    const hide = window.setTimeout(
      () => setDismissed(at),
      milestone ? 4200 : 2800,
    );
    return () => window.clearTimeout(hide);
  }, [showing, last, milestone]);

  if (!showing || !level) return null;

  const detail = milestone
    ? `${count} of ${TOTAL_LEVELS} — past halfway`
    : count === TOTAL_LEVELS
      ? "Every level cleared"
      : `Level ${level.n} · ${count} of ${TOTAL_LEVELS}`;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-70 flex justify-center px-4">
      <div
        role="status"
        className={`race-pop flex items-center gap-3 rounded-full border px-4 py-2.5 backdrop-blur-md ${
          milestone
            ? "border-primary bg-primary/15"
            : "border-border bg-background/90"
        }`}
      >
        {milestone ? (
          <Flag className="size-4 flex-none text-primary" />
        ) : (
          <Trophy className="size-4 flex-none text-primary" />
        )}
        <span className="text-sm font-medium">{level.badge}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {detail}
        </span>
      </div>
    </div>
  );
}
