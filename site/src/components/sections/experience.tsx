import { ACCURACY_NOTE, ACTIVITIES, JOBS, ROOMS } from "@/lib/content";
import { RoomShell } from "@/components/ui/room-shell";
import { HallucinationGame } from "@/components/ui/hallucination-game";

const room = ROOMS.find((r) => r.id === "experience")!;

export function Experience() {
  return (
    <RoomShell room={room}>
      <div className="relative space-y-6 border-l border-border pl-6">
        {JOBS.map((job) => (
          <div key={job.company} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[29px] size-2.5 rounded-full bg-primary shadow-sm"
            />
            <div className="clay-sm rounded-[var(--radius-md)] bg-card p-5 sm:p-6">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {job.period}
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight">
                {job.company}
              </h3>
              <p className="text-sm font-medium text-foreground/70">{job.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{job.desc}</p>
              <ul className="mt-4 space-y-2">
                {job.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:text-primary before:content-['•']"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIVITIES.map((a) => (
          <div key={a.org} className="clay-sm rounded-[var(--radius-md)] bg-card p-4">
            <p className="font-heading text-sm font-semibold tracking-tight">{a.org}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
          Second opinion
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{ACCURACY_NOTE}</p>
        <HallucinationGame />
      </div>
    </RoomShell>
  );
}
