import type { ROOMS } from "@/lib/content";
import { RoomHeader } from "@/components/ui/room-header";
import { cn } from "@/lib/utils";

type Room = (typeof ROOMS)[number];

/**
 * The shell every room section shares: a transparent band (the castle
 * behind the page shows through) holding the door plaque + heading, and a
 * content column pinned to the left ~50% on desktop so the room's opening
 * (or, in the gallery, its painted hall) stays visible on the right.
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
      <div
        className={cn(
          "mx-auto w-full max-w-2xl px-5 sm:px-8 lg:mx-0 lg:ml-[7vw] lg:max-w-[50%]",
          className,
        )}
      >
        <RoomHeader room={room} />
        <div className="mt-10 space-y-8 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
