"use client";

import { useEffect } from "react";
import { ROOMS, type RoomId } from "@/lib/content";
import { visitRoom } from "@/lib/progress";

/**
 * Records a room as visited once >=40% of its section has scrolled into
 * view — scrolling counts, not just clicking a door. Renders nothing.
 */
export function RoomVisitTracker() {
  useEffect(() => {
    const els = ROOMS.map((r) => document.getElementById(r.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visitRoom(entry.target.id as RoomId);
        }
      },
      // A band across the middle of the viewport, not a fraction of the
      // section: a room taller than 2.5 screens (Projects on a phone) could
      // never be 40% visible and so would never count as visited.
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
