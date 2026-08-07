"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  Users,
  Ticket,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import DisplayCards from "@/components/ui/display-cards";
import { SeatRace } from "@/components/ui/seat-race";
import { Level, LevelBadge, type Stat } from "@/components/ui/level";
import { useMode } from "@/lib/mode";
import { TOTAL_LEVELS, useProgress } from "@/lib/progress";

type Quiz = {
  question: string;
  options: string[];
  answer: number;
  reveal: string;
};

type Project = {
  id: string;
  name: string;
  period: string;
  brief: string;
  tags: string[];
  links?: { label: string; href: string }[];
  whatItDoes: string;
  impact: string;
  whatILearned: string;
  quiz: Quiz;
  stats: Stat[];
  /** Phrase in `brief` that answers the level's own question. */
  spoiler?: string;
};

// Newest first. Keep this order — the section reads as a timeline.
const PROJECTS: Project[] = [
  {
    id: "devteam",
    name: "Autonomous Dev Team on Open-Weight Models",
    period: "Jul 2026 to Aug 2026",
    brief:
      "Five AI agents with different jobs, including one whose only job is to break things, built and shipped a working app together for under twelve dollars.",
    spoiler: "for under twelve dollars",
    tags: ["OpenCode", "OpenRouter", "Multi-Agent", "Kimi K3", "GLM 5.2"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/shark79/MultiAgent-Organization",
      },
    ],
    whatItDoes:
      "I set up a small software team where every member is an AI agent with its own rules: an orchestrator that plans the work and decides when a phase is done, a backend developer, a frontend developer, a QA agent that writes and runs the tests, and an adversary agent that tries to break the running app on purpose. They hand work to each other, write every action to an audit log nobody is allowed to edit, and stop for a human sign-off before starting the next phase. The app they built is the seat-booking system below.",
    impact:
      "The entire build cost $11.56 in model spend, across 27.5 million tokens and 340 requests, running on open-weight models rather than the expensive frontier ones. An 88% cache hit rate did most of that work, bringing the blended cost to about 42 cents per million tokens. The point isn't the price though, it's that the checkpoints, tests, and security pass are what made cheaper models good enough to trust.",
    whatILearned:
      "Agents are fine at writing code. What they're bad at is knowing when to stop. Nearly all my effort went into the rules around them: who is allowed to close a defect, when the orchestrator has to stop and ask a human, and what actually counts as proof that something works.",
    quiz: {
      question:
        "Five agents planned, built, tested, and attacked a working app. What did the whole build cost in model spend?",
      options: ["$11.56", "$115", "$1,150"],
      answer: 0,
      reveal:
        "$11.56 for 27.5M tokens. Open-weight models via OpenRouter, an 88.2% cache hit rate, and a blended $0.42 per million tokens.",
    },
    stats: [
      { label: "Total model spend", value: "$11.56" },
      { label: "Tokens", value: "27.5M" },
      { label: "Requests", value: "340" },
      { label: "Cache hit rate", value: "88.2%" },
    ],
  },
  {
    id: "reservation",
    name: "Reservation System with Failure Handling",
    period: "Jul 2026 to Aug 2026",
    brief:
      "A seat-booking app built to survive the exact bugs that take down real booking and payment systems, with tests that trigger those bugs on purpose.",
    tags: ["Reboot", "Python", "React", "MCP", "Durable Workflows"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/shark79/Reservation-System-Failure-Handling",
      },
    ],
    whatItDoes:
      "Four things quietly break booking systems in production: two people buying the same seat in the same instant, a retried request charging a card twice, a crash landing between taking the payment and sending the confirmation, and someone confirming a seat they never held. This handles all four by how it's built, not by patching each one where it shows up. It also runs inside an AI chat window, where one of its tools opens a real, clickable seat map right in the conversation, backed by the same live data as the website.",
    impact:
      "Each of those four failures has an automated test that actually causes it, racing two real requests against each other and killing the process mid-payment, then checks the system still landed in the right state. That matters more now that AI agents call backends directly: an agent retries anything that looks ambiguous and fires parallel calls far more often than a person clicking a button ever would.",
    whatILearned:
      "Correctness is much cheaper when it comes from the architecture than when it depends on someone remembering to add a lock in every place that needs one. Also, watching a real interface render inside a chat conversation feels genuinely different from watching an AI describe one.",
    quiz: {
      question:
        "Two buyers tap reserve on the same seat in the same millisecond. How many of them get it?",
      options: ["Exactly one, always", "One, usually", "Both, sometimes"],
      answer: 0,
      reveal:
        "Exactly one. Every seat is its own durable actor, so changes queue up and each one re-checks the real current state before it commits. There is no gap for the second request to slip through.",
    },
    stats: [
      { label: "Failure modes survived", value: "4" },
      { label: "Tests that cause them", value: "4" },
      { label: "Front ends, one backend", value: "2" },
      { label: "Hand-written locks", value: "0" },
    ],
  },
  {
    id: "jobfinder",
    name: "Job Finder, H1B-Aware Job Search",
    period: "Jul 2026",
    brief:
      "Finds jobs at companies that genuinely sponsor visas, using the government's own filing data, then tailors a resume, finds a recruiter, and drafts the email. You hit send, it never does.",
    spoiler: "You hit send, it never does.",
    tags: ["MCP", "npm", "Node.js", "Apollo.io", "DOL Open Data"],
    links: [
      { label: "GitHub", href: "https://github.com/shark79/job-finder" },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@sharkbuilds/job-finder",
      },
    ],
    whatItDoes:
      "It checks whether a company has a real history of sponsoring visas using the Department of Labor's own quarterly filings, rather than a crowdsourced list that's usually out of date. If it does, it checks that company's actual job board for open roles, rewrites the wording of your resume for that specific posting without touching the formatting, converts it to PDF and confirms it's still one page, finds a recruiter, drafts a personal email, and logs the whole thing in a tracker so nothing gets sent twice.",
    impact:
      "It's published on npm, so anyone can install and run it with a single command. The part I'm most attached to is the guardrail: the agent is physically incapable of sending an email, because the send tool was never handed to it. It can only create drafts you read first.",
    whatILearned:
      "Deciding what an agent isn't allowed to do turned out to matter more than what it can do. Taking the send capability away entirely is a much stronger promise than writing a prompt that asks the model not to send.",
    quiz: {
      question:
        "The agent writes personalized outreach emails. How many can it send on its own?",
      options: ["Unlimited", "One per day", "Zero"],
      answer: 2,
      reveal:
        "Zero. The send tool was never added to its permitted list, only create-draft. It's a structural limit, not an instruction it could talk itself out of.",
    },
    stats: [
      { label: "Job boards queried live", value: "3" },
      { label: "Emails it can send", value: "0" },
      { label: "Published npm package", value: "1" },
      { label: "Source of sponsor data", value: "DOL" },
    ],
  },
  {
    id: "agentcore",
    name: "Production Agentic AI on AWS Bedrock AgentCore",
    period: "May 2026",
    brief:
      "Builds a system where multiple AI agents split up a task instead of one model trying to do everything. Runs on AWS Bedrock AgentCore, coordinated with CrewAI and connected to outside tools through MCP.",
    tags: ["AWS Bedrock AgentCore", "CrewAI", "MCP", "OpenTelemetry"],
    whatItDoes:
      "Instead of one AI model trying to handle an entire task, this splits the work across several agents that each handle a piece of it, then hands off between them. It's built on AWS Bedrock AgentCore and coordinated with a framework called CrewAI, with a protocol called MCP letting the agents call outside tools when they need to. The example I built around it is a travel agent that researches, plans, and recommends a full itinerary on its own.",
    impact:
      "I think most serious AI products are going to need this kind of setup eventually, several focused agents instead of one giant prompt trying to do everything. It also pushed me to learn a very new part of AWS before most people had touched it.",
    whatILearned:
      "Multi-agent systems break in different ways than single-agent ones do. Getting agents to hand off work cleanly and stay in their own lane took more design thinking than the actual AI logic did.",
    quiz: {
      question:
        "In a multi-agent system, which part breaks first once you move past the demo?",
      options: [
        "The AI reasoning itself",
        "The handoffs between agents",
        "The cloud bill",
      ],
      answer: 1,
      reveal:
        "The handoffs. Each agent works fine alone. Getting them to pass work cleanly and stay in their own lane took more design than the AI logic did.",
    },
    stats: [
      { label: "Agents sharing the task", value: "4" },
      { label: "One giant prompt", value: "0" },
      { label: "Tool protocol", value: "MCP" },
      { label: "Traced end to end", value: "Yes" },
    ],
  },
  {
    id: "styloguard",
    name: "Stylometric Authorship Verification",
    period: "Feb 2025 to May 2025",
    brief:
      "Checks whether a piece of writing actually matches someone's usual style instead of just checking if the words were copied.",
    tags: ["Python", "PyTorch", "SQL", "NLP"],
    links: [{ label: "GitHub", href: "https://github.com/shark79/StyloGuard" }],
    whatItDoes:
      "It looks at ten different features of how someone writes: sentence length, word choice, punctuation habits, and compares new writing against that person's usual style. It flags submissions that don't match, even when no text was directly copied.",
    impact:
      "Most plagiarism tools only check for copied text, which paraphrasing tools get around pretty easily. Looking at style instead is a lot harder to fake.",
    whatILearned:
      "Tuning this to catch real inconsistencies without flagging normal variation in someone's writing was the hardest part. People's writing style shifts more than you'd expect, even within the same week.",
    quiz: {
      question:
        "How many separate features of someone's writing does it compare to spot a style mismatch?",
      options: ["3", "10", "100"],
      answer: 1,
      reveal:
        "Ten, from sentence length to punctuation habits. Enough to catch a real mismatch, few enough that you can explain to a person why something got flagged.",
    },
    stats: [
      { label: "Style features compared", value: "10" },
      { label: "Text it needs copied", value: "0" },
      { label: "Beats paraphrasing", value: "Yes" },
      { label: "Built over", value: "4 mo" },
    ],
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
    quiz: {
      question:
        "This went from an empty repo to a showcase demo at ASU's GenAI hackathon in how long?",
      options: ["36 hours", "2 weeks", "3 months"],
      answer: 0,
      reveal:
        "36 hours. Most of it went on scraping live job and course pages that kept changing shape, not on the matching logic.",
    },
    stats: [
      { label: "Empty repo to demo", value: "36h" },
      { label: "Picked for showcase", value: "Yes" },
      { label: "Servers to manage", value: "0" },
      { label: "Steps to enroll", value: "1" },
    ],
  },
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
    quiz: {
      question:
        "One market region was responsible for what share of every repeat support call?",
      options: ["12%", "38%", "62%"],
      answer: 2,
      reveal:
        "62%, from one region. Nothing clever in the model, just slicing the data by a dimension nobody had tried.",
    },
    stats: [
      { label: "Repeat calls, one region", value: "62%" },
      { label: "Regions analysed", value: "8" },
      { label: "Dashboards shipped", value: "Live" },
      { label: "Models required", value: "0" },
    ],
  },
];

