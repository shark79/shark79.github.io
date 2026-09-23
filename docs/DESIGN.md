# Castle in the Clouds — Design Spec

Redesign of the portfolio (source in `site/`). Replaces the dark/indigo, read-vs-play,
minifigure-level site. Audience: a stranger who scanned a QR code at a tech conference,
on a phone, possibly non-technical. It must feel like a piece of art you play with, and
still read as a clear resume in under a minute.

## 1. Concept

The site is a **claymorphic castle floating on soft clouds**. Each door and window of the
castle is a room of content ("level"). The hero is a live three.js scene of the castle;
hovering/tapping an opening makes it respond (shutters part, warm lamplight, sign swings);
choosing it flies the camera to that opening, the door/shutters swing open, light spills
out, and the page carries you down into that room (the section). Every room you enter
lights its window in the castle for good — the castle fills with light as you explore.
Solving the small puzzles inside rooms earns **keys**. All six rooms lit → a pennant runs
up the top tower and a soft drift of petals/paper confetti falls.

Gamification is quiet and optional: nothing is locked, everything is readable immediately.
Games reward curiosity; they never gate content.

## 2. Visual language

**Light only.** No dark mode, no theme toggle (remove `next-themes`).

Palette (soft white base, pastel warm accents, black text — no neon, no saturated jumps):

| Token | Hex | Use |
|---|---|---|
| `--background` | `#FBF7F1` | page, warm soft white |
| `--surface` / `--card` | `#FFFCF7` | clay cards |
| `--foreground` | `#1B1714` | text, near black |
| `--muted-foreground` | `#5F574F` | secondary text (≥4.5:1 on bg) |
| `--border` | `#EDE3D6` | hairlines |
| `--blush` (red pastel) | `#F6B8AE` | clay fills, roofs |
| `--apricot` (orange pastel) | `#F9CBA0` | clay fills, roofs |
| `--butter` (yellow pastel) | `#FBE6A6` | clay fills, lamplight |
| `--cream` | `#FFF3DF` | sky base, highlights |
| `--primary` (deep terracotta) | `#C4523F` | the one strong accent: primary buttons, active states, focus ring, headline accent word. Text on it is white (≥4.5:1). |
| `--primary-soft` | `#F3D2C8` | hover fills |
| `--ink-orange` | `#A8561A` | small accent text on pastel only when needed (contrast-checked) |

Pastels are **fills**, never text colors. All text is `--foreground` or `--muted-foreground`
(or white on `--primary`).

**Claymorphism** — soft, inflated, tactile surfaces:
- Radius: 28px cards, 20px inner tiles, full pills for chips/buttons.
- Shadow recipe (define once as CSS utilities, e.g. `.clay`, `.clay-sm`, `.clay-inset`, `.clay-pressed`):
  - outer: `0 18px 40px -12px rgba(170,110,80,.28), 0 4px 10px -4px rgba(170,110,80,.18)`
  - inner highlight: `inset 0 2px 0 rgba(255,255,255,.9), inset 6px 8px 16px rgba(255,255,255,.65)`
  - inner shade: `inset -8px -10px 18px rgba(196,130,95,.14)`
  - pressed: invert to mostly inset, translateY(1px), scale(.985)
- Pastel clay tiles: fill with a subtle top-left → bottom-right gradient of the pastel (±4% lightness).
- Background: warm soft white with a very faint paper grain (tiny inline SVG noise, ≤3% opacity) and large blurred pastel "sky" blobs near the hero.

**Type** (via `next/font/google`, self-hosted; no CDN links):
- Display: **Fraunces** (variable; use `SOFT` 100 / `WONK` 0 axes where supported, weights 500–700, optical sizing). Soft, warm, premium — matches clay.
- Body: **Geist Sans**. Mono labels: **Geist Mono** (small caps-ish uppercase tracking for eyebrows, room numbers).
- Scale (mobile → desktop): h1 44→96px, h2 32→56px, h3 20→26px, body 16→17px, small 13–14px, mono labels 11px +0.18em tracking. Line-height 1.05 display, 1.6 body. Max measure ~64ch.

