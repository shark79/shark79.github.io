import { defineProject } from "@/content/schema";

export default defineProject({
  id: "reservation",
  name: "Reservation System with Failure Handling",
  start: "2026-07-31",
  period: "Jul to Aug 2026",
  brief:
    "A seat-booking app built to survive the exact bugs that take down real booking and payment systems, with tests that trigger those bugs on purpose.",
  tags: ["Reboot", "Python", "React", "MCP", "Durable Workflows"],
  links: [
    {
      label: "GitHub",
      href: "https://github.com/shark79/Reservation-System-Failure-Handling",
    },
  ],
  whatItDoes:
    "Four things quietly break booking systems in production: two people buying the same seat in the same instant, a retried request charging a card twice, a crash landing between taking the payment and sending the confirmation, and someone confirming a seat they never held. This handles all four by how it's built, not by patching each one where it shows up. It also runs inside an AI chat window, where one of its tools opens a real, clickable seat map right in the conversation.",
  impact:
    "Each of those four failures has an automated test that actually causes it, racing two real requests against each other and killing the process mid-payment, then checks the system still landed in the right state. That matters more now that AI agents call backends directly: an agent retries anything ambiguous and fires parallel calls far more often than a person clicking a button.",
  whatILearned:
    "Correctness is much cheaper when it comes from the architecture than when it depends on someone remembering to add a lock everywhere it's needed. Also, watching a real interface render inside a chat feels genuinely different from watching an AI describe one.",
  stats: [
    { label: "Failure modes survived", value: "4" },
    { label: "Tests that cause them", value: "4" },
    { label: "Front ends, one backend", value: "2" },
    { label: "Hand-written locks", value: "0" },
  ],
});
