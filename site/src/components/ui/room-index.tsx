"use client";

import { useEffect, useState } from "react";
import { ROOMS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Vectr-style numbered index, bottom-left on desktop only (the mobile nav
 * sheet covers the same job on small screens). Tracks whichever room
 * section currently crosses the vertical center of the viewport.
 */
export function RoomIndex() {
  const [active, setActive] = useState<string>(ROOMS[0].id);

  useEffect(() => {
    const els = ROOMS.map((r) => document.getElementById(r.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActive(topmost.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Rooms"
      className="fixed bottom-6 left-6 z-50 hidden lg:block"
    >
      <ol className="clay-sm flex flex-col gap-1 rounded-[var(--radius-lg)] bg-card/95 p-2">
        {ROOMS.map((room) => {
          const isActive = room.id === active;
          return (
            <li key={room.id}>
              <a
                href={`#${room.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-h-9 items-center gap-2 rounded-full px-2.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)]",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="tabular-nums">{room.n}</span>
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-[var(--dur-hover)] ease-[var(--ease-out)]",
                    isActive ? "max-w-28 opacity-100" : "max-w-0 opacity-0",
                  )}
                >
                  {room.place}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
