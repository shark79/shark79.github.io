import type { ROOMS } from "@/lib/content";

type Room = (typeof ROOMS)[number];

/**
 * The "door plaque" every room opens with: a small arched, pinned sign
 * (mono room number + place name), the room's real h2 label, and a
 * one-line hint. Transparent otherwise — this band is where the castle
 * behind the page should still read through.
 */
export function RoomHeader({ room }: { room: Room }) {
  return (
    <header className="relative">
      <div className="relative inline-flex">
        <span
          aria-hidden="true"
          className="clay-pin absolute -top-[7px] left-1/2 -translate-x-1/2"
        />
        <p className="clay-sm rounded-t-full rounded-b-[10px] bg-card px-5 pt-2.5 pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {room.n} · {room.place}
        </p>
      </div>
      <h2 className="mt-5 max-w-[16ch] font-heading text-[34px] leading-[1.05] font-semibold tracking-tight sm:text-[44px] lg:text-[56px]">
        {room.label}
      </h2>
      <p className="mt-3 max-w-[38ch] text-base text-muted-foreground sm:text-lg">
        {room.hint}
      </p>
    </header>
  );
}