// The skewed stack only reads well with four cards — show the four newest.
const FEATURED_META = [
  {
    id: "devteam",
    icon: <Users className="size-4 text-primary-foreground" />,
    title: "Agent Dev Team",
    description: "Five agents shipped an app",
    date: "2026",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    id: "reservation",
    icon: <Ticket className="size-4 text-primary-foreground" />,
    title: "Failure Lab",
    description: "Booking bugs, survived",
    date: "2026",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    id: "jobfinder",
    icon: <Compass className="size-4 text-primary-foreground" />,
    title: "Job Finder",
    description: "H1B-aware search, on npm",
    date: "2026",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    id: "agentcore",
    icon: <Bot className="size-4 text-primary-foreground" />,
    title: "AgentCore",
    description: "Multi-agent AWS Bedrock",
    date: "2026",
    iconClassName: "bg-primary",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-48 translate-y-28 hover:translate-y-16 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
];

const ICON_BY_ID: Record<string, React.ReactNode> = {
  styloguard: <ShieldCheck className="size-4" />,
  skillsynq: <Sparkles className="size-4" />,
  googlefiber: <BarChart3 className="size-4" />,
};

/**
 * Several briefs state the very number their level asks you to guess. Blur
 * that phrase until the call is made — reading it back afterwards is part of
 * the payoff, so it stays in place rather than being cut.
 */
function Brief({
  text,
  spoiler,
  hide,
}: {
  text: string;
  spoiler?: string;
  hide: boolean;
}) {
  if (!spoiler || !hide) return <>{text}</>;
  const at = text.indexOf(spoiler);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span
        aria-hidden="true"
        className="select-none rounded bg-primary/10 px-1 blur-[5px]"
      >
        {spoiler}
      </span>
      <span className="sr-only">(hidden until you make the call)</span>
      {text.slice(at + spoiler.length)}
    </>
  );
}

