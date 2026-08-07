"use client";

import { useSyncExternalStore } from "react";

export type Mode = "read" | "play";

const KEY = "sj-mode";

let mode: Mode | null = null;
let hydrated = false;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((notify) => notify());
}

export function setMode(next: Mode) {
  mode = next;
  hydrated = true;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // Private mode or storage disabled — the choice just won't persist.
  }
  emit();
}

/** Lets a visitor switch their mind later without clearing storage by hand. */
export function resetMode() {
  mode = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  emit();
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (!hydrated) {
    hydrated = true;
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "read" || saved === "play") {
        mode = saved;
        // Defer so we never notify during a render pass.
        queueMicrotask(emit);
      }
    } catch {}
  }
  return () => {
    subscribers.delete(notify);
  };
}

/** null means the visitor has not chosen yet, so the gate should show. */
export function useMode(): Mode | null {
  return useSyncExternalStore(
    subscribe,
    () => mode,
    () => null,
  );
}
