"use client";

import { useSyncExternalStore } from "react";

/** Page order: about, seven projects, then the accuracy level in experience. */
export const LEVELS = [
  { id: "about", n: 1, badge: "Did the homework" },
  { id: "devteam", n: 2, badge: "Budget hawk" },
  { id: "reservation", n: 3, badge: "Race marshal" },
  { id: "jobfinder", n: 4, badge: "Gatekeeper" },
  { id: "agentcore", n: 5, badge: "Traffic control" },
  { id: "styloguard", n: 6, badge: "Handwriting expert" },
  { id: "skillsynq", n: 7, badge: "Speed runner" },
  { id: "googlefiber", n: 8, badge: "Needle finder" },
  { id: "accuracy", n: 9, badge: "Second opinion" },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

export const TOTAL_LEVELS = LEVELS.length;
/** One milestone on the way, so the run has a middle and not just an end. */
export const MILESTONE = 5;

export function levelOf(id: string) {
  return LEVELS.find((l) => l.id === id);
}

type Snapshot = {
  cleared: string[];
  /** Most recent clear, so the toast knows what to celebrate. */
  last: { id: string; at: number } | null;
};

const done = new Set<string>();
const subscribers = new Set<() => void>();
const EMPTY: Snapshot = { cleared: [], last: null };
let snapshot: Snapshot = EMPTY;

export function clearLevel(id: string) {
  if (done.has(id)) return;
  done.add(id);
  snapshot = { cleared: [...done], last: { id, at: Date.now() } };
  subscribers.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

export function useProgress(): Snapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}
