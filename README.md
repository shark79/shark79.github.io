# shark79.github.io

Personal portfolio site for **Shashank Jamkhandi** — AI Engineer / GenAI Developer.

🌐 **Live site:** [shark79.github.io](https://shark79.github.io)

---

## About

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn**, statically exported
and deployed to GitHub Pages via GitHub Actions. Source lives in [`site/`](site/).

**Fonts:** Space Grotesk (display), Geist Sans (body), Geist Mono / DM Mono (labels) — via `next/font`, self-hosted at build time, no font CDN.
**Theme:** Light/dark, toggle via `next-themes`, indigo/violet accent.
**Hosted:** GitHub Pages, deployed from the `deploy.yml` Actions workflow on every push to `main`.

---

## Sections

- **Hero** — dotted-surface WebGL background (Three.js), animated headline
- **Tools showreel** — dual-row scrolling marquee of the stack actually used
- **01 About** — bio, stats, education
- **02 Work** — featured project stack + full project list
- **03 Experience** — DocAide.ai & ASU timeline
- **04 Skills** — GenAI/LLM, Models & APIs, AWS & Backend, Tools & Domain
- **05 Gallery** — monochrome scrollable photo showreel
- **Contact** — email, phone, LinkedIn, GitHub

---

## Local development

```bash
cd site
npm install
npm run dev       # http://localhost:3000
npm run build     # static export to site/out/
```

## Deployment

Pages is configured for **GitHub Actions** deploys (not branch-based). Pushing to `main`
triggers `.github/workflows/deploy.yml`, which builds `site/` with `next build`
(`output: "export"`) and publishes `site/out/` to Pages. No manual build/commit step needed.

## Updating content

Page copy and data live in `site/src/components/sections/*.tsx` (one file per section —
`hero`, `about`, `projects`, `experience`, `skills`, `gallery`, `contact`). Photos live in
`site/public/gallery/`.
