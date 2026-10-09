import { defineProject } from "@/content/schema";

export default defineProject({
  id: "summarizers",
  name: "One Summarizer, Three Ways",
  start: "2025-03",
  period: "Mar 2025",
  brief:
    "The same web-page summarizer built three times: on OpenAI in the cloud, on a local Llama 3 that never leaves the laptop, and on Claude through AWS Bedrock.",
  tags: ["Python", "OpenAI", "Ollama", "AWS Bedrock", "spaCy"],
  links: [{ label: "GitHub", href: "https://github.com/shark79/Gen-AI-projects" }],
  whatItDoes:
    "It pulls the readable text out of any web page and turns it into a clean summary. Each version swaps only the model underneath, so quality, speed, and privacy can be compared side by side. A fourth notebook measures how close words and sentences are in meaning.",
  impact:
    "My first hands-on comparison of the model providers I now use every day, and a big part of why moving between models in production later felt routine instead of risky.",
  whatILearned:
    "Keeping the model swappable behind one small interface costs almost nothing on day one and saves you on day three hundred.",
  stats: [
    { label: "Model providers", value: "3" },
    { label: "Runs fully offline", value: "1" },
    { label: "Notebooks", value: "4" },
    { label: "Lines changed to swap", value: "Few" },
  ],
});
