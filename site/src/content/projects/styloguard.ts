import { defineProject } from "@/content/schema";

export default defineProject({
  id: "styloguard",
  name: "StyloGuard, Authorship Verification",
  start: "2025-02-15",
  period: "Feb to May 2025",
  brief:
    "Checks whether a piece of writing actually matches someone's usual style, instead of just checking whether the words were copied.",
  tags: ["Python", "PyTorch", "SQL", "NLP"],
  links: [{ label: "GitHub", href: "https://github.com/shark79/StyloGuard" }],
  whatItDoes:
    "It looks at ten features of how someone writes, like sentence length, word choice, and punctuation habits, and compares new writing against that person's usual style. It flags submissions that don't match, even when no text was copied.",
  impact:
    "Most plagiarism tools only check for copied text, which paraphrasing tools get around easily. Style is a lot harder to fake.",
  whatILearned:
    "Catching real inconsistencies without flagging normal variation was the hardest part. People's writing shifts more than you'd expect, even within the same week.",
  stats: [
    { label: "Style features compared", value: "10" },
    { label: "Text it needs copied", value: "0" },
    { label: "Beats paraphrasing", value: "Yes" },
    { label: "Built over", value: "4 mo" },
  ],
});
