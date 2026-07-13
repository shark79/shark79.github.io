import { Sparkles, Bot, ShieldCheck } from "lucide-react";
import DisplayCards from "@/components/ui/display-cards";

const FEATURED = [
  {
    icon: <Bot className="size-4 text-primary-foreground" />,
    title: "AgentCore",
    description: "Multi-agent AWS Bedrock system",
    date: "In Progress",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-primary-foreground" />,
    title: "SkillSynQ",
    description: "GenAI job-skill mapping agent",
    date: "2025",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <ShieldCheck className="size-4 text-primary-foreground" />,
    title: "StyloGuard",
    description: "Stylometric authorship verification",
    date: "2025",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
  },
];

const PROJECTS = [
  {
    name: "Production Agentic AI on AWS Bedrock AgentCore",
    status: "In Progress",
    period: "May 2026",
    brief:
      "Serverless multi-agent system on AWS Bedrock AgentCore with CrewAI orchestration and MCP tool integration — an itinerary-and-recommendations agent exercising the full primitive surface end to end.",
    tags: ["AWS Bedrock AgentCore", "CrewAI", "MCP", "OpenTelemetry"],
  },
  {
    name: "SkillSynQ",
    period: "Feb 2025 – Mar 2025",
    brief:
      "GenAI agent that reads a job description, maps the skill gaps, and auto-enrolls you in the right courses. Serverless, end-to-end — showcased at ASU's GenAI hackathon.",
    tags: ["AWS Lambda", "OpenAI", "DynamoDB", "Selenium"],
  },
  {
    name: "Stylometric Authorship Verification",
    period: "Feb 2025 – May 2025",
    brief:
      "Academic-integrity app that fingerprints writing style across 10 linguistic features — built because plagiarism detectors were too easy to fool.",
    tags: ["Python", "PyTorch", "SQL", "NLP"],
  },
  {
    name: "Google Fiber Customer Support Analysis",
    period: "Sept 2024 – Nov 2024",
    brief:
      "Isolated one market region responsible for 62% of all repeat support calls — the kind of finding that changes where a company puts its resources.",
    tags: ["Tableau", "BigQuery", "ETL", "Python"],
  },
];

export function Projects() {
  return (
    <section id="work" className="border-b border-border px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">02</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Selected work
          </h2>
        </div>

        <div className="mb-20 hidden justify-center pb-8 sm:flex">
          <DisplayCards cards={FEATURED} />
        </div>

        <div className="border-t border-border">
          {PROJECTS.map((p) => (
            <div
              key={p.name}
              className="group border-b border-border py-7 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-xl font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                  {p.name}
                </h3>
                {p.status && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground">
                    {p.status}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {p.period}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {p.brief}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
