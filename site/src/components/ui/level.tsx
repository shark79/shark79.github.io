"use client";

import { ReactNode, useState } from "react";
import { LevelStage } from "@/components/ui/level-stage";
import { useMode } from "@/lib/mode";
import { clearLevel, levelOf, useProgress } from "@/lib/progress";

export type Quiz = {
  question: string;
  options: string[];
  answer: number;
  reveal: string;
};

export type Stat = { label: string; value: string };

type Props = {
  id: string;
  quiz: Quiz;
  /** The payoff: real numbers, revealed only once the call is made. */
  stats?: Stat[];
  /** Anything extra that unlocks with the level (a mini-game, for instance). */
  children?: ReactNode;
};

export function LevelBadge({ id }: { id: string }) {
  const mode = useMode();
  const { cleared } = useProgress();
  const level = levelOf(id);
  if (mode !== "play" || !level) return null;
  const done = cleared.includes(id);

  return (
    <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
      <span className={done ? "text-primary" : "text-muted-foreground"}>
        Level {String(level.n).padStart(2, "0")}
      </span>
      {done && (
        <span className="race-pop rounded-full bg-primary/10 px-2 py-0.5 text-primary">
          {level.badge}
        </span>
      )}
    </div>
  );
}

function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="race-pop grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-background px-3 py-4 text-center">
          <div className="font-heading text-xl font-semibold tracking-tight text-primary">
            {s.value}
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Level({ id, quiz, stats, children }: Props) {
  const mode = useMode();
  const { cleared } = useProgress();
  const [picked, setPicked] = useState<number | null>(null);

  const done = cleared.includes(id);

  // Read mode gets the same information, just handed over instead of earned.
  if (mode !== "play") {
    return (
      <div className="space-y-4">
        {stats && <Stats stats={stats} />}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {quiz.reveal}
        </p>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LevelStage scene={id} cleared={done} />
      <div className="rounded-xl border border-border p-4 sm:p-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          Make the call
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {quiz.question}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {quiz.options.map((opt, i) => {
            const settled = picked !== null;
            const isAnswer = i === quiz.answer;
            const state = !settled
              ? "border-border text-foreground hover:border-primary hover:text-primary"
              : isAnswer
                ? "border-primary bg-primary/10 text-primary"
                : i === picked
                  ? "border-destructive/60 text-destructive line-through"
                  : "border-border text-muted-foreground/50";
            return (
              <button
                key={opt}
                type="button"
                disabled={settled}
                onClick={() => {
                  setPicked(i);
                  clearLevel(id);
                }}
                className={`min-h-11 rounded-lg border px-3 py-2.5 text-center text-sm transition-colors ${state}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p className="race-pop mt-4 text-sm leading-relaxed text-muted-foreground">
            <span
              className={`font-medium ${picked === quiz.answer ? "text-primary" : "text-foreground"}`}
            >
              {picked === quiz.answer ? "Called it. " : "Not quite. "}
            </span>
            {quiz.reveal}
          </p>
        )}
      </div>

      {done && stats && <Stats stats={stats} />}
      {done && children}
    </div>
  );
}
