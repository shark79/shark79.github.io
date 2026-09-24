import { ROOMS, SKILLS } from "@/lib/content";
import { RoomShell } from "@/components/ui/room-shell";

const room = ROOMS.find((r) => r.id === "skills")!;

export function Skills() {
  return (
    <RoomShell room={room}>
      <div className="space-y-8">
        {SKILLS.map((cat) => (
          <div key={cat.name} className="clay-sm rounded-[var(--radius-md)] bg-card p-5 sm:p-6">
            <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
              {cat.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((s) => (
                <span
                  key={s}
                  className="clay-sm clay-interactive rounded-full bg-card px-3.5 py-2 text-xs text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </RoomShell>
  );
}
