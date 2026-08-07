"use client";

import { useSyncExternalStore } from "react";

/** 7 project levels + the clinical-accuracy level in Experience. */
export const TOTAL_LEVELS = 8;

const cleared = new Set<string>();
const subscribers = new Set<() => void>();
const EMPTY: string[] = [];
let snapshot: string[] = EMPTY;

export function clearLevel(id: string) {
  if (cleared.has(id)) return;
  cleared.add(id);
  snapshot = [...cleared];
  subscribers.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

/** Same list everywhere — nav ring, project rows, experience. */
export function useCleared() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}
