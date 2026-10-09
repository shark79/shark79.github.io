import { defineProject } from "@/content/schema";

export default defineProject({
  id: "devteam",
  name: "Autonomous Dev Team on Open-Weight Models",
  start: "2026-07-06",
  period: "Jul to Aug 2026",
  brief:
    "Five AI agents with different jobs, including one whose only job is to break things, built and shipped a working app together for under twelve dollars.",
  tags: ["OpenCode", "OpenRouter", "Multi-Agent", "Kimi K3", "GLM 5.2"],
  links: [
    { label: "GitHub", href: "https://github.com/shark79/MultiAgent-Organization" },
  ],
  whatItDoes:
    "A small software team where every member is an AI agent with its own rules: an orchestrator that plans the work and decides when a phase is done, a backend developer, a frontend developer, a QA agent that writes and runs the tests, and an adversary that tries to break the running app on purpose. They hand work to each other, write every action to an audit log nobody can edit, and stop for a human sign-off before each new phase.",
  impact:
    "The whole build cost $11.56 in model spend, across 27.5 million tokens and 340 requests, on open-weight models rather than expensive frontier ones. An 88% cache hit rate did most of that work. The point isn't the price: the checkpoints, tests, and security pass are what made cheaper models good enough to trust.",
  whatILearned:
    "Agents are fine at writing code. What they're bad at is knowing when to stop. Nearly all my effort went into the rules around them: who can close a defect, when the orchestrator has to ask a human, and what actually counts as proof that something works.",
  stats: [
    { label: "Total model spend", value: "$11.56" },
    { label: "Tokens", value: "27.5M" },
    { label: "Requests", value: "340" },
    { label: "Cache hit rate", value: "88.2%" },
  ],
});
