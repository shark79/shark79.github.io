import { defineProject } from "@/content/schema";

export default defineProject({
  id: "campaignforge",
  name: "CampaignForge",
  start: "2026-09",
  period: "Sep 2026 · Hackathon",
  brief:
    "A team of AI agents that turns a campaign brief into finished images and social posts, and stops for a human yes before anything costs money or goes public.",
  tags: ["MCP", "TypeScript", "Multi-Agent", "OpenAI Images", "Human-in-the-loop"],
  links: [
    { label: "GitHub", href: "https://github.com/shark79/agent-harness-build" },
  ],
  whatItDoes:
    "You fill in a guided brief. A planner agent turns it into a few creative concepts, and nothing else happens until a person picks one. Then it generates the images, writes separate drafts for LinkedIn, Meta, and TikTok from that one approved concept, and shows everything right inside the chat. Publishing is its own step: every single post needs a fresh approval of that exact post.",
  impact:
    "The approval gates sit exactly where the money and the risk are: before image generation spends budget, and before anything goes out under a real brand's name. Publishing is switched off by default, and even when it's on, the publish tool is marked destructive so the system has to ask.",
  whatILearned:
    "The biggest risk in the project wasn't the AI, it was four social networks. Every connection had to be proven against test accounts before a live demo, because a demo that leans on someone else's service on a Saturday is a demo that can fail.",
  stats: [
    { label: "Networks drafted for", value: "3" },
    { label: "Human approval gates", value: "2" },
    { label: "Agent roles", value: "3" },
    { label: "Posts sent without a yes", value: "0" },
  ],
});
