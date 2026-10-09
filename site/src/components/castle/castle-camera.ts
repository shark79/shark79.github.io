import * as THREE from "three";
import { ROOMS } from "@/lib/content";

/**
 * The camera is a pure function of scroll position: hero wide shot, then one
 * framing per room opening, then a pull-back on the finished castle for
 * contact. `docs/DESIGN.md` §7. No tweening state lives here — the caller
 * damps toward whatever this returns.
 *
 * Room framings are derived (not eyeballed) from a small pinhole model: pick
 * a "subject" (the tower/wall/opening + its sign) with a real-world height,
 * a target fraction of the viewport it should fill, and a vertical FOV; that
 * gives the distance `d = H / (f * 2*tan(vFOV/2))`. To land the subject in
 * the centre of its screen *half* (not dead centre), the look target is
 * offset horizontally by `Δ = 0.5 * d * tan(vFOV/2) * aspect` — small-angle
 * equivalent of yawing the camera until the subject sits at NDC ±0.5. Same
 * idea vertically on mobile (subject near the top ~40% of the frame).
 */

type Side = "left" | "right" | "center";
// Single source of truth lives on ROOMS so the (three-free) card layout can read it too.
const SIDE: Record<string, Side> = Object.fromEntries(ROOMS.map((r) => [r.id, r.side]));

type Keyframe = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

function kf(pos: [number, number, number], look: [number, number, number], fov: number): Keyframe {
  return { pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look), fov };
}

/** Desktop keyframes: hero, then one per ROOMS entry, in order. Hero looks left of the
 * castle's true center so the castle sits in the right ~55% — the headline owns the left. */
const DESKTOP: Keyframe[] = [
  kf([1.1, 3.3, 13.6], [-1.9, 2.6, 0], 50),
  kf([-2.55, 1.4, 10.15], [-0.21, 1.9, 1.15], 36), // about — left tower window, in its own left half
  kf([0, 0.8, 8.65], [-1.85, 1.5, 1.1], 34), // work — main gate, in its own right half
  kf([2.55, 1.4, 10.15], [4.89, 1.9, 1.15], 36), // experience — right tower window, framed left
  kf([0, 1.8, 8.15], [-1.72, 2.3, 1.1], 34), // skills — balcony, framed right
  // gallery: the approach ends *already through* the round window, at the first
  // painting — scrollIntoView("#gallery") lands exactly here (see inGalleryHall).
  kf([-2.0, 2.85, -0.7], [-1.1, 2.85, -2.47], 38),
  kf([0, 3.35, 14.0], [-4.53, 3.85, 0], 44), // contact — pulled back, whole castle in view
];

/** Inside the gallery hall (desktop): a lateral dolly across the row of 9 paintings. */
const DESKTOP_HALL = {
  enter: DESKTOP[5],
  exit: kf([2.0, 2.85, -0.7], [2.9, 2.85, -2.47], 38),
};

/** Mobile keyframes: the subject sits centred horizontally but biased toward the
 * top ~40% of the frame (vertical Δ instead of horizontal), and fills less of
 * the frame overall so the section's header band above it stays clean. */
const MOBILE: Keyframe[] = [
  // Roofline sits below the intro copy, in the lower half of the viewport,
  // clear of the door rail — a higher look target rotates the whole frame
  // up, which (subject fixed) pushes the castle itself down on screen.
  kf([0, 3.7, 14.6], [0, 3.15, 0], 46),
  kf([-2.55, 1.4, 16.06], [-2.55, -1.36, 1.15], 40), // about
  kf([0, 1.0, 12.87], [0, -1.07, 1.1], 40), // work
  kf([2.55, 1.4, 16.06], [2.55, -1.36, 1.15], 40), // experience
  kf([0, 1.8, 12.09], [0, -0.1, 1.1], 40), // skills
  kf([-1.6, 2.85, -0.9], [-1.6, 2.85, -2.47], 42), // gallery — already through the window, see above
  kf([0, 3.35, 22.7], [0, -1.93, 0], 46), // contact
];