export function Projects() {
  const [open, setOpen] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mode = useMode();
  const { cleared } = useProgress();
  const playing = mode === "play";
  const here = PROJECTS.filter((p) => cleared.includes(p.id)).length;

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
        <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <span className="font-mono text-xs text-muted-foreground">02</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Selected work
          </h2>
          {playing && (
            <span
              aria-live="polite"
              className={`ml-auto rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                here === PROJECTS.length
                  ? "border-primary/50 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {here} of {PROJECTS.length} cleared here
            </span>
          )}
        </div>
        <p className="mb-14 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {playing
            ? `Levels 02 to 08. Open a project, watch what it does, then make one call before the real numbers unlock. Level 03 you can run yourself. The ring up top tracks all ${TOTAL_LEVELS}.`
            : "Seven projects, newest first. Open any of them for what it does, what it changed, and what I took away."}
        </p>

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
                  <LevelBadge id={p.id} />
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
                      {ICON_BY_ID[p.id] ? (
                        <span className="text-muted-foreground transition-colors group-hover:text-primary">
                          {ICON_BY_ID[p.id]}
                        </span>
                      ) : null}
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
                    <Brief
                      text={p.brief}
                      spoiler={p.spoiler}
                      hide={playing && !cleared.includes(p.id)}
                    />
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

                {p.links ? (
                  <div className="-mt-2 mb-6 flex flex-wrap gap-2">
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {l.label}
                        <ArrowUpRight className="size-3" />
                      </a>
                    ))}
                  </div>
                ) : null}

                {isOpen && (
                  <div className="max-w-2xl space-y-5 pb-8 pr-4 text-sm leading-relaxed text-muted-foreground">
                    <Level id={p.id} quiz={p.quiz} stats={p.stats}>
                      {/* The one project you can prove instead of read. */}
                      {p.id === "reservation" ? <SeatRace /> : null}
                    </Level>
                    {(!playing || cleared.includes(p.id)) && (
                    <>
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
                    </>
                    )}
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
