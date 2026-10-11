import { defineProject } from "@/content/schema";

export default defineProject({
  id: "simulator",
  name: "Data Center Energy Simulator",
  start: "2024-12",
  period: "Dec 2024 to Apr 2025 · ASU",
  brief:
    "Pick how an AI data center gets its power, set a budget, and watch the cost, emissions, and waste change as you go.",
  tags: ["Python", "Streamlit", "Pandas", "Plotly"],
  links: [{ label: "GitHub", href: "https://github.com/shark79/Simulator" }],
  whatItDoes:
    "Six energy sources, solar, wind, hydro, nuclear, gas, and coal, each with real 2023 figures for output, cost, CO₂, and toxic waste. You mix them under a budget and it scores the result for sustainability, with charts showing where the money and the emissions actually go.",
  impact:
    "Built for a responsible-AI program at ASU and used in a classroom activity where students budgeted their own energy mix. It turns \"AI uses a lot of energy\" from a headline into a tradeoff you have to make yourself.",
  whatILearned:
    "People remember a decision they made far better than a number they read. The interactive part mattered more than perfect data.",
  stats: [
    { label: "Energy sources", value: "6" },
    { label: "Real data from", value: "2023" },
    { label: "Used in class", value: "Yes" },
    { label: "Score", value: "0–100" },
  ],
});
