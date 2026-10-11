import { defineProject } from "@/content/schema";

export default defineProject({
  id: "agentcore",
  name: "Production Agentic AI on AWS Bedrock AgentCore",
  start: "2026-05",
  period: "May 2026",
  brief:
    "Several AI agents split up a task instead of one model trying to do everything. Runs on AWS Bedrock AgentCore, coordinated with CrewAI, and connected to outside tools through MCP.",
  tags: ["AWS Bedrock AgentCore", "CrewAI", "MCP", "OpenTelemetry"],
  whatItDoes:
    "Instead of one model handling an entire task, the work is split across agents that each own a piece of it and hand off to each other. It's built on AWS Bedrock AgentCore, coordinated with CrewAI, and uses MCP so agents can call outside tools. The example is a travel agent that researches, plans, and recommends a full itinerary on its own.",
  impact:
    "Most serious AI products will need this shape eventually: several focused agents instead of one giant prompt. It also pushed me to learn a very new part of AWS before most people had touched it.",
  whatILearned:
    "Multi-agent systems break differently from single-agent ones. Getting agents to hand off cleanly and stay in their own lane took more design than the AI logic did.",
  stats: [
    { label: "Agents sharing the task", value: "4" },
    { label: "One giant prompt", value: "0" },
    { label: "Tool protocol", value: "MCP" },
    { label: "Traced end to end", value: "Yes" },
  ],
});
