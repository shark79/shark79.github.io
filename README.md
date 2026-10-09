# shark79.github.io

Personal portfolio for **Shashank Jamkhandi**, AI Engineer: a live cloud sky, then a white
spiral sculpture that turns as eleven projects hand over one to the next.

🌐 **Live site:** [shark79.github.io](https://shark79.github.io)

---

## About

Most visitors arrive by scanning a QR code at a conference, on a phone. The site is meant to
read in a minute and feel like an object worth scrolling.

- **Hero**: a volumetric cloud sky (three.js, CPU-baked 3D noise and raymarched lighting)
  behind a large centred name. A dense foreground cloud field fills the hero, with a soft
  clearing across the letters and a centred work link below. Scrolling clears the name
  first, then dissolves the surrounding banks.
- **Transition**: scrolling flies through the fixed sky into white mist, where the spiral
  emerges with fog and a gentle lift. Its visual stage extends behind the hero, with
  feathered cloud edges so there is no hard section cut. Reduced motion uses a simple crossfade.
- **Work**: a pinned, scroll-driven scene. A white slatted spiral, built from 210 instanced
  slats, turns while each project transitions in with its numbers and stack on 80% white
  glass panels that keep the copy readable over the sculpture. Each project
  has 135vh of scroll with proximity snap.
- **About, Experience, Toolkit, Gallery, Contact**: monochrome editorial sections. The
  gallery is a grayscale showreel with a full-size lightbox. Vertical scrolling stays with
  the page; horizontal gestures, swipes and arrow buttons browse the photos.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4 + three.js**, statically
exported and deployed to GitHub Pages. Fonts: Onest and Geist Mono via `next/font`. Design
notes: [`docs/DESIGN.md`](docs/DESIGN.md).

## Local development

```bash
cd site
npm install
npm run dev       # http://localhost:3000
npm run lint
npm run build     # static export to site/out/
python3 -m http.server 8765 --directory out  # preview the export
```

## Deployment

Pages deploys through **GitHub Actions**, not from a branch. Pushing to `main` triggers
`.github/workflows/deploy.yml`, which builds `site/` with `next build`
(`output: "export"`) and publishes `site/out/`.

## Updating content

All copy lives in [`site/src/lib/content.ts`](site/src/lib/content.ts): profile,
projects, experience, skills and photos. To add a project, add an entry with an ISO `start`
date. The list is sorted newest-first in code, so never hand-order it.

## Structure

```
site/src/
  app/                  layout, page, globals.css (tokens)
  components/sections/  hero, work, about, experience, skills, gallery, contact
  components/visuals/   sky, foreground clouds, spiral, shared scroll progress, lazy scene hook
  components/ui/        section head, reveal observer, photo lightbox
  lib/content.ts        every word on the site
site/public/gallery/    photos (+ paintings/: 640px web copies used in the showreel)
```

The sky uses 48 raymarch steps at half resolution on desktop, 36 at 0.42 on phones,
and stops at the end of the transition. Scenes pause when hidden; the name remains a real
heading, and a CSS sky is available without WebGL. No new media assets or dependencies.

Validated with TypeScript, ESLint, the production export and 86 Chromium checks across
1440px, 390px and 320px widths, including project scrolling/focus, lightbox, mobile menu,
reduced motion and WebGL fallback. See the design notes for the rendering details.
