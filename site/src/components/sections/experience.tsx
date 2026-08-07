"use client";

import { HallucinationGame } from "@/components/ui/hallucination-game";
import { useCleared } from "@/lib/progress";

const JOBS = [
  {
    company: "DocAide.ai",
    period: "Jun 2025 to Present",
    role: "AI Developer",
    desc: "I work on AI that gets used in an actual hospital setting, so there's no room for the system to guess wrong. It's changed how I think about building software when real people are depending on it.",
    bullets: [
      <>
        Cut the time it takes to generate a clinical note by more than half,
        from around 40 seconds down to 15, by getting several backend steps
        to run at the same time instead of one after another
      </>,
      <>
        Built the search system that powers almost every AI feature on the
        platform, helping it pull up the right patient information quickly.
        Later moved it to a faster storage setup as things scaled up
      </>,
      <>
        Built AI workflows that write medical orders straight into the
        hospital&apos;s record system, using the correct medical codes and
        built-in checks that catch mistakes before they happen. Also got
        medication capture from noisy audio up to <strong>100%</strong>
      </>,
      <>
        Ran two AI models head to head on clinical note accuracy, led the
        switch to the winner, and made both fully supported on AWS Bedrock so
        the answer a clinician gets never depends on which model happens to be
        running underneath
      </>,
      <>
        Rebuilt how patient data is stored: vitals, labs, imaging, and
        cardiology results moved out of one overloaded catch-all field into
        their own tables, with the pipeline that fills them from clinical
        notes and a graph view of vitals across dates
      </>,
      <>
        Built the subscription billing system from scratch on Square, end to
        end: checkout, signed webhooks so incoming payment events can be
        trusted, full payment lifecycle tracking, and automatic receipt and
        failed-payment emails. Shipped to production in three phases
      </>,
      <>
        Owned the critical fixes: a full production outage of both AI
        features, vitals not being picked up from dictated notes, and three
        separate cases of the assistant answering confidently but wrongly.
        Root-caused each one
      </>,
    ],
  },
  {
    company: "ASU",
    period: "Dec 2024 to May 2025",
    role: "Principled Innovation Assistant",
    desc: "This one was less about writing code and more about getting people to actually care. I helped build tools that make the environmental cost of AI feel like a real number instead of an abstract idea.",
    bullets: [
      <>
        Built a tool where you pick different energy sources and instantly
        see the cost and environmental tradeoffs, so the decisions weren&apos;t
        just theoretical
      </>,
      <>
        Ran a classroom activity where students had to budget their own
        energy mix, and wrote guides that explain AI concepts to people
        without a technical background
      </>,
    ],
  },
];

const ACTIVITIES = [
  {
    org: "SODA, Software Developers Association at ASU",
    desc: "Member. Attended tech talks, conferences, and hackathons.",
  },
  {
    org: "Hindu Yuva, ASU",
    desc: "Volunteer organizer. Helped run student cultural events and networking mixers.",
  },
];

export function Experience() {
  const cleared = useCleared();
  const accuracyCleared = cleared.includes("accuracy");

  return (
    <section
      id="experience"
      className="border-b border-border px-6 py-24 sm:px-10"
    >
      <div className="glass-panel mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">03</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Where I&apos;ve worked
          </h2>
        </div>

        <div className="space-y-14">
          {JOBS.map((job) => (
            <div
              key={job.company}
              className="grid gap-6 border-b border-border pb-12 last:border-b-0 last:pb-0 md:grid-cols-[14rem_1fr]"
            >
              <div>
                <div className="font-heading text-xl font-semibold tracking-tight">
                  {job.company}
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {job.period}
                </div>
                <div className="mt-2 text-sm font-medium text-foreground/70">
                  {job.role}
                </div>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {job.desc}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {job.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:content-['•'] before:text-primary"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Level 08. The hardest part of the day job, as a thing you do
            rather than a bullet you skim. */}
        <div className="mt-16 border-t border-border pt-10">
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
            <span
              className={
                accuracyCleared ? "text-primary" : "text-muted-foreground"
              }
            >
              Level 08
            </span>
            {accuracyCleared && (
              <span className="race-pop rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Cleared
              </span>
            )}
            <span className="text-muted-foreground">
              · the bug class that matters most here
            </span>
          </div>
          <div className="max-w-2xl">
            <HallucinationGame />
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-border pt-10 sm:grid-cols-2">
          {ACTIVITIES.map((a) => (
            <div key={a.org}>
              <div className="font-heading text-base font-semibold tracking-tight">
                {a.org}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
