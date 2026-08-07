"use client";

import { useRef, useState } from "react";
import { clearLevel } from "@/lib/progress";

type Buyer = "A" | "B";
type Mode = "naive" | "durable";
type Flight = { key: number; buyer: Buyer; sawFree: boolean; delay: number };
type Line = { key: number; text: string; ok: boolean };

const COMMIT_MS = 900;
const STAGGER_MS = 260;
const PRICE = "$180";

let seq = 0;

export function SeatRace() {
  const [mode, setMode] = useState<Mode>("naive");
  const [owner, setOwner] = useState<Buyer | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [done, setDone] = useState(false);

  // The commit path reads the ref, not React state: a request that is already
  // in flight has to see whatever the world looks like at commit time, which
  // is exactly the window the naive version reads through.
  const ownerRef = useRef<Buyer | null>(null);
  const busy = flights.length > 0;

  const reset = () => {
    ownerRef.current = null;
    setOwner(null);
    setLines([]);
    setFlights([]);
    setDone(false);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    reset();
  };

  const commit = (flight: Flight) => {
    const free =
      mode === "naive"
        ? // Read taken when the request started, then acted on later.
          flight.sawFree
        : // Re-read at commit time, inside the serialized step.
          ownerRef.current === null;

    if (free) {
      ownerRef.current = flight.buyer;
      setOwner(flight.buyer);
      setLines((prev) => [
        ...prev,
        {
          key: flight.key,
          ok: true,
          text: `Seat sold to Buyer ${flight.buyer} · card charged ${PRICE}`,
        },
      ]);
    } else {
      setLines((prev) => [
        ...prev,
        {
          key: flight.key,
          ok: false,
          text: `Buyer ${flight.buyer} rejected · seat already held`,
        },
      ]);
    }
  };

  const fire = (buyers: Buyer[]) => {
    if (busy || done) return;
    const sawFree = ownerRef.current === null;
    const batch: Flight[] = buyers.map((buyer, i) => ({
      key: ++seq,
      buyer,
      sawFree,
      delay: i * STAGGER_MS,
    }));
    setFlights(batch);

    batch.forEach((flight) => {
      window.setTimeout(() => commit(flight), COMMIT_MS + flight.delay);
    });
    window.setTimeout(
      () => {
        setFlights([]);
        setDone(true);
        clearLevel("reservation");
      },
      COMMIT_MS + (batch.length - 1) * STAGGER_MS + 120,
    );
  };

  const charges = lines.filter((l) => l.ok).length;

  return (
    <div className="rounded-xl border border-border p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Race the seat
        </div>
        <div
          role="group"
          aria-label="Backend behaviour"
          className="flex rounded-full border border-border p-0.5"
        >
          {(["naive", "durable"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={`min-h-8 rounded-full px-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "naive" ? "Naive" : "Durable"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        One seat. Two buyers. Send them both and watch what the backend does
        with the gap between reading &ldquo;is it free?&rdquo; and writing
        &ldquo;it&apos;s taken.&rdquo;
      </p>

      {/* Track: requests travel left to right, the seat sits at the end. */}
      <div className="relative mt-5 h-16 overflow-hidden rounded-lg border border-border bg-muted/40">
        <div className="absolute inset-y-0 right-0 flex w-20 flex-col items-center justify-center border-l border-border">
          <div
            className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
              owner ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Seat
          </div>
          <div
            key={owner ?? "free"}
            className={`race-pop font-heading text-lg font-semibold ${
              owner ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {owner ? owner : "—"}
          </div>
        </div>
        {flights.map((f, i) => (
          <div
            key={f.key}
            className="race-packet absolute left-2 flex items-center gap-2"
            style={{
              top: i === 0 ? "0.6rem" : "2.4rem",
              animationDelay: `${f.delay}ms`,
              animationDuration: `${COMMIT_MS}ms`,
            }}
          >
            <span className="size-2 rounded-full bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              reserve · {f.buyer}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || done}
          onClick={() => fire(["A", "B"])}
          className="min-h-11 flex-1 rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
        >
          Both tap at once
        </button>
        <button
          type="button"
          disabled={busy || done}
          onClick={() => fire(["A"])}
          className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        >
          Buyer A
        </button>
        <button
          type="button"
          disabled={busy || done}
          onClick={() => fire(["B"])}
          className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        >
          Buyer B
        </button>
      </div>

      {lines.length > 0 && (
        <div className="mt-4 space-y-1.5 font-mono text-[11px]">
          {lines.map((l) => (
            <div
              key={l.key}
              className={`race-pop ${l.ok ? "text-foreground" : "text-muted-foreground"}`}
            >
              <span className={l.ok ? "text-primary" : "text-destructive"}>
                {l.ok ? "✓" : "✕"}
              </span>{" "}
              {l.text}
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="race-pop mt-4 space-y-3">
          <p className="text-sm leading-relaxed">
            <span
              className={`font-medium ${charges > 1 ? "text-destructive" : "text-primary"}`}
            >
              {charges > 1
                ? "One seat, two charges."
                : charges === 1
                  ? "One winner."
                  : "Nothing sold."}
            </span>{" "}
            {mode === "naive"
              ? "Both requests checked availability before either had written anything, so both believed the seat was free. This is the bug, and it is not rare — it is the default."
              : "Every change to a seat is serialized and re-reads the real current state inside that step. The second request has no window to read stale data through, so it is rejected cleanly instead of double-charging."}
          </p>
          <button
            type="button"
            onClick={() => switchMode(mode === "naive" ? "durable" : "naive")}
            className="min-h-9 rounded-full border border-border px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Now try it in {mode === "naive" ? "durable" : "naive"} mode ↻
          </button>
        </div>
      )}
    </div>
  );
}
