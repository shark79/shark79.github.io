const STATS = [
  { label: "Master's GPA, ASU", value: "4.0" },
  { label: "Clinical Note Gen Speedup", value: "60%" },
  { label: "Medication Capture Accuracy", value: "100%" },
  { label: "Chat Agent Iterations Shipped", value: "40+" },
];

const EDUCATION = [
  {
    degree: "M.S. Information Technology",
    meta: "Arizona State University · Aug 2023 to May 2025 · GPA 4.0",
  },
  {
    degree: "B.Tech Computer Science & Engineering",
    meta: "JNTU Hyderabad, India · Aug 2019 to Jul 2023",
  },
];

export function About() {
  return (
    <section id="about" className="border-b border-border px-6 py-24 sm:px-10">
      <div className="glass-panel mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">01</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            About me
          </h2>
        </div>

        <div className="grid gap-16 md:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              I got into LLMs around 2023, not because everyone else was
              talking about them, but because I saw how{" "}
              <strong className="font-medium text-foreground">useful</strong>{" "}
              they actually were. Getting a model to do something that would
              normally take days of manual work never got old.
            </p>
            <p>
              Most of what I build starts with something that annoys me.
              StyloGuard came from watching AI detectors get{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                fooled by simple paraphrasing tools
              </span>
              . SkillSynQ came from being tired of manually decoding job
              descriptions. The energy simulator I built at ASU came from
              wanting data center carbon costs to feel real instead of just
              numbers in a report.
            </p>
            <p>
              Right now I&apos;m an{" "}
              <strong className="font-medium text-foreground">
                AI Developer at DocAide.ai
              </strong>
              , doing the most demanding work of my career: clinical AI,
              where mistakes aren&apos;t an option and speed matters just as
              much as accuracy. Shipping FastAPI services, orchestrating LLMs
              with intent routing, and leading a production migration from
              GPT-4o to Claude on{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                AWS Bedrock
              </span>{" "}
              has taught me more than any side project could.
            </p>
            <p>
              Healthcare is where I am today. Finance, gaming, and design are
              where I&apos;d like to take these same ideas next: systems that
              scale and are built responsibly. I&apos;m still learning as I
              go, just{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                quicker than I used to
              </span>
              .
            </p>
          </div>

          <div>
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between border-b border-border py-5 first:border-t"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </span>
                <span className="font-heading text-2xl font-semibold tracking-tight">
                  {s.value}
                </span>
              </div>
            ))}

            <div className="mt-8 space-y-4">
              {EDUCATION.map((e) => (
                <div key={e.degree} className="border-b border-border pb-4">
                  <div className="font-heading text-sm font-semibold">
                    {e.degree}
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    {e.meta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
