import { defineProject } from "@/content/schema";

export default defineProject({
  id: "researchpanel",
  name: "Adversarial Research Panel",
  start: "2026-08",
  period: "Aug 2026",
  brief:
    "Four research agents look at an idea from engineering, marketing, product, and finance, cite every claim, then argue with each other. They report. They don't decide.",
  tags: ["Anthropic API", "FastAPI", "Python", "Multi-Agent", "Web Search"],
  links: [
    { label: "GitHub", href: "https://github.com/shark79/agentic-workflow-claude" },
  ],
  whatItDoes:
    "Give it a feature idea. Each agent answers its own question: can it be built, is there a market, does it fit the product, does the money come back. They search the web and have to cite every line. Switch on adversarial mode and they challenge each other's findings, then defend their own. Results land in four tabs: findings, verdicts, the debate, and a full audit trail.",
  impact:
    "Two rules are enforced in code, not asked for in a prompt. Any citation pointing at a page the search never actually returned is thrown out. And an agent that files ten findings doesn't get ten times the say: every agent carries the same total weight, so being loud dilutes you.",
  whatILearned:
    "A prompt that says \"please cite real sources\" is a wish. A check that compares every link against what the search actually returned is a guarantee. I also learned to show the cost before spending it: the app estimates every run and asks first.",
  stats: [
    { label: "Research agents", value: "4" },
    { label: "Invented citations kept", value: "0" },
    { label: "Tests, no network needed", value: "23" },
    { label: "Full debate, ballpark", value: "$2.45" },
  ],
});
