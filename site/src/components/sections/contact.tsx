import { PROFILE, ROOMS } from "@/lib/content";
import { RoomShell } from "@/components/ui/room-shell";

const room = ROOMS.find((r) => r.id === "contact")!;

export function Contact() {
  return (
    <RoomShell room={room}>
      <p className="max-w-[18ch] font-heading text-3xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-4xl">
        Send a message up the tower.
      </p>

      <a
        href={`mailto:${PROFILE.email}`}
        className="clay clay-interactive clay-primary inline-flex min-h-14 items-center gap-3 rounded-full px-7 text-base font-medium text-primary-foreground sm:text-lg"
      >
        {PROFILE.email}
        <span aria-hidden="true" className="text-xl">↗</span>
      </a>

      <div className="flex flex-wrap gap-2.5">
        <a
          href={PROFILE.phone.href}
          className="clay-sm clay-interactive inline-flex min-h-11 items-center rounded-full bg-card px-4 text-sm text-foreground"
        >
          {PROFILE.phone.display}
        </a>
        {PROFILE.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="clay-sm clay-interactive inline-flex min-h-11 items-center rounded-full bg-card px-4 text-sm text-foreground"
          >
            {l.label}
          </a>
        ))}
      </div>
    </RoomShell>
  );
}
