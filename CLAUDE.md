# Portfolio Website — Design & Content Guidelines

Personal portfolio for Shashank Jamkhandi (AI Engineer), published on GitHub Pages. This file
captures standing instructions so they don't need to be repeated on every design/content change.

## Purpose & Context

- Primary distribution channel: a **QR code** handed out at generic tech conferences (not just AI/ML
  audiences), replacing paper resumes. Assume the visitor knows nothing about the owner and may not
  be technical.
- Goal: make someone stop scrolling and stay, even if they aren't in this field. The site must work
  as a piece of **visual/interactive design first**, a resume second.
- Mobile is the primary viewing context — most conference visitors will scan the QR code and view on
  their phone. **Design mobile-first, verify responsiveness at every change**, not as an afterthought.

## Tone & Content Balance

- **75% professional / 25% personal.** Projects and experience should read simple, clear, and
  scannable — not jargon-heavy or "boasting." Prioritize clarity over technical depth; a non-technical
  visitor should understand what a project *does* and *why it matters* in one glance.
- Weave in **photography** (personal interest) as an ambient/textural element throughout the site —
  not a separate portfolio dump. Use it to give visitors breathing room between project sections and
  to signal personality. Photography assets will be added later under a `pictures/` (or similar)
  folder in this repo — build the layout/components to consume images from there, but do not block
  work on their absence (use placeholders).
- The overall feel should read as **art you interact with** — motion, easing, and hover/scroll
  responses should feel considered and premium, not like generic template animation.

## Design Bar

- Treat this as a **high-end, designer-spec site**: buttery smooth transitions, deliberate easing
  curves, proper spacing/type scale, no jank.
- Follow core UI/UX fundamentals: type hierarchy and legible sizing at every breakpoint, sufficient
  contrast, generous whitespace, consistent spacing scale, accessible tap targets on mobile,
  no layout shift, fast load (this is a static single-page GitHub Pages site — keep it lightweight,
  avoid bloating with unused component libraries).
- Current site is a single vanilla HTML/CSS/JS file (`index.html`) with a dark theme
  (`#232323` background, `#c8b49a` accent, Saira font), custom cursor, page loader, scroll progress
  bar, and sections: hero, about, projects, experience, skills, contact. New animation work should
  either extend this vanilla approach or be a deliberate, agreed-upon migration — don't silently
  introduce a framework (React/Framer Motion/etc.) without flagging the tradeoff first.
- When pulling inspiration/components from **Framer, reactbits.dev, refero.design, or
  ui.aceternity.com**, port the underlying animation technique (CSS/JS/SVG) rather than assuming a
  React/npm dependency — this repo is currently framework-free. Call out clearly when a component
  requires a build step so we can decide whether it's worth introducing tooling.

## Working Style

- Bias toward concrete, testable changes: after any animation/layout change, actually load the page
  (or describe how you verified it) rather than assuming it looks right.
- Keep the single-file structure unless there's a clear reason to split — this is a resume site, not
  an app; avoid over-engineering the build.
