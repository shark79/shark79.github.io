const STATS = [
  { label: "GPA — Master's IT, ASU", value: "4.0" },
  { label: "Clinical Note Gen Speedup", value: "60%" },
  { label: "Medication Capture Accuracy", value: "100%" },
  { label: "Chat Agent Iterations Shipped", value: "40+" },
];

const EDUCATION = [
  {
    degree: "M.S. Information Technology",
    meta: "Arizona State University · Aug 2023 – May 2025 · GPA 4.0",
  },
  {
    degree: "B.Tech Computer Science & Engineering",
    meta: "JNTU Hyderabad, India · Aug 2019 – Jul 2023",
  },
];

export function About() {
  return (
    <section id="about" className="border-b border-border px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">01</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            About me
          </h2>
        </div>

        <div className="grid gap-16 md:grid-cols-2">
          <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              I got genuinely hooked on LLMs around 2023 — not because everyone
              was talking about them, but because I realized they were
              actually <strong className="font-medium text-foreground">useful</strong>.
              Like, properly useful. That feeling of getting a model to do
              something complex that would have taken days to code manually?
              That never got old.
            </p>
            <p>
              Most of what I&apos;ve built started from something that bugged
              me. StyloGuard came from watching AI detectors get{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                easily fooled by paraphrasing tools
              </span>
              . SkillSynQ came from the frustration of decoding job
              descriptions by hand. The energy simulator I built at ASU came
              from wanting data center carbon costs to feel real, not just
              numbers in a whitepaper.
            </p>
            <p>
              Now as an{" "}
              <strong className="font-medium text-foreground">
                AI Developer at CMCI
              </strong>
              , I&apos;m doing the most technically demanding work of my life
              — clinical AI where hallucinations aren&apos;t acceptable and
              latency actually matters. Shipping FastAPI services,
              orchestrating LLMs with intent routing, and directing a
              production model migration from GPT-4o to Claude on{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                AWS Bedrock
              </span>{" "}
              has made me a sharper engineer than any side project ever did.
            </p>
            <p>
              Healthcare is where I am right now. Finance, gaming, and design
              are where I want to take these same patterns next — systems
              that scale, and that get built responsibly. Still figuring
              things out. Just{" "}
              <span className="rounded bg-primary/10 px-1 py-0.5 font-medium text-foreground">
                faster than before
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