**Motion** — deliberate, never bouncy-cheap:
- Ease tokens: `--ease-out: cubic-bezier(.22,1,.36,1)`, `--ease-in-out: cubic-bezier(.65,0,.35,1)`, `--ease-spring: cubic-bezier(.34,1.56,.64,1)` (spring only on small press/pop feedback).
- Durations: 160ms (press), 320ms (hover), 600–900ms (reveals), 1.2–1.6s (camera flights).
- Section reveals on scroll: 16px rise + fade, staggered 60ms, once.
- `prefers-reduced-motion: reduce` → no camera flight, no parallax, no confetti; instant state changes with opacity fades only.

## 3. Page structure (single page, `site/src/app/page.tsx`)

1. **Nav** (fixed, clay pill floating 12px from top, centered on desktop; compact on mobile):
   wordmark "Shashank" (Fraunces) · room links · a tiny SVG castle whose six windows light up
   as rooms are visited + "3/6" + key count · "Say hi" primary pill. Mobile: menu button
   opens a clay sheet with the six rooms as door tiles.
2. **Hero / Castle hub** (`#top`, 100svh): the three.js castle (see §4). Overlaid copy:
   eyebrow `PROFILE.eyebrow`, h1 name `Shashank Jamkhandi`, the tagline
   "AI that helps. / And knows when **not** to." (accent on "not"), `PROFILE.intro`,
   and the prompt "Pick a door." Under/over the canvas: an accessible **door rail** — six
   clay buttons (room number, place name, label) that do exactly what clicking the 3D
   opening does. Desktop: copy top-left, castle right/center. Mobile: copy top, castle
   middle (≥45svh), door rail as a horizontally scrollable snap row at the bottom.
