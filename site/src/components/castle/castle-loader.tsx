"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "sj-castle-loaded";
const SHOW_MS = 1100;
const FADE_MS = 260;

/** Evaluated once per module load. Node (SSR/export) has no sessionStorage, so this is always
 * `false` in the static HTML — the client re-evaluates it fresh on hydration. */
function alreadyShownThisSession() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Reduced motion skips the loader outright — there's no non-animated version worth a
 * forced 1.1s pause for, and the animated pennant hoist must not run either way. */
function shouldSkip() {
  if (typeof window === "undefined") return false;
  return alreadyShownThisSession() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A short, personality-driven loader: a pennant hoists up a tiny clay tower
 * while the 3D world warms up behind it. Pure CSS/SVG — costs nothing to
 * paint before three.js has even started loading. Skipped on repeat visits
 * within the same tab session — but the skip decision (sessionStorage,
 * matchMedia) only ever runs client-side, in an effect, never during the
 * initial render: deciding it during render (server vs. client) produced a
 * hydration mismatch, since the static HTML always shows the loader while a
 * returning client could render "hidden" on its very first pass.
 */
export function CastleLoader() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("visible");

  useEffect(() => {
    if (shouldSkip()) setPhase("hidden");
  }, []);

  useEffect(() => {
    if (phase !== "visible") return;
    const fade = setTimeout(() => setPhase("fading"), SHOW_MS);
    return () => clearTimeout(fade);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const done = setTimeout(() => {
      setPhase("hidden");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode: nothing to persist, it'll just show again next time */
      }
    }, FADE_MS);
    return () => clearTimeout(done);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-[var(--background,#FBF7F1)] transition-opacity ease-[var(--ease-in-out,ease)]"
      style={{ opacity: phase === "fading" ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      <svg width="72" height="88" viewBox="0 0 72 88" className="overflow-visible">
        <rect x="30" y="40" width="12" height="40" rx="4" fill="var(--primary-soft, #F3D2C8)" />
        <polygon points="20,40 20,20 40,40" fill="var(--primary, #C4523F)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,26; 0,0; 0,0"
            keyTimes="0; 0.65; 1"
            dur="1.05s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.22 1 0.36 1; 0 0 1 1"
          />
        </polygon>
        <circle cx="36" cy="34" r="16" fill="var(--cream, #FFF3DF)" opacity="0.5" />
      </svg>
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Raising the drawbridge…</p>
    </div>
  );
}
