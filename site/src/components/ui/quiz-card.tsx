"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * A small "make the call" riddle. Nothing is locked behind it — the room's
 * real content is always visible — this is the optional reward moment:
 * answering (right or wrong) or skipping reveals `children` (e.g. a
 * project's stat tiles) and earns the room/project its key.
 */
export function QuizCard({
  quiz,
  label = "Make the call",
  allowSkip = false,
  skipLabel = "Just show me",
  onAnswer,
  children,
}: {
  quiz: Quiz;
  label?: string;
  allowSkip?: boolean;
  skipLabel?: string;
  onAnswer?: (correct: boolean) => void;
  children?: React.ReactNode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(false);
  const revealed = picked !== null || skipped;

  const pick = (i: number) => {
    if (revealed) return;
    setPicked(i);
    onAnswer?.(i === quiz.answer);
  };

  return (
    <div className="clay-sm rounded-[var(--radius-md)] bg-card p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
        {label}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground">
        {quiz.question}
      </p>

      <div className="mt-4 grid gap-2">
        {quiz.options.map((option, i) => {
          const isCorrect = i === quiz.answer;
          const isPicked = i === picked;
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => pick(i)}
              className={cn(
                "clay-sm min-h-11 rounded-[var(--radius-md)] px-4 py-3 text-left text-sm leading-snug transition-colors duration-[var(--dur-hover)]",
                !revealed && "clay-interactive text-foreground hover:text-primary",
                revealed && isCorrect && "clay-butter text-foreground",
                revealed && !isCorrect && isPicked && "clay-wrong text-destructive",
                revealed && !isCorrect && !isPicked && "text-muted-foreground opacity-70",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {allowSkip && !revealed && (
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-3 text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
        >
          {skipLabel}
        </button>
      )}

      {revealed && (
        <div className="race-pop mt-4 space-y-4 border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {picked !== null && (
              <span
                className={cn(
                  "font-medium",
                  picked === quiz.answer ? "text-primary" : "text-foreground",
                )}
              >
                {picked === quiz.answer ? "Right. " : "Not quite. "}
              </span>
            )}
            {quiz.reveal}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}
