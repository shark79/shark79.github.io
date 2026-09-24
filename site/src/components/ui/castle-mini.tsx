import { ROOMS, type RoomId } from "@/lib/content";

const WINDOWS: Array<{ x: number; y: number }> = [
  { x: 5, y: 12 }, // left tower
  { x: 5, y: 18 },
  { x: 14, y: 15 }, // keep, gate side
  { x: 19, y: 15 },
  { x: 27, y: 12 }, // right tower
  { x: 27, y: 18 },
];

/** A tiny abstract castle: six windows, lit as the visitor finds each room. */
export function CastleMini({ visited }: { visited: readonly RoomId[] }) {
  return (
    <svg
      viewBox="0 0 32 24"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M2 22V10l3-3 3 3v12M24 22V10l3-3 3 3v12M9 22V8h14v14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="text-border"
      />
      <path
        d="M9 8l7-4 7 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="text-border"
      />
      {ROOMS.map((room, i) => {
        const pos = WINDOWS[i];
        const lit = visited.includes(room.id);
        return (
          <rect
            key={room.id}
            x={pos.x}
            y={pos.y}
            width="2.6"
            height="2.6"
            rx="0.6"
            className={lit ? "fill-butter" : "fill-none"}
            stroke="currentColor"
            strokeWidth="1"
            style={{ color: lit ? "var(--ink-orange)" : "var(--border)" }}
          />
        );
      })}
    </svg>
  );
}
