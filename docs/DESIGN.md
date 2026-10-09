# Design

Monochrome editorial portfolio with two live three.js visuals. Earlier directions (dark/indigo,
then the claymorphic "castle in the clouds") are in git history and were retired by the owner.

## References

- **skyclinics.al**: the hero sky. Soft, bright cumulus with pale blue breaks, thin
  wide-tracked uppercase type, frosted pill nav.
- **aircenter.space**: the white slatted spiral sculpture on a white page, giant confident
  type, black pill buttons.

Both references use pre-rendered video. We don't copy their media. Both looks are rebuilt live
in code, so there are no image, video or model files for them.

## Page

1. **Hero** (`sections/hero.tsx`): fixed volumetric cloud sky (`visuals/cloud-scene.ts`).
   A CPU-baked, tileable 64³ value-noise volume uses billowed fine octaves; overlapping
   lobes give the banks rounded cumulus silhouettes. A GLSL3 raymarch through a slab at
   y −0.6 to 2.6 integrates Beer–Lambert absorption, powder lighting, four sun-shadow
   samples and atmospheric haze. Bright white tops, soft grey bases, pale blue breaks.
   The real `h1` is centred on two lines, light weight, 0.14em tracking, approximately
   44px on phones and up to 140px on wide screens. Dense foreground cloud banks
   (`visuals/wisp-scene.ts`) surround both lines and overlap the outer letters. This
   enlarged canvas extends 12% beyond each side and 55% above/below the heading, and
   sits explicitly above the real `h1` in an isolated stacking context. The banks use
   the same baked 3D noise as the sky, with their own volumetric lighting and slow drift.
   Alpha reaches 0.96 around the name and 0.82 across the letters, preserving some ink
   through the clouds. The centre stays open. The tagline and work link are centred.
2. **Work** (`sections/work.tsx`): one pinned scene. The spiral (`visuals/spiral-scene.ts`, 210
   instanced rounded slats on a helical spine, studio light and soft shadows) sits in a sticky
   stage and turns with scroll. The 11 projects hand over one by one around it: title and brief
   on the left, four numbers and the stack on the right, tick index on the far right.
   Desktop puts the spiral between the columns. Phones put it in the upper stage, with the text
   on one shared white wash below. Each project has 135vh of scroll and a proximity snap
   point at its midpoint. Fast-wheel checks traverse all eleven projects and leave the
   story normally, so proximity snap is retained.
3. **About, Experience, Toolkit**: editorial sections with a numbered label, a large light
   statement, and hairline-separated content.
4. **Gallery**: horizontal snap showreel, grayscale until hover or focus, full-size lightbox.
5. **Contact**: "Let's talk." and the email address.

## Sky-to-sculpture handoff

`visuals/sky-progress.ts` reads the work section's actual offset: flight is 0 at the top
and 1 when work pins. `setFly` moves the camera forward nine units, increases coverage
and resolves to exact white mist. The sky remains fixed behind both sections; the sticky
stage and spiral canvas stay transparent. During the latter half of the hero scroll,
`setEnter` lifts and turns the sculpture slightly while opening its white fog range from
14.1 to 26 and increasing canvas opacity. Sections after work have opaque white backgrounds.
Lazy-loaded scenes initialise at the current scroll position, including direct anchor visits.

## Rendering budget and accessibility

- Sky: 48 steps at 0.5 CSS-pixel resolution on desktop; 36 steps at 0.42 on small screens.
  Retina does not multiply the raymarch cost. Quality updates when crossing the breakpoint.
- Foreground banks: 18 steps on desktop and 14 on phones, with two sun-shadow samples.
  Render scale is 0.7 for large canvases and 0.6 for small canvases, independent of DPR.
- The sky stops its animation loop at flight = 1 and restarts on scrolling back. Foreground clouds and
  the spiral pause offscreen; all scenes pause when the document is hidden and dispose
  their GPU resources on unmount.
- Reduced motion: static sky with a simple crossfade, dense foreground framing rendered once, no
  entrance lift or idle spiral rotation, no scroll snap, and opacity-only reveals.
- WebGL fallback: a CSS sky gradient follows the same fade to white; all copy and links
  remain ordinary accessible DOM content.

## Verification

Verified October 9, 2026: TypeScript, ESLint and production static export. Served `site/out/`
and checked Chromium with `--use-gl=angle --ignore-gpu-blocklist` at 1440×900 and 390×844
(phone emulation, DPR 2), plus 320px width. 86 browser checks covered every section, four
hero-to-work positions, projects 1/4/8/11, fast scrolling through all projects, keyboard
project focus, lightbox arrows/Esc and focus restoration, mobile-menu navigation/Esc,
reduced motion and unavailable WebGL. No normal-rendering console errors or horizontal
overflow. The initial sky implementation also passed pause/restart, responsive resizing
and direct `#work` initialisation checks.

The dense foreground follow-up was rebuilt and checked at 1440×900, 390×844 (DPR 2)
and 320px: screenshots, substantial alpha coverage across the heading, the canvas above
and larger than the name, no overflow, offscreen pause/restart, three project slides,
every section, mobile menu, work link, and static reduced-motion framing. TypeScript,
ESLint and the production export passed again.
Phone checks use browser emulation; performance on physical phones still needs a device pass.

## Tokens (`app/globals.css`)

White `#ffffff`, ink `#0d0e0f`, secondary `#5c6166` (6.3:1), hairline `#e4e6e8`. The only colour
on the site comes from the sky and the photos. Type: **Onest** 300/400/500, plus **Geist Mono**
for the `.label` small caps (11px, 0.22em tracking). Motion: `--ease-out`
`cubic-bezier(.22,1,.36,1)`, 700–900ms reveals, staggered 70ms.

## Rules

- Content lives in `lib/content.ts`. Projects are sorted by `start` in code, so never hand-order
  them.
- The visuals lazy-load (`visuals/use-scene.ts`), so three.js stays out of the first bundle. If
  WebGL is missing, the CSS backdrop shows instead.
- Reduced motion: no idle animation, the spiral snaps to the scroll position, the sky
  crossfades, foreground clouds stay static, proximity snap is disabled, and reveals are opacity-only.
