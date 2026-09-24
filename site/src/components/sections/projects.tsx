"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { PROJECTS, ROOMS, type Project } from "@/lib/content";
import { solve } from "@/lib/progress";
import { RoomShell } from "@/components/ui/room-shell";
import { QuizCard } from "@/components/ui/quiz-card";
import { SeatRace } from "@/components/ui/seat-race";
import { cn } from "@/lib/utils";

const room = ROOMS.find((r) => r.id === "work")!;

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-primary uppercase">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <div id={project.id} className="clay-sm rounded-[var(--radius-md)] bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
      >
        <div>
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {project.period}
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {project.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.brief}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-hover)]",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="race-pop space-y-5 border-t border-border px-5 pt-5 pb-6 sm:px-6">
          <Field label="What it does" text={project.whatItDoes} />
          <Field label="Impact" text={project.impact} />
          <Field label="What I learned" text={project.whatILearned} />

          {project.links && (
            <div className="flex flex-wrap gap-2">
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-sm clay-interactive inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-xs text-foreground"
                >
                  {l.label}
                  <ArrowUpRight className="size-3" />
                </a>
              ))}
            </div>
          )}

          {project.game === "seat-race" && <SeatRace />}

          <QuizCard quiz={project.quiz} allowSkip onAnswer={() => solve(project.id)}>
            <div className="grid grid-cols-2 gap-2.5">
              {project.stats.map((s) => (
                <div key={s.label} className="clay-inset rounded-[var(--radius-sm)] p-3">
                  <p className="font-heading text-lg font-semibold text-foreground">{s.value}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </QuizCard>
        </div>
      )}
    </div>
  );
}

export function Projects() {
  const rows = PROJECTS.reduce<{ project: Project; year: string; showYear: boolean }[]>(
    (acc, project) => {
      const year = project.start.slice(0, 4);
      const showYear = acc.length === 0 || acc[acc.length - 1].year !== year;
      acc.push({ project, year, showYear });
      return acc;
    },
    [],
  );

  return (
    <RoomShell room={room}>
      <div className="relative space-y-6 border-l border-border pl-14">
        {rows.map(({ project, year, showYear }) => (
          <div key={project.id} className="relative">
            {showYear ? (
              <span className="clay-sm absolute top-0 -left-12 flex h-7 items-center rounded-full px-2.5 font-mono text-[11px] font-semibold text-primary">
                {year}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="absolute top-3 -left-[26px] size-1.5 rounded-full bg-primary/40"
              />
            )}
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </RoomShell>
  );
}
