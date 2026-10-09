import { defineProject } from "@/content/schema";

export default defineProject({
  id: "jobfinder",
  name: "Job Finder, Visa-Aware Job Search",
  start: "2026-07-28",
  period: "Jul 2026",
  brief:
    "Finds jobs at companies that genuinely sponsor visas, using the government's own filing data, then tailors a resume, finds a recruiter, and drafts the email. You hit send, it never does.",
  tags: ["MCP", "npm", "Node.js", "Apollo.io", "DOL Open Data"],
  links: [
    { label: "GitHub", href: "https://github.com/shark79/job-finder" },
    { label: "npm", href: "https://www.npmjs.com/package/@sharkbuilds/job-finder" },
  ],
  whatItDoes:
    "It checks whether a company has a real history of sponsoring visas using the Department of Labor's own quarterly filings, not a crowdsourced list that's usually out of date. If it does, it checks that company's actual job board, rewrites your resume's wording for that posting without touching the formatting, confirms it still fits on one page, finds a recruiter, drafts a personal email, and logs everything so nothing gets sent twice.",
  impact:
    "It's published on npm, so anyone can run it with a single command. The part I'm proudest of is the guardrail: the agent physically can't send an email, because the send tool was never handed to it. It can only create drafts you read first.",
  whatILearned:
    "Deciding what an agent isn't allowed to do mattered more than what it can do. Taking the send capability away entirely is a much stronger promise than a prompt asking the model not to send.",
  stats: [
    { label: "Job boards queried live", value: "3" },
    { label: "Emails it can send", value: "0" },
    { label: "Published npm package", value: "1" },
    { label: "Source of sponsor data", value: "DOL" },
  ],
});
