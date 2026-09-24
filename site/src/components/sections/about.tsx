import { ABOUT, ABOUT_QUIZ, EDUCATION, ROOMS, STATS } from "@/lib/content";
import { solve } from "@/lib/progress";
import { RoomShell } from "@/components/ui/room-shell";
import { QuizCard } from "@/components/ui/quiz-card";

const room = ROOMS.find((r) => r.id === "about")!;
const TILES = ["clay-blush", "clay-apricot", "clay-butter", "clay-cream"] as const;

export function About() {
  return (
    <RoomShell room={room}>
      <div className="max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        {ABOUT.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`clay-sm rounded-[var(--radius-md)] p-4 ${TILES[i % TILES.length]}`}
          >
            <p className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-foreground/70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {EDUCATION.map((e) => (
          <div key={e.degree} className="clay-sm rounded-[var(--radius-md)] bg-card p-4">
            <p className="font-heading text-sm font-semibold">{e.degree}</p>
            <p className="mt-1 text-sm text-muted-foreground">{e.school}</p>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground/80 uppercase">
              {e.meta}
            </p>
          </div>
        ))}
      </div>

      <QuizCard quiz={ABOUT_QUIZ} label="The Study's riddle" onAnswer={() => solve("about")} />
    </RoomShell>
  );
}
