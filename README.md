# shark79.github.io

Personal portfolio for **Shashank Jamkhandi**, AI Engineer: a claymorphic castle floating in
the clouds, where every door and window opens onto a room of the resume.

🌐 **Live site:** [shark79.github.io](https://shark79.github.io)

---

## About

Most visitors arrive by scanning a QR code at a conference, on a phone, knowing nothing about
me. The site is meant to be something you play with first and read as a resume second.

- **The castle** is a procedural three.js scene (no model or texture files) that stays fixed
  behind the page. As you scroll, the camera moves from door to door. Each room's door opens
  when you reach it, and its window stays lit afterwards.
- **Rooms** (page sections): The Study (about), The Workshop (projects), The Hall
  (experience), The Tool Room (skills), The Gallery (photos, also hung as paintings inside
  the castle), The Post Tower (contact).
- **Keys**: each project asks one "make the call" question, and there are two mini-games
  (Seat race, Second opinion). Games are optional and never lock content.
- **Look**: light only. Soft warm white with pastel blush / apricot / butter clay fills,
  near-black text, one terracotta accent. Fonts: Fraunces, Geist Sans and Geist Mono via
  `next/font` (self-hosted at build time).

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4 + three.js**, statically
exported and deployed to GitHub Pages. Full design spec: [`docs/DESIGN.md`](docs/DESIGN.md).

## Local development

```bash
cd site
npm install
npm run dev       # http://localhost:3000
npm run lint
npm run build     # static export to site/out/
```

## Deployment

Pages deploys through **GitHub Actions**, not from a branch. Pushing to `main` triggers
`.github/workflows/deploy.yml`, which builds `site/` with `next build`
(`output: "export"`) and publishes `site/out/`.

## Updating content

All copy lives in [`site/src/lib/content.ts`](site/src/lib/content.ts): profile, rooms,
projects, experience, skills and photos. To add a project, add an entry with an ISO `start`
date. The list is sorted newest-first in code, so never hand-order it.

## Structure

```
site/src/
  app/                  layout, page, globals.css (tokens + .clay utilities)
  components/castle/    three.js castle world, camera, interiors, loader, hero overlay
  components/sections/  one file per room
  components/ui/        shared primitives (room shell, quiz card, toasts, lightbox, …)
  lib/content.ts        every word on the site
  lib/progress.ts       rooms visited + keys earned (saved in localStorage)
site/public/gallery/    photos (+ paintings/: 640px copies used as 3D textures)
```