const MOBILE_HALL = {
  enter: MOBILE[5],
  exit: kf([1.6, 2.85, -0.9], [1.6, 2.85, -2.47], 42),
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Blend two keyframes; `t` should already be eased. */
function blend(a: Keyframe, b: Keyframe, t: number): { pos: THREE.Vector3; look: THREE.Vector3; fov: number } {
  return { pos: a.pos.clone().lerp(b.pos, t), look: a.look.clone().lerp(b.look, t), fov: THREE.MathUtils.lerp(a.fov, b.fov, t) };
}

export type CameraTarget = {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  /** 0 = hero. 1..6 = index into ROOMS + 1 (the room the camera is arriving at/leaving). */
  segmentIndex: number;
  /** 0..1 progress across the current segment, eased. */
  t: number;
  /** True while inside the gallery room's own scroll range (past its keyframe). */
  inGalleryHall: boolean;
  galleryPanT: number;
};

/** How open room `i` (0-indexed into ROOMS) should be, purely as a function of scroll segment. */
export function doorOpenAmount(roomIndex: number, segmentIndex: number, t: number): number {
  if (segmentIndex === roomIndex) return t;
  if (segmentIndex === roomIndex + 1) return 1 - t;
  return 0;
}

export function isMobileFraming(aspect: number) {
  return aspect < 0.85;
}

const GALLERY_ROOM_INDEX = ROOMS.findIndex((r) => r.id === "gallery");

/**
 * `breakpoints` has ROOMS.length + 1 entries: hero top (~0), then each
 * room's section top, in `ROOMS` order.
 */
export function computeCameraTarget(scrollY: number, breakpoints: number[], aspect: number): CameraTarget {
  const mobile = isMobileFraming(aspect);
  const KEYFRAMES = mobile ? MOBILE : DESKTOP;
  const HALL = mobile ? MOBILE_HALL : DESKTOP_HALL;
  const n = breakpoints.length;
  let segIndex = 0;
  let t = 0;
  if (scrollY <= breakpoints[0]) {
    segIndex = 0;
    t = 0;
  } else if (scrollY >= breakpoints[n - 1]) {
    segIndex = n - 2;
    t = 1;
  } else {
    for (let i = 0; i < n - 1; i++) {
      const a = breakpoints[i];
      const b = breakpoints[i + 1];
      if (scrollY >= a && scrollY <= b) {
        segIndex = i;
        t = b > a ? (scrollY - a) / (b - a) : 1;
        break;
      }
    }
  }
  const te = easeInOutCubic(Math.min(1, Math.max(0, t)));

  // The approach into gallery (the previous segment) already ends inside the
  // hall at the first painting — scrollIntoView("#gallery") lands exactly on
  // that keyframe (t=0 here), so the hall is visible immediately, no further
  // scroll required. This segment then pans enter->exit across the row of
  // paintings, and finally exits to the contact pull-back.
  const galleryLeavingSeg = GALLERY_ROOM_INDEX + 1;
  const inGalleryHall = segIndex === galleryLeavingSeg;

  if (inGalleryHall) {
    const panEnd = 0.72;
    const contact = KEYFRAMES[segIndex + 1];
    let out;
    let galleryPanT: number;
    if (t < panEnd) {
      galleryPanT = easeInOutCubic(t / panEnd);
      out = blend(HALL.enter, HALL.exit, galleryPanT);
    } else {
      galleryPanT = 1;
      out = blend(HALL.exit, contact, easeInOutCubic((t - panEnd) / (1 - panEnd)));
    }
    return { ...out, segmentIndex: segIndex, t: te, inGalleryHall, galleryPanT };
  }

  const a = KEYFRAMES[segIndex];
  const b = KEYFRAMES[Math.min(segIndex + 1, KEYFRAMES.length - 1)];
  const out = blend(a, b, te);
  return { ...out, segmentIndex: segIndex, t: te, inGalleryHall: false, galleryPanT: 0 };
}

export function sideFor(roomId: string): Side {
  return SIDE[roomId] ?? "center";
}