3. **Rooms** in `ROOMS` order — each a `<section id={room.id}>` with a consistent **room
   header**: small arched "door plaque" (mono `01 · The Study`), h2 label, one-line hint.
   Room content lives on clay cards:
   - `about` — bio paragraphs (`ABOUT`), stats as four pastel clay tiles (`STATS`),
     education, and the riddle (`ABOUT_QUIZ`) → earns key `about`.
   - `work` — all projects from `PROJECTS` (already sorted newest first — don't re-sort,
     don't hand-order). Timeline feel: year markers (2026 / 2025 / 2024) down the side.
     Each project is a clay card: period, name, brief, tags; expand to see
     "What it does / Impact / What I learned", links, and **"Make the call"** — the
     quiz; answering (right or wrong) reveals the explanation and the 4 stat tiles, and
     earns the key `project.id`. A "just show me" link reveals without the key. The
     reservation card also embeds the **Seat race** mini-game (key `seatrace`).
   - `experience` — `JOBS` as a vertical timeline of clay cards, `ACTIVITIES`, and the
     **Second opinion** game (existing hallucination game, `ACCURACY_NOTE` as its intro)
     → key `accuracy`.
   - `skills` — `SKILLS` categories as clay chip trays (chips gently lift on hover).
   - `gallery` — horizontal snap showreel of `PHOTOS` in clay frames. Photos are soft
     sepia/desaturated at rest, full colour on hover/focus/centre-on-mobile.
   - `contact` — big friendly close: "Send a message up the tower." email as the
     primary clay button, phone + LinkedIn + GitHub as secondary pills.
4. **Footer** — name, "source" link, "Built by hand · 2026".
5. **Toasts** — clay toast bottom-center on each room/key unlock ("The Study is lit ·
   2 of 6 rooms", "Key found · CampaignForge · 5 of 14"). Castle complete → a centered
   celebration card with a "Explore again" (reset) option.

Room visits are recorded by an IntersectionObserver when ≥40% of a section is on screen
(`visitRoom(id)` from `@/lib/progress`) — scrolling counts, not just clicking doors.

## 4. The castle (three.js, vanilla — no new runtime deps)

- **Composition**: a floating island of layered clouds with a castle: central keep (big
  arched main gate + drawbridge, round window high up, a balcony), left tower (window),
  right tower (window), a slim top turret with a perch/post-box and a pennant pole.
  Conical roofs in blush / apricot / butter, cream walls, subtle stone course lines
  (geometry bevels, not textures). Little details: tiny window boxes with flowers, a
  lantern by the gate, ivy dots, a weathervane, two or three clay birds circling slowly,
  a small hot-air balloon drifting far behind, distant cloud layers for depth.
- **Look**: clay — `MeshPhysicalMaterial`/`MeshStandardMaterial` with high roughness
  (0.7–0.9), light sheen, no metalness; soft PCF shadows; warm key light from upper left,
  cool-cream fill, hemisphere sky/ground; `ACESFilmic`/`AgX` tone mapping; warm cream fog;
  transparent or cream sky gradient matching `--background`. Geometry is procedural
  (rounded boxes/cylinders/cones/lathe) — **no external model or texture files**.
- **Openings** = the six `ROOMS` (use `room.opening` to place them). Each opening has:
  shutters/door leaves (hinged pivots), an interior warm point light (off until lit),
  and a small hanging clay sign with the room number.
- **Interaction**: raycast hover (desktop) → shutters part ~20°, sign swings, cursor
  pointer, tooltip label (HTML overlay projected to screen). Click/tap or door-rail button
  → camera eases (1.2–1.6s, `ease-in-out`) toward that opening, leaves swing fully open,
  light spills, then the page smoothly scrolls to `#<room.id>`. Visited rooms keep
  their window glowing (read `useProgress().rooms`). All six → pennant raises + confetti.
- **Idle life**: slow breathing bob of the island, clouds drifting, birds circling, gentle
  pointer/tilt parallax (±6°), never auto-spinning so far it hides the gate.
- **Performance & robustness**: `import("three")` lazily in an effect; DPR cap 1.75
  (1.5 on mobile); render loop paused when the hero is off-screen (IntersectionObserver)
  or the tab is hidden; dispose everything on unmount; handle resize; no layout shift
  (canvas container has fixed size from first paint, with a soft CSS poster behind it).
  No WebGL → the CSS poster + door rail still work. Keep the scene < ~60k triangles.
- **A11y**: canvas is `aria-hidden`; the door rail is the accessible control (real
  `<button>`s with labels). Visible focus rings on everything.

## 5. File ownership (for parallel builders)

| Area | Owner | Files |
|---|---|---|
| Content & progress | orchestrator (done) | `src/lib/content.ts`, `src/lib/progress.ts` |
| 3D castle hub | game-developer | `src/components/castle/**` (exports `CastleHub` from `castle-hub.tsx`), optionally `src/lib/castle/**` |
| Everything else | frontend-developer | `src/app/**`, `src/components/{nav,footer}.tsx`, `src/components/sections/**`, `src/components/ui/**`, `package.json` |

**Contract**: `CastleHub` is a client component with no required props:
`<CastleHub />` renders the full hero (canvas + overlaid copy + door rail) and reads
`PROFILE`, `ROOMS` from `@/lib/content` and `useProgress()` from `@/lib/progress`.
It scrolls to `#<room.id>` itself after the fly-in. It uses only the CSS tokens/utilities
defined in `globals.css` (`bg-background`, `text-foreground`, `.clay`, etc.).

## 6. Remove

Theme toggle + `next-themes`, the read/play mode gate (`lib/mode.ts`, `mode-gate.tsx`),
the particle name banner (`name-banner.tsx`, `cursor-driven-particles-typography.tsx`),
dotted surface, minifigure characters / level scenes (`lib/scenes.ts`,
`lib/characters.ts`, `level-stage.tsx`), `display-cards.tsx`, the old `level*.tsx` /
`achievement.tsx`, the logo showreel, and any leftover unused SVGs in `public/`
(`next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`). Keep `seat-race.tsx`
and `hallucination-game.tsx` logic, restyled, calling `solve("seatrace")` /
`solve("accuracy")`.

## 7. Reference bar (added after owner review — this overrides §3/§4 where they conflict)

The owner's quality references: vectrfl.com, skyclinics.al, aircenter.space,
**aimees-papercraft-world.com (favourite)**, kellydev.io. What we take from each:

- **Aimee's Papercraft World** — you are *inside* a crafted diorama. Content is part of
  the world (pinned paper signs, text on walls), every surface has tactile paper grain,
  and the frame is dense with tiny whimsical props (lanterns, animals, a pond, a piano).
  Scroll moves the camera through themed zones. → Our castle gets the same density of
  small handmade props and a **procedural grain on every material** (generate a small
  noise `CanvasTexture` at runtime and use it as roughness/bump/color variation — still no
  texture files). Room signs are pinned clay/paper plaques in the scene.
- **Vectr** — a single-tint 3D world the camera travels over as you scroll, a glowing
  path connecting places, a numbered step list (01–04) bottom-left synced to scroll, huge
  tightly-tracked display headline, minimal pill nav. → **Scroll-driven camera**: the
  castle is a persistent world, not just a hero. A soft golden dotted path winds between
  the doors and "fills" as rooms are visited. A numbered room index (01–06) synced to
  scroll sits bottom-left on desktop.
- **Skyclinics** — mist, clouds, silence, lots of whitespace, glass/pill nav, widely
  tracked small caps. → cloud layers and cream fog; restraint in chrome.
- **AIR** — confident giant letterforms interleaved with a white 3D sculpture. → the hero
  name set huge, the castle can sit *between/behind* the letters.
- **Kelly** — personality in the loader. → a short loader (≤1.2s, skipped when cached):
  the castle's pennant being hoisted, "Raising the drawbridge…", then the scene fades in.

### Revised castle architecture

- `CastleWorld` = a **fixed, full-viewport canvas behind the whole page** (z below content).
  The page scrolls over it. Camera keyframes: hero wide shot → one framing per room
  opening in `ROOMS` order → final pull-back on the finished castle for contact. Scroll
  position between section tops interpolates between keyframes (smooth, damped — never
  scroll-jacked; native scroll always wins). Entering a room's section swings that door
  or shutters open and lights it; `visitRoom(id)` still records it.
- Room content sits on solid clay cards *over* the world (legible — cards are opaque
  `--card`, never glass over busy 3D). Cards leave the room's opening visible (desktop:
  cards on one side, opening framed on the other; mobile: the world shows between cards
  and in each section's header band).
- Door rail buttons / nav links still work: they smooth-scroll to the section, and the
  camera follows because it's scroll-driven.
- Performance: render only while scrolling/animating + low-rate idle loop (≈30fps) for
  birds/clouds; stop entirely when the tab is hidden; DPR caps as §4. Reduced motion:
  camera jumps between keyframes with a crossfade, no idle animation.

## 8. Paintings in the castle (owner request)

The "Off the clock" photos also hang as framed paintings inside the castle's interiors
(`PAINTINGS` in `content.ts`: 2 in the Study, 2 in the Hall, 9 in the Gallery room).
Each opening has a shallow lit interior behind it; the Gallery section takes the camera
through the round window into a small gallery hall that pans along the paintings.
Textures are 640px web copies in `public/gallery/paintings/`, lazy-loaded near their room;
originals open in an HTML lightbox (`castle:painting` window event → `painting-lightbox.tsx`).
The HTML `#gallery` section remains as the accessible version, styled as a picture rail.
