import type { ROOMS } from "@/lib/content";
import { RoomHeader } from "@/components/ui/room-header";
import { cn } from "@/lib/utils";

type Room = (typeof ROOMS)[number];

/**
 * The shell every room section shares: a transparent band (the castle
 * behind the page shows through) holding the door plaque + heading, and a
 * content column on the desktop side opposite `room.side` — the side the 3D
 * camera frames the room's opening (or the gallery's painted hall) on.
 */
export function RoomShell({
  room,
  children,
  className,
}: {
  room: Room;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={room.id}
      className="relative z-20 py-20 sm:py-28 lg:flex lg:min-h-svh lg:items-center lg:py-32"
    >
      {/* Morning mist on the content side, so the plaque and heading read
          cleanly over the castle without boxing them in. */}
      <div
        aria-hidden="true"
        className={cn(
          "room-mist pointer-events-none absolute inset-y-0 w-full lg:w-[62%]",
          room.side === "left" ? "right-0 room-mist-r" : "left-0",
        )}
      />
      <div
        className={cn(
          "mx-auto w-full max-w-2xl px-5 sm:px-8 lg:mx-0 lg:max-w-[46%]",
          // Cards sit opposite the opening. On the left, lg:ml-56 clears the
          // fixed bottom-left room index so it never overlaps this column.
          room.side === "left" ? "lg:ml-auto lg:mr-16" : "lg:ml-56",
          className,
        )}
      >
        <RoomHeader room={room} />
        <div className="mt-10 space-y-8 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
