import { ACTIVITIES, JOBS } from "@/lib/content";
import { SectionHead } from "@/components/ui/section-head";

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-40">
      <SectionHead n="02" label="Experience">
        Clinical AI by day, where a confident wrong answer is the bug that matters.
      </SectionHead>

      <ol className="mt-16 border-b border-line lg:mt-24">
        {JOBS.map((job) => (
          <li key={job.company} className="reveal grid gap-6 border-t border-line py-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div>
              <p className="text-[clamp(24px,2.4vw,32px)] font-normal tracking-[-0.01em]">{job.company}</p>
              <p className="mt-2 text-[16px]">{job.role}</p>
              <p className="label mt-3 text-muted-foreground">{job.period}</p>
            </div>
            <div>
              <p className="max-w-2xl text-[17px] leading-[1.75] text-foreground/85">{job.desc}</p>
              <ul className="mt-8 space-y-4">
                {job.bullets.map((b) => (
                  <li key={b} className="relative max-w-2xl pl-6 text-[15px] leading-[1.7] text-muted-foreground">
                    <span aria-hidden="true" className="absolute top-[0.8em] left-0 h-px w-3 bg-foreground/40" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:ml-[33.3%] lg:pl-24">
        {ACTIVITIES.map((a) => (
          <li key={a.org} className="reveal">
            <p className="text-[16px]">{a.org}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{a.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
