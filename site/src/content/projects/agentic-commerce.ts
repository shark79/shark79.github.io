import { defineProject } from "@/content/schema";

export default defineProject({
  id: "agentic-commerce",
  name: "Agentic Commerce Checkout",
  start: "2026-10",
  period: "Oct 2026 · Stripe workshop",
  brief:
    "An AI shopping agent that finds products in chat and pays a separate merchant through Google's Universal Commerce Protocol, using a single-use Stripe token so the merchant never sees the card.",
  tags: ["UCP", "Stripe", "Node.js", "Express", "Next.js"],
  links: [{ label: "GitHub", href: "https://github.com/shark79/agentic-commerce-ucp" }],
  whatItDoes:
    "You chat with the agent and it picks the products. It opens a checkout session at the merchant, adds your address and shipping, then pays. Instead of your card, the merchant receives a token that works once, for that exact amount.",
  impact:
    "Built on Stripe's workshop starter kit. I wrote the commerce and payment layer: the full checkout lifecycle on the merchant side, the agent's client for it, the payment-token issuing, and card setup with Stripe Elements. A declined card comes back as a clear message the agent can explain, not a crash.",
  whatILearned:
    "When an agent spends money, three parties have to trust each other: you, the agent, and the shop. A shared checkout standard plus a narrowly scoped, single-use payment credential answers that far better than handing a card number around.",
  stats: [
    { label: "Checkout endpoints built", value: "5" },
    { label: "Card details the shop sees", value: "0" },
    { label: "Parties in every purchase", value: "3" },
    { label: "Uses per payment token", value: "1" },
  ],
});
