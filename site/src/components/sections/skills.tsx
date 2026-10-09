import { SKILLS } from "@/lib/content";
import { SectionHead } from "@/components/ui/section-head";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-40">
      <SectionHead n="03" label="Toolkit">
        What I reach for.
      </SectionHead>
      <div className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
        {SKILLS.map((cat, i) => (
          <div key={cat.name} className="reveal border-t border-line pt-6" style={{ "--i": i } as React.CSSProperties}>
            <h3 className="label">{cat.name}</h3>
            <ul className="mt-6 space-y-2.5 text-[15px] text-muted-foreground">
              {cat.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
