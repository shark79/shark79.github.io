import { defineProject } from "@/content/schema";

export default defineProject({
  id: "skillsynq",
  name: "SkillSynQ",
  start: "2025-02-01",
  period: "Feb to Mar 2025",
  brief:
    "Reads a job posting, works out which skills you're missing, and signs you up for the right courses. Serverless from start to finish.",
  tags: ["AWS Lambda", "OpenAI", "DynamoDB", "Selenium"],
  whatItDoes:
    "It pulls live job postings and course listings, compares them with OpenAI, and shows exactly which skills you're missing for a role. Approve a course match and it enrols you automatically, no extra steps.",
  impact:
    "Built in 36 hours at ASU's GenAI hackathon and picked for the showcase demos. Small tool, genuinely annoying problem: nobody wants to compare a job description against a course catalog by hand.",
  whatILearned:
    "Scraping live data is messier than any tutorial admits. I spent more time on broken page layouts and rate limits than on the matching logic.",
  stats: [
    { label: "Empty repo to demo", value: "36h" },
    { label: "Picked for showcase", value: "Yes" },
    { label: "Servers to manage", value: "0" },
    { label: "Steps to enrol", value: "1" },
  ],
});
