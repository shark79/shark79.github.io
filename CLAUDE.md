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
- Photography lives in the **Gallery** section (`site/public/gallery/`) as a horizontally scrollable,
  softly desaturated showreel in clay frames (full color on hover/focus) — sits inside the warm
  light palette rather than competing with it. Keep new photos web-sized (~1600px, compressed) before adding.
- The overall feel should read as **art you interact with** — motion, easing, and hover/scroll
  responses should feel considered and premium, not like generic template animation. A deliberate
  wit/personality moment is welcome in the hero (currently "AI that helps. And knows when not to." —
  helpful *and* restrained, which is the positioning) — don't sand that down into generic
  resume-speak.
- **NDA**: the day job is at **DocAide.ai**. Never name a former or current employer's internal /
  proprietary tool, product feature, or codename anywhere on the site. Describe that work only as a
  skill or a use of a publicly known tool ("AWS Bedrock", "Claude", "Square"), never as
  "<internal product name>".

## Design Bar

- Treat this as a **high-end, designer-spec site**: buttery smooth transitions, deliberate easing
  curves, proper spacing/type scale, no jank.
- Follow core UI/UX fundamentals: type hierarchy and legible sizing at every breakpoint, sufficient
  contrast, generous whitespace, consistent spacing scale, accessible tap targets on mobile,
  no layout shift, fast load — keep dependencies and bundle weight deliberate, not default-bloated.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn**, statically exported
  (`output: "export"` in `next.config.ts`) and deployed to GitHub Pages via a GitHub Actions
  workflow (`.github/workflows/deploy.yml`) — Pages is configured for `build_type: workflow`, not
  branch-based deploy. Source lives entirely under `site/`.
- This is a **real migration away from the original vanilla HTML/CSS/JS site** (agreed upon
  explicitly before proceeding, per the flag-before-migrating rule below) — it now carries genuine
  build tooling and npm dependency maintenance that the static version didn't have. That tradeoff
  was made deliberately; don't revert to vanilla without the same kind of explicit sign-off.
- **Concept: "Castle in the Clouds"** (full spec in `docs/DESIGN.md`). The hero is a procedural
  three.js claymorphic castle (`site/src/components/castle/`, vanilla three, lazy-loaded, no model
  or texture files); each door/window is a room = a page section (`ROOMS` in `content.ts`). Visiting
  rooms lights windows; solving puzzles earns keys (`site/src/lib/progress.ts`). Games reward
  curiosity and never gate content.
- **All copy lives in `site/src/lib/content.ts`.** Projects carry an ISO `start` and are sorted
  newest-first in code — add a project there with its date, never hand-order the list.
- Components follow the shadcn convention: shared/reusable primitives in `site/src/components/ui/`,
  page sections (rooms) in `site/src/components/sections/`, one section per file, composed in
  `site/src/app/page.tsx`.
- Theme: **light only, claymorphism** — soft warm white (`#FBF7F1`), pastel blush / apricot / butter
  as *fills*, near-black text, one deep terracotta accent (`--primary`) spent deliberately (primary
  buttons, active states, headline accent word). No dark mode, no neon, no saturated jumps. Tokens
  and the `.clay*` utilities are defined once in `site/src/app/globals.css`; components consume
  tokens (`bg-background`, `text-foreground`, `bg-blush`, …) — never hardcode a hex color in a
  component when a token exists (the 3D scene's material colors are the one exception).
- Type: **Fraunces** (display, `--font-display`), **Geist Sans** (body), **Geist Mono**
  (labels) — all via `next/font/google`, self-hosted at build time. No font CDN `<link>` tags.
- **Flag before migrating further**: if a future change would require introducing another framework,
  a different component library, a new build tool, or a paid service, flag the tradeoff explicitly
  and get sign-off before doing it — don't silently swap architecture again.

## Working Style

- Bias toward concrete, testable changes: after any animation/layout/content change, actually run
  `npm run build` in `site/`, serve `site/out/`, and check it in a browser (desktop + mobile
  viewport) rather than assuming it looks right.
- Keep image assets web-sized (resize/compress before committing) — this is a mobile-first,
  fast-load site; don't commit full-resolution phone photos.
