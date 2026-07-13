"use client";

import { useRef, useState } from "react";
import { Sparkles, Bot, ShieldCheck, BarChart3, ChevronDown } from "lucide-react";
import DisplayCards from "@/components/ui/display-cards";

const PROJECTS = [
  {
    id: "googlefiber",
    name: "Google Fiber Customer Support Analysis",
    period: "Sept 2024 to Nov 2024",
    brief:
      "Dug into support call data and found exactly where the biggest customer problems were coming from.",
    tags: ["Tableau", "BigQuery", "ETL", "Python"],
    whatItDoes:
      "I analyzed patterns in repeat support calls to find where the real problems were coming from. Turned out one market region alone was behind 62% of all repeat calls.",
    impact:
      "That kind of finding changes where a company actually puts its resources. Instead of spreading fixes evenly, they could focus on the one region causing most of the pain, and I built dashboards so the team could track it going forward.",
    whatILearned:
      "The best insights are often sitting in data nobody bothered to slice the right way. This wasn't a complicated model, just the right question asked of the right data.",
  },
  {
    id: "skillsynq",
    name: "SkillSynQ",
    period: "Feb 2025 to Mar 2025",
    brief:
      "Reads a job posting, figures out what skills you're missing, and signs you up for the right courses automatically. Runs serverlessly from start to finish.",
    tags: ["AWS Lambda", "OpenAI", "DynamoDB", "Selenium"],
    whatItDoes:
      "It pulls live job postings and course listings, compares them using OpenAI, and shows you exactly which skills you're missing for a role. If you approve a course match, it signs you up automatically through DynamoDB, no extra steps.",
    impact:
      "I built this in 36 hours at ASU's GenAI hackathon and it got picked for the showcase demos. It's a small tool, but it solves something genuinely annoying: nobody wants to sit there manually comparing a job description against a course catalog.",
    whatILearned:
      "Scraping live data is messier than any tutorial makes it look. I spent more time handling broken page layouts and rate limits than I did on the actual matching logic.",
  },
  {
    id: "styloguard",
    name: "Stylometric Authorship Verification",
    period: "Feb 2025 to May 2025",
    brief:
      "Checks whether a piece of writing actually matches someone's usual style instead of just checking if the words were copied.",
    tags: ["Python", "PyTorch", "SQL", "NLP"],
    whatItDoes:
      "It looks at ten different features of how someone writes: sentence length, word choice, punctuation habits, and compares new writing against that person's usual style. It flags submissions that don't match, even when no text was directly copied.",
    impact:
      "Most plagiarism tools only check for copied text, which paraphrasing tools get around pretty easily. Looking at style instead is a lot harder to fake.",
    whatILearned:
      "Tuning this to catch real inconsistencies without flagging normal variation in someone's writing was the hardest part. People's writing style shifts more than you'd expect, even within the same week.",
  },
  {
    id: "agentcore",
    name: "Production Agentic AI on AWS Bedrock AgentCore",
    period: "2026",
    brief:
      "Builds a system where multiple AI agents split up a task instead of one model trying to do everything. Runs on AWS Bedrock AgentCore, coordinated with CrewAI and connected to outside tools through MCP.",
    tags: ["AWS Bedrock AgentCore", "CrewAI", "MCP", "OpenTelemetry"],
    whatItDoes:
      "Instead of one AI model trying to handle an entire task, this splits the work across several agents that each handle a piece of it, then hands off between them. It's built on AWS Bedrock AgentCore and coordinated with a framework called CrewAI, with a protocol called MCP letting the agents call outside tools when they need to. The example I built around it is a travel agent that researches, plans, and recommends a full itinerary on its own.",
    impact:
      "I think most serious AI products are going to need this kind of setup eventually, several focused agents instead of one giant prompt trying to do everything. It also pushed me to learn a very new part of AWS before most people had touched it.",
    whatILearned:
      "Multi-agent systems break in different ways than single-agent ones do. Getting agents to hand off work cleanly and stay in their own lane took more design thinking than the actual AI logic did.",
  },
];

const FEATURED_META = [
  {
    id: "googlefiber",
    icon: <BarChart3 className="size-4 text-primary-foreground" />,
    title: "Google Fiber",
    description: "Customer support call analysis",
    date: "2024",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    id: "skillsynq",
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
    id: "styloguard",
    icon: <ShieldCheck className="size-4 text-primary-foreground" />,
    title: "StyloGuard",
    description: "Stylometric authorship verification",
    date: "2025",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    id: "agentcore",
    icon: <Bot className="size-4 text-primary-foreground" />,
    title: "AgentCore",
    description: "Multi-agent AWS Bedrock system",
    date: "2026",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-48 translate-y-28 hover:translate-y-16 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
];

export function Projects() {
  const [open, setOpen] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const goToProject = (id: string) => {
    setOpen(id);
    const el = rowRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlighted(id);
    window.setTimeout(() => {
      setHighlighted((current) => (current === id ? null : current));
    }, 1600);
  };

  const featuredCards = FEATURED_META.map((meta) => ({
    ...meta,
    onClick: () => goToProject(meta.id),
  }));

  return (
    <section id="work" className="border-b border-border px-6 py-24 sm:px-10">
      <div className="glass-panel mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">02</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Selected work
          </h2>
        </div>

        <div className="mb-24 hidden justify-center pb-8 sm:flex">
          <DisplayCards cards={featuredCards} />
        </div>

        <div className="border-t border-border">
          {PROJECTS.map((p) => {
            const isOpen = open === p.id;
            const isHighlighted = highlighted === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  rowRefs.current[p.id] = el;
                }}
                className={`border-b border-border ${isHighlighted ? "project-highlight" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className="group w-full py-7 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading text-xl font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                      {p.name}
                    </h3>
                    <ChevronDown
                      className={`mt-1.5 size-4 flex-none text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
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
                </button>

                {isOpen && (
                  <div className="max-w-2xl space-y-5 pb-8 pl-0 pr-4 text-sm leading-relaxed text-muted-foreground">
                    <div>
                      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                        What it does
                      </div>
                      <p>{p.whatItDoes}</p>
                    </div>
                    <div>
                      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                        Impact
                      </div>
                      <p>{p.impact}</p>
                    </div>
                    <div>
                      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                        What I learned
                      </div>
                      <p>{p.whatILearned}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
