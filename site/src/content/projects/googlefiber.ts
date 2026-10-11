import { defineProject } from "@/content/schema";

export default defineProject({
  id: "googlefiber",
  name: "Google Fiber Customer Support Analysis",
  start: "2024-09",
  period: "Sep to Nov 2024",
  brief:
    "Dug into support call data and found exactly where the biggest customer problems were coming from.",
  tags: ["Tableau", "BigQuery", "ETL", "Python"],
  whatItDoes:
    "I analyzed patterns in repeat support calls to find where the real problems started. One market region alone was behind 62% of all repeat calls.",
  impact:
    "That kind of finding changes where a company puts its resources. Instead of spreading fixes evenly, the team could focus on the one region causing most of the pain, with dashboards to track it going forward.",
  whatILearned:
    "The best insights often sit in data nobody sliced the right way. Not a complicated model, just the right question asked of the right data.",
  stats: [
    { label: "Repeat calls, one region", value: "62%" },
    { label: "Regions analysed", value: "8" },
    { label: "Dashboards shipped", value: "Live" },
    { label: "Models required", value: "0" },
  ],
});
