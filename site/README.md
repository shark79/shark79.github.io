# Portfolio app

Next.js 16 App Router, TypeScript, Tailwind CSS v4 and three.js r185. Statically
exported for GitHub Pages. The repository [README](../README.md) and
[design notes](../docs/DESIGN.md) describe the content and visual direction.

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
npm run build
python3 -m http.server 8765 --directory out
```

The build fetches Onest and Geist Mono through `next/font/google` and self-hosts
the resulting fonts. Preview the export at http://localhost:8765.

All copy lives in `src/lib/content.ts`. Projects are sorted by their ISO `start`
date. Client visuals lazy-load through `use-scene.ts`: a volumetric sky, dense
foreground clouds filling the hero with a clearing over the real heading, and a scroll-driven
slat spiral with translucent white glass behind the project copy and stats.
The sky-to-work handoff shares scroll geometry through `sky-progress.ts`.

Before shipping visual changes, check the static export in Chromium at desktop
1440×900 and phone 390×844 (DPR 2), with `--use-gl=angle --ignore-gpu-blocklist`.
Include 320px overflow, hero-to-work positions, project scrolling and keyboard
focus, all sections, lightbox keys, mobile menu, reduced motion and WebGL fallback.
Pushing to `main` triggers the Pages workflow; get owner approval before pushing
or opening a pull request.
