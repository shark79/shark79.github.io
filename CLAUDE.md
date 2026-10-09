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
- Photography lives in the **Gallery** section (`site/public/gallery/`, 640px web copies in
  `gallery/paintings/`) as a horizontally scrollable grayscale showreel (full color on hover/focus)
  with a full-size lightbox. Keep new photos web-sized (~1600px, compressed) before adding.
- The overall feel should read as **art you interact with** — motion, easing, and hover/scroll
  responses should feel considered and premium, not like generic template animation. A deliberate
  wit/personality moment is welcome in the hero — don't sand that down into generic
  resume-speak. The hero leads with the name and work link; the owner removed the tagline
  (Oct 2026), so don't restore it.
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

- **Next.js (App Router) + TypeScript + Tailwind CSS + three.js**, statically exported
  (`output: "export"` in `next.config.ts`) and deployed to GitHub Pages via a GitHub Actions
  workflow (`.github/workflows/deploy.yml`) — Pages is configured for `build_type: workflow`, not
  branch-based deploy. Source lives entirely under `site/`.
- This is a **real migration away from the original vanilla HTML/CSS/JS site** (agreed upon
  explicitly before proceeding, per the flag-before-migrating rule below) — it now carries genuine
  build tooling and npm dependency maintenance that the static version didn't have. That tradeoff
  was made deliberately; don't revert to vanilla without the same kind of explicit sign-off.
- **Design: monochrome editorial + two live three.js visuals** (full spec in `docs/DESIGN.md`):
  a procedural cloud-sky shader hero (Skyclinics reference) and a white slatted spiral sculpture
  that turns with scroll while the projects transition around it (AIR reference). Both are code,
  not video — never lift media from reference sites. The castle direction was retired by the owner
  (Oct 2026); don't bring it back.
- **All copy lives in `site/src/lib/content.ts`.** Projects carry an ISO `start` and are sorted
  newest-first in code — add a project there with its date, never hand-order the list.
- Page sections live in `site/src/components/sections/` (one per file), visuals in
  `site/src/components/visuals/`, small shared pieces in `site/src/components/ui/`, composed in
  `site/src/app/page.tsx`.
- Theme: **light, monochrome** — white page, near-black ink, one grey (`--muted-foreground`);
  the only colour comes from the sky and the photos. Tokens defined once in
  `site/src/app/globals.css`; no hardcoded hex in components when a token exists.
- Type: **Onest** (300/400/500) and **Geist Mono** (the `.label` small caps) via
  `next/font/google`, self-hosted at build time. No font CDN `<link>` tags.
- **Flag before migrating further**: if a future change would require introducing another framework,
  a different component library, a new build tool, or a paid service, flag the tradeoff explicitly
  and get sign-off before doing it — don't silently swap architecture again.

## Working Style

- Bias toward concrete, testable changes: after any animation/layout/content change, actually run
  `npm run build` in `site/`, serve `site/out/`, and check it in a browser (desktop + mobile
  viewport) rather than assuming it looks right.
- Keep image assets web-sized (resize/compress before committing) — this is a mobile-first,
  fast-load site; don't commit full-resolution phone photos.
