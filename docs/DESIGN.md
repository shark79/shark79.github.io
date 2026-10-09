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

1. **Hero** (`sections/hero.tsx`): full-screen cloud shader (`visuals/cloud-scene.ts`, three
   domain-warped fbm decks, lit from a high sun, rendered at half resolution). Name in light
   weight with 0.18em tracking. The sky dissolves into the white page.
2. **Work** (`sections/work.tsx`): one pinned scene. The spiral (`visuals/spiral-scene.ts`, 210
   instanced rounded slats on a helical spine, studio light and soft shadows) sits in a sticky
   stage and turns with scroll. The 11 projects hand over one by one around it: title and brief
   on the left, four numbers and the stack on the right, tick index on the far right.
   Desktop puts the spiral between the columns. Phones put it in the upper stage, with the text
   on one shared white wash below.
3. **About, Experience, Toolkit**: editorial sections with a numbered label, a large light
   statement, and hairline-separated content.
4. **Gallery**: horizontal snap showreel, grayscale until hover or focus, full-size lightbox.
5. **Contact**: "Let's talk." and the email address.

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
- Reduced motion: no idle animation, the spiral snaps to the scroll position, reveals are
  opacity-only.
