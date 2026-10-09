import { ABOUT, EDUCATION, PROFILE, STATS } from "@/lib/content";
import { SectionHead } from "@/components/ui/section-head";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-40">
      <SectionHead n="01" label="About">
        {PROFILE.intro}
      </SectionHead>

      <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        <ul className="grid grid-cols-2 gap-x-8 gap-y-12 self-start">
          {STATS.map((s, i) => (
            <li key={s.label} className="reveal border-t border-line pt-5" style={{ "--i": i } as React.CSSProperties}>
              <p className="text-[clamp(36px,4vw,56px)] leading-none font-light tracking-[-0.03em]">{s.value}</p>
              <p className="mt-3 text-[14px] text-muted-foreground">{s.label}</p>
            </li>
          ))}
        </ul>

        <div className="space-y-6 text-[17px] leading-[1.75] text-muted-foreground">
          {ABOUT.map((p, i) => (
            <p key={i} className="reveal" style={{ "--i": i } as React.CSSProperties}>
              {p}
            </p>
          ))}
          <ul className="!mt-12 space-y-5 border-t border-line pt-8">
            {EDUCATION.map((e) => (
              <li key={e.degree} className="reveal">
                <p className="text-foreground">{e.degree}</p>
                <p className="mt-1 text-[15px]">
                  {e.school} · {e.meta}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
