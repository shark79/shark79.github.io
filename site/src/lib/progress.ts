"use client";

import { useSyncExternalStore } from "react";
import { PROJECTS, ROOMS, type RoomId } from "@/lib/content";

/**
 * Two kinds of progress, one store:
 *  - rooms: each castle room (page section) you've stepped into
 *  - keys:  each puzzle you've solved (a project's call, the about call, and
 *           the two mini-games)
 * Persisted to localStorage so a returning visitor keeps their castle lit.
 */

export const KEYS = [
  { id: "about", label: "The Study's riddle" },
  ...PROJECTS.map((p) => ({ id: p.id, label: p.name })),
  { id: "seatrace", label: "Seat race" },
  { id: "accuracy", label: "Second opinion" },
] as const;

export const TOTAL_ROOMS = ROOMS.length;
export const TOTAL_KEYS = KEYS.length;

type Event = { kind: "room" | "key"; id: string; at: number };

export type Progress = {
  rooms: RoomId[];
  keys: string[];
  /** Most recent unlock, so toasts know what to celebrate. */
  last: Event | null;
};

const STORAGE = "sj-castle-v1";
const EMPTY: Progress = { rooms: [], keys: [], last: null };
let snapshot: Progress = EMPTY;
let hydrated = false;
const subscribers = new Set<() => void>();

function commit(next: Progress) {
  snapshot = next;
  try {
    window.localStorage.setItem(
      STORAGE,
      JSON.stringify({ rooms: next.rooms, keys: next.keys }),
    );
  } catch {
    // Private mode or storage blocked: progress just won't survive a reload.
  }
  subscribers.forEach((notify) => notify());
}

export function visitRoom(id: RoomId) {
  if (snapshot.rooms.includes(id)) return;
  commit({
    ...snapshot,
    rooms: [...snapshot.rooms, id],
    last: { kind: "room", id, at: Date.now() },
  });
}

export function solve(id: string) {
  if (snapshot.keys.includes(id)) return;
  commit({
    ...snapshot,
    keys: [...snapshot.keys, id],
    last: { kind: "key", id, at: Date.now() },
  });
}

export function resetProgress() {
  commit(EMPTY);
}

function hydrate() {
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<Progress>;
    const rooms = (saved.rooms ?? []).filter((r): r is RoomId =>
      ROOMS.some((room) => room.id === r),
    );
    const keys = (saved.keys ?? []).filter((k) => KEYS.some((key) => key.id === k));
    snapshot = { rooms, keys, last: null };
    // Defer so we never notify during a render pass.
    queueMicrotask(() => subscribers.forEach((notify) => notify()));
  } catch {}
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (!hydrated) hydrate();
  return () => {
    subscribers.delete(notify);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}
