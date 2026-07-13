const JOBS = [
  {
    company: "CMCI",
    period: "Jun 2025 — Present",
    role: "AI Developer",
    desc: "Building clinical AI where hallucinations aren't acceptable and latency actually matters — the most technically demanding environment I've worked in, and the most instructive.",
    bullets: [
      <>
        Accelerated clinical note generation by <strong>~60%</strong> (35–40s → 15s) by parallelizing note generation, document save, and embeddings creation via FastAPI + AWS Lambda
      </>,
      <>
        Engineered the platform&apos;s core RAG pipeline (OpenAI Embeddings + PGVector) with dynamic multi-tenant collections powering every downstream AI feature; later migrated to <strong>S3 Vectors</strong> on Amazon Titan V2
      </>,
      <>
        Built agentic clinical workflows writing structured orders to a leading EHR — Pydantic-validated FHIR bundles, ICD-10/SNOMED CT mapping, and classification guardrails
      </>,
      <>
        Directed model strategy via evaluation (GPT-4o vs. Claude), co-executed the winning migration to <strong>AWS Bedrock</strong>; lifted medication capture from 80% to <strong>100%</strong> by migrating transcription to gpt-4o-transcribe
      </>,
      <>
        Owned production reliability: ran a 272-patient backfill across 25 parallel Lambda batches enabling MIPS/HIMSS analytics via SQL-driven RAG; root-caused a production outage to a same-day fix
      </>,
      <>
        Re-architected the flagship conversational AI assistant around intent routing + OpenAI tool calling — <strong>40+ iterations</strong> to make it the product&apos;s most-used AI chat agent
      </>,
    ],
  },
  {
    company: "ASU",
    period: "Dec 2024 — May 2025",
    role: "Principled Innovation Assistant",
    desc: "Contributed to a responsible AI research initiative — making the environmental cost of running AI feel tangible to students and policymakers, not just a footnote in a whitepaper.",
    bullets: [
      <>
        Built an interactive research tool on AI&apos;s energy, cost, and emissions footprint using Python and Streamlit, comparing energy sources and climate-impact scores
      </>,
      <>
        Designed an in-class energy-budget challenge and wrote tutorials translating ML concepts for non-technical audiences
      </>,
    ],
  },
];

const ACTIVITIES = [
  {
    org: "SODA — Software Developers Association, ASU",
    desc: "Member; attended tech talks, software conferences, and hackathons.",
  },
  {
    org: "Hindu Yuva, ASU",
    desc: "Volunteer organizer — managed and volunteered in student cultural events and networking mixers.",
  },
];

export function Experience() {
  return (
    <section
      id="experience"
      className="border-b border-border px-6 py-24 sm:px-10"
    >
      <div className="mx-auto max-w-5xl">
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
                      className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:content-['—'] before:text-primary"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
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
