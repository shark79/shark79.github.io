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
   44px on phones and up to 140px on wide screens. The foreground cloud field
   (`visuals/wisp-scene.ts`) fills the entire hero with broad, irregular banks independent
   of the heading's shape. It sits above the real `h1`; the role, work link and scroll cue
   remain above the field. The banks use the same baked 3D noise as the sky, with their
   own volumetric lighting and slow drift. Alpha reaches 0.97 throughout the surrounding
   space, thinning to about 0.16 across the heading for clear letters. A softly feathered,
   noise-disturbed clearing follows the heading's actual bounds and updates with font or
   viewport size changes. Scroll removes the veil over the letters by 28% of the hero's
   travel, then fades the surrounding field out by 85%; scrolling back restores it.
   The lower 18% of the field is feathered to avoid a horizontal boundary. A centred
   work link follows the name; there is no tagline.
2. **Work** (`sections/work.tsx`): one pinned scene. The spiral (`visuals/spiral-scene.ts`, 210
   instanced rounded slats on a helical spine, studio light and soft shadows) sits in a sticky
   stage and turns with scroll. The 11 projects hand over one by one around it: title and brief
   on the left, four numbers and the stack on the right, tick index on the far right.
   Desktop puts the spiral between the columns. Project text and stats sit on separate
   translucent white glass panels: 80% white, 20px backdrop blur, 24px corners, a bright
   border and a restrained shadow. Phones use one padded glass panel over the shared
   white wash below the sculpture. Inactive panels fade out as a whole so their surfaces
   don't stack over the visible project. Each project has 135vh of scroll and a proximity snap
   point at its midpoint. Fast-wheel checks traverse all eleven projects and leave the
   story normally, so proximity snap is retained.
3. **About, Experience, Toolkit**: editorial sections with a numbered label, a large light
   statement, and hairline-separated content.
4. **Gallery**: horizontal snap showreel, grayscale until hover or focus, full-size lightbox.
   Vertical wheel input always scrolls the page, including over photos and at either end
   of the strip. Browse photos with native horizontal trackpad gestures, touch swipes or
   desktop arrow buttons; the gallery never intercepts vertical wheel input.
5. **Contact**: "Let's talk." and the email address.

## Sky-to-sculpture handoff

`visuals/sky-progress.ts` reads the work section's actual offset: flight is 0 at the top
and 1 when work pins. `setFly` moves the camera forward nine units, increases coverage
and resolves to exact white mist. The sky remains fixed behind both sections. The spiral
has its own transparent sticky visual stage extending upward by the hero's full height
(`max(100svh, 560px)`). It starts at the same viewport top as the sky, rather than being
clipped at the work section boundary, and leaves with the last project. The project copy
keeps its existing sticky stage. The hero paints above the spiral so remaining cloud banks
veil its entrance; a mask feathers the sculpture at the canvas edges. During the latter half of the hero scroll,
`setEnter` lifts and turns the sculpture slightly while opening its white fog range from
14.1 to 26 and increasing canvas opacity. Sections after work have opaque white backgrounds.
Lazy-loaded scenes initialise at the current scroll position, including direct anchor visits.

## Rendering budget and accessibility

- Sky: 48 steps at 0.5 CSS-pixel resolution on desktop; 36 steps at 0.42 on small screens.
  Retina does not multiply the raymarch cost. Quality updates when crossing the breakpoint.
- Foreground field: 18 steps on desktop and 14 on phones, with two sun-shadow samples.
  Render scale is 0.45 on desktop and 0.42 on phones, independent of DPR.
- The sky stops its animation loop at flight = 1 and restarts on scrolling back. Foreground clouds
  also stop when cleared at 85% of hero travel; the spiral stops while its entrance opacity
  is zero. Both pause offscreen; all scenes pause when the document is hidden and dispose
  their GPU resources on unmount.
- Reduced motion: static sky with a simple crossfade, static foreground banks redrawn only
  for scroll clearing and resizing, no
  entrance lift or idle spiral rotation, no scroll snap, and opacity-only reveals.
- WebGL fallback: a CSS sky gradient follows the same fade to white; all copy and links
  remain ordinary accessible DOM content.
- Glass CSS keeps the prefixed backdrop-filter declaration before the standard one, so
  the production optimizer retains the blur for Chromium as well as Safari.

## Verification

Verified October 9, 2026: TypeScript, ESLint and production static export. Served `site/out/`
and checked Chromium with `--use-gl=angle --ignore-gpu-blocklist` at 1440×900 and 390×844
(phone emulation, DPR 2), plus 320px width. 86 browser checks covered every section, four
hero-to-work positions, projects 1/4/8/11, fast scrolling through all projects, keyboard
project focus, lightbox arrows/Esc and focus restoration, mobile-menu navigation/Esc,
reduced motion and unavailable WebGL. No normal-rendering console errors or horizontal
overflow. The initial sky implementation also passed pause/restart, responsive resizing
and direct `#work` initialisation checks.

The full-hero cloud field and glass-panel revision was rebuilt and checked at 1440×900,
390×844 (DPR 2) and 320px. All 86 browser flow checks passed again, including scrolling
through all projects, project focus, every section, lightbox/menu keys, reduced motion
and unavailable WebGL. Additional checks cover dense clouds beyond the heading with
much lighter opacity across its letters and panel geometry for all eleven projects,
including 1024px width. The final export retains 80% white backgrounds and computed
20px glass blur; all panels fit without text clipping. TypeScript, ESLint and the
production export passed again.

The gallery wheel regression was checked at 1440px, 390px and 320px: vertical scrolling
in both directions over photos at the start, middle and end; reaching the footer without
moving the pointer; native horizontal gestures; desktop arrows; lightbox keys; no browser
errors or horizontal page overflow. TypeScript, ESLint and the static export passed.
Phone checks use browser emulation; performance on physical phones still needs a device pass.

The scroll-clearing and continuous spiral-stage revision passed TypeScript, ESLint and the
production export, followed by all 86 browser flow checks. Targeted checks at 1440px,
390px (DPR 2) and 320px, with both normal and reduced motion, measured falling cloud
opacity over the name, full clearing by 28% of hero travel, restoration on reverse scroll,
and a spiral canvas that stays at the viewport top throughout the handoff. The cleared
foreground and invisible spiral stop rendering; the spiral leaves with work. Direct
`#work` loading also initialises correctly. Transition screenshots show no horizontal cut.

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
  crossfades, foreground clouds clear without drifting, proximity snap is disabled, and reveals are opacity-only.
