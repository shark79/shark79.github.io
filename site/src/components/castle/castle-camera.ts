import * as THREE from "three";
import { ROOMS } from "@/lib/content";

/**
 * The camera is a pure function of scroll position: hero wide shot, then one
 * framing per room opening, then a pull-back on the finished castle for
 * contact. `docs/DESIGN.md` §7. No tweening state lives here — the caller
 * damps toward whatever this returns.
 *
 * Desktop screen-side plan (cards sit on the opposite side of each opening):
 *   about        -> opening LEFT   (cards right)
 *   work         -> opening RIGHT  (cards left)
 *   experience   -> opening LEFT   (cards right)
 *   skills       -> opening RIGHT  (cards left)
 *   gallery      -> opening LEFT   (cards right)
 *   contact      -> opening RIGHT  (cards left, pulled-back wide shot)
 */

type Side = "left" | "right" | "center";
const SIDE: Record<string, Side> = {
  about: "left",
  work: "right",
  experience: "left",
  skills: "right",
  gallery: "left",
  contact: "right",
};

type Keyframe = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

function kf(pos: [number, number, number], look: [number, number, number], fov: number): Keyframe {
  return { pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look), fov };
}

/** Desktop keyframes: hero, then one per ROOMS entry, in order. Hero looks left of the
 * castle's true center so the castle sits in the right ~55% — the headline owns the left. */
const DESKTOP: Keyframe[] = [
  kf([1.1, 3.3, 13.6], [-1.9, 2.6, 0], 50),
  kf([0.5, 1.85, 5.9], [-1.35, 1.4, 0.9], 36), // about — left tower window
  kf([1.4, 1.4, 5.6], [-1.5, 0.85, 0.9], 34), // work — main gate
  kf([-0.5, 1.85, 5.9], [3.85, 1.4, 0.9], 36), // experience — right tower window
  kf([1.5, 2.55, 5.5], [-1.55, 2.2, 0.9], 34), // skills — balcony
  kf([-1.5, 3.3, 5.3], [1.55, 3.1, 0.9], 33), // gallery — round window (entry; hall pan takes over)
  kf([-2.6, 4.6, 9.9], [-1.0, 4.1, 0.4], 43), // contact — pulled back, pennant tower in view
];

/** Mobile keyframes: opening centered-upper, camera pulled back and raised so the
 * castle's roofline sits lower in frame, clear of the headline/copy scrim above it. */
const MOBILE: Keyframe[] = [
  kf([0, 4.3, 16.5], [0, 2.0, 0], 48),
  kf([-2.55, 2.0, 6.3], [-2.55, 1.35, 0.9], 40),
  kf([0, 1.55, 6.2], [0, 0.85, 0.9], 38),
  kf([2.55, 2.0, 6.3], [2.55, 1.35, 0.9], 40),
  kf([0, 2.7, 6.1], [0, 2.3, 0.9], 38),
  kf([0, 3.45, 6.1], [0, 3.15, 0.9], 37),
  kf([0, 4.8, 11], [0, 4.1, 0.3], 46),
];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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

/**
 * `breakpoints` has ROOMS.length + 1 entries: hero top (~0), then each
 * room's section top, in `ROOMS` order.
 */
export function computeCameraTarget(scrollY: number, breakpoints: number[], aspect: number): CameraTarget {
  const KEYFRAMES = isMobileFraming(aspect) ? MOBILE : DESKTOP;
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

  // Gallery is ROOMS index 4 -> its "leaving" segment is segIndex 5, which is
  // where we spend the room's own scroll range panning the hall before the
  // final pull-back to contact takes over for the last slice of it.
  const galleryLeavingSeg = ROOMS.findIndex((r) => r.id === "gallery") + 1;
  const inGalleryHall = segIndex === galleryLeavingSeg;
  let galleryPanT = 0;
  let a = KEYFRAMES[segIndex];
  let b = KEYFRAMES[Math.min(segIndex + 1, KEYFRAMES.length - 1)];
  let mixT = te;

  if (inGalleryHall) {
    const panEnd = 0.72;
    if (t < panEnd) {
      galleryPanT = easeInOutCubic(t / panEnd);
    } else {
      galleryPanT = 1;
      mixT = easeInOutCubic((t - panEnd) / (1 - panEnd));
      a = KEYFRAMES[segIndex]; // gallery keyframe (used only as a fallback pos/look)
      b = KEYFRAMES[segIndex + 1]; // contact
    }
  }

  return {
    pos: a.pos.clone().lerp(b.pos, inGalleryHall && t < 0.72 ? 0 : mixT),
    look: a.look.clone().lerp(b.look, inGalleryHall && t < 0.72 ? 0 : mixT),
    fov: THREE.MathUtils.lerp(a.fov, b.fov, inGalleryHall && t < 0.72 ? 0 : mixT),
    segmentIndex: segIndex,
    t: te,
    inGalleryHall,
    galleryPanT,
  };
}

export function sideFor(roomId: string): Side {
  return SIDE[roomId] ?? "center";
}
