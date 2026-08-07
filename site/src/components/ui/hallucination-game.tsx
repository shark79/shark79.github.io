"use client";

import { useState } from "react";
import { clearLevel } from "@/lib/progress";

type Round = {
  ask: string;
  note: string;
  answers: [string, string];
  /** Index of the answer that does not hold up against the note. */
  bad: 0 | 1;
  /** Exact substring of the bad answer that is wrong. Highlighted on reveal. */
  flaw: string;
  why: string;
};

// Synthetic notes. Nothing here comes from a real patient or a real record.
const ROUNDS: Round[] = [
  {
    ask: "What was the chief complaint at this visit?",
    note: "Patient reports intermittent chest tightness for three days, worse on exertion. No fever. Denies shortness of breath. BP 138/86.",
    answers: [
      "Chief complaint: intermittent chest tightness for three days, worse on exertion, with associated shortness of breath and a low-grade fever. BP 138/86.",
      "Chief complaint: intermittent chest tightness for three days, worse on exertion. No fever, no shortness of breath. BP 138/86.",
    ],
    bad: 0,
    flaw: "with associated shortness of breath and a low-grade fever",
    why: "The note explicitly denies both. The model added two symptoms that were never there — and wrote them in the same confident voice as the rest.",
  },
  {
    ask: "What is the date of the most recent progress note?",
    note: "Progress notes on file: 14 Mar 2026 · 02 Apr 2026 · 19 May 2026.",
    answers: [
      "The most recent progress note is dated 19 May 2026.",
      "The most recent progress note is dated 02 Apr 2026.",
    ],
    bad: 1,
    flaw: "02 Apr 2026",
    why: "Nothing was invented here — it just picked the wrong one. Retrieval returned three notes and the model did not order them. Boring failure, same consequence.",
  },
  {
    ask: "List the patient's active medications.",
    note: "Active medications: metformin 500 mg BID · lisinopril 10 mg daily · atorvastatin 20 mg nightly · levothyroxine 75 mcg daily.",
    answers: [
      "Active medications: metformin 500 mg BID, lisinopril 10 mg daily.",
      "Active medications: metformin 500 mg BID, lisinopril 10 mg daily, atorvastatin 20 mg nightly, levothyroxine 75 mcg daily.",
    ],
    bad: 0,
    flaw: "metformin 500 mg BID, lisinopril 10 mg daily.",
    why: "Two active prescriptions silently missing. The hardest kind to catch, because a short answer looks just as authoritative as a complete one.",
  },
];

function Flawed({ text, flaw }: { text: string; flaw: string }) {
  const at = text.indexOf(flaw);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="rounded bg-destructive/15 px-1 font-medium text-destructive">
        {flaw}
      </span>
      {text.slice(at + flaw.length)}
    </>
  );
}

export function HallucinationGame() {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongShake, setWrongShake] = useState<number | null>(null);

  const finished = round >= ROUNDS.length;
  const current = finished ? null : ROUNDS[round];

  const pick = (i: number) => {
    if (picked !== null || !current) return;
    setPicked(i);
    if (i === current.bad) {
      setScore((s) => s + 1);
    } else {
      setWrongShake(i);
      window.setTimeout(() => setWrongShake(null), 500);
    }
  };

  const next = () => {
    setPicked(null);
    const at = round + 1;
    setRound(at);
    if (at >= ROUNDS.length) clearLevel("accuracy");
  };

  if (finished) {
    return (
      <div className="race-pop rounded-xl border border-border p-4 sm:p-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          Spot the hallucination · complete
        </div>
        <p className="font-heading text-2xl font-semibold tracking-tight">
          {score} of {ROUNDS.length}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {score === ROUNDS.length
            ? "All three. Note how little the wrong answers looked wrong — that is the whole problem."
            : "Worth noticing how little the wrong answers looked wrong. Confidence reads the same either way."}{" "}
          In a clinical product this is not a quiz and not a cosmetic bug: an
          invented symptom, a stale date, or a short medication list is a
          patient-safety problem the moment a clinician believes it. Finding and
          fixing that category of failure is a real part of my day job.
        </p>
        <button
          type="button"
          onClick={() => {
            setRound(0);
            setScore(0);
            setPicked(null);
          }}
          className="mt-4 min-h-9 rounded-full border border-border px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Play again ↻
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Spot the hallucination
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {ROUNDS.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${
                i < round
                  ? "bg-primary"
                  : i === round
                    ? "bg-foreground"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        Both answers sound right. One of them does not survive the note. Pick
        the one you would not sign off on.
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-border p-3">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          The note (synthetic)
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {current!.note}
        </p>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        Asked: {current!.ask}
      </p>

      <div className="mt-3 grid gap-2.5">
        {current!.answers.map((answer, i) => {
          const settled = picked !== null;
          const isBad = i === current!.bad;
          const state = !settled
            ? "border-border hover:border-primary"
            : isBad
              ? "border-destructive/60 bg-destructive/5"
              : "border-primary/60 bg-primary/5";
          return (
            <button
              key={i}
              type="button"
              disabled={settled}
              onClick={() => pick(i)}
              className={`rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors ${state} ${
                wrongShake === i ? "race-shake" : ""
              }`}
            >
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Answer {i === 0 ? "A" : "B"}
                {settled && isBad ? " · does not hold up" : ""}
                {settled && !isBad ? " · faithful to the note" : ""}
              </span>
              {settled && isBad ? (
                <Flawed text={answer} flaw={current!.flaw} />
              ) : (
                answer
              )}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="race-pop mt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span
              className={`font-medium ${picked === current!.bad ? "text-primary" : "text-foreground"}`}
            >
              {picked === current!.bad ? "Caught it. " : "Missed it. "}
            </span>
            {current!.why}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 min-h-9 rounded-full border border-primary px-4 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            {round === ROUNDS.length - 1 ? "See the score" : "Next round"} →
          </button>
        </div>
      )}
    </div>
  );
}
