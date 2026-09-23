"use client";

// Placeholder until the 3D hub lands. Contract: see docs/DESIGN.md §5.
import { PROFILE, ROOMS } from "@/lib/content";

export function CastleHub() {
  return (
    <section id="top" className="min-h-svh px-6 pt-32">
      <h1>{PROFILE.name}</h1>
      <nav aria-label="Rooms">
        {ROOMS.map((r) => (
          <a key={r.id} href={`#${r.id}`}>
            {r.n} {r.place} · {r.label}
          </a>
        ))}
      </nav>
    </section>
  );
}
