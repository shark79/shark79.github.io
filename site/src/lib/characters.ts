import * as THREE from "three";
import type { Palette } from "@/lib/scenes";
import { bounce, contactShadow, part } from "@/lib/toon";

/**
 * Five agents as actual creatures: legs, arms, hands, a head, and one prop
 * that says what the role is. Built from primitives so there is nothing to
 * download, rigged so they idle and react rather than sit there rotating.
 */

export type Character = {
  root: THREE.Group;
  /** Everything a tap may land on. */
  targets: THREE.Object3D[];
  update(t: number): void;
  poke(t: number): void;
};

export type Role =
  | "orchestrator"
  | "backend"
  | "frontend"
  | "qa"
  | "adversary"
  | "buyer"
  | "scout"
  | "clinician"
  | "dev";

/** What it looks like and how it moves are separate choices. */
export type Pose =
  | "conduct"
  | "type"
  | "paint"
  | "peer"
  | "charge"
  | "run"
  | "point"
  | "check";

const DEFAULT_POSE: Record<Role, Pose> = {
  orchestrator: "conduct",
  backend: "type",
  frontend: "paint",
  qa: "peer",
  adversary: "charge",
  buyer: "run",
  scout: "peer",
  clinician: "check",
  dev: "type",
};

type Rig = {
  root: THREE.Group;
  bob: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  eyes: THREE.Mesh[];
};

function arm(len: number, tone: number, edge: number) {
  const pivot = new THREE.Group();
  const upper = part(
    new THREE.CapsuleGeometry(0.075, len, 4, 8),
    tone,
    edge,
    1.14,
  );
  upper.position.y = -len / 2 - 0.075;
  const hand = part(new THREE.SphereGeometry(0.115, 12, 10), tone);
  hand.position.y = -len - 0.16;
  pivot.add(upper, hand);
  return pivot;
}

function leg(len: number, tone: number, edge: number) {
  const pivot = new THREE.Group();
  const shin = part(new THREE.CapsuleGeometry(0.085, len, 4, 8), tone, edge, 1.13);
  shin.position.y = -len / 2 - 0.085;
  const foot = part(new THREE.SphereGeometry(0.125, 12, 10), tone);
  foot.position.set(0, -len - 0.16, 0.06);
  foot.scale.set(1, 0.62, 1.35);
  pivot.add(shin, foot);
  return pivot;
}

function base(p: Palette, tone: number, bulk = 1): Rig {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);

  const shadow = contactShadow(0.62 * bulk);
  shadow.position.y = 0.01;
  root.add(shadow);

  const torso = part(
    new THREE.CapsuleGeometry(0.25 * bulk, 0.46, 5, 14),
    tone,
    p.outline,
    1.08,
  );
  torso.position.y = 1.02;
  bob.add(torso);

  const head = new THREE.Group();
  head.position.y = 1.62;
  bob.add(head);

  const skull = part(new THREE.SphereGeometry(0.31, 20, 16), tone, p.outline, 1.07);
  head.add(skull);

  const eyes: THREE.Mesh[] = [];
  for (const x of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 8),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    eye.position.set(x, 0.04, 0.27);
    head.add(eye);
    eyes.push(eye);
  }

  const armL = arm(0.4, tone, p.outline);
  armL.position.set(-0.27 * bulk - 0.1, 1.3, 0.02);
  const armR = arm(0.4, tone, p.outline);
  armR.position.set(0.27 * bulk + 0.1, 1.3, 0.02);
  bob.add(armL, armR);

  const legL = leg(0.3, tone, p.outline);
  legL.position.set(-0.17, 0.74, 0);
  const legR = leg(0.3, tone, p.outline);
  legR.position.set(0.17, 0.74, 0);
  bob.add(legL, legR);

  return { root, bob, torso, head, armL, armR, legL, legR, eyes };
}

export function character(
  role: Role,
  p: Palette,
  opts: { pose?: Pose; tone?: number } = {},
): Character {
  const lead = role === "orchestrator";
  const pose = opts.pose ?? DEFAULT_POSE[role];
  const tone =
    opts.tone ??
    (lead ? p.accent : role === "backend" ? p.neutral : p.neutralDim);
  const bulk = role === "adversary" ? 1.28 : 1;
  const r = base(p, tone, bulk);

  // Props: one silhouette-defining object per role, nothing decorative.
  const extras: THREE.Object3D[] = [];

  if (role === "orchestrator") {
    // Brain: folds wrapped over the skull, and a coordination ring above.
    for (let i = 0; i < 3; i++) {
      const fold = part(
        new THREE.TorusGeometry(0.3 - i * 0.02, 0.075, 8, 22),
        p.accentDim,
        p.outline,
        1.1,
      );
      fold.rotation.set(1.3 + i * 0.42, i * 0.75, 0.25);
      fold.position.y = 0.16;
      r.head.add(fold);
      extras.push(fold);
    }
    const halo = part(
      new THREE.TorusGeometry(0.34, 0.028, 8, 28),
      p.accent,
      p.outline,
      1.15,
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.62;
    r.head.add(halo);
    extras.push(halo);
  }

  if (role === "backend") {
    // Skeleton: exposed ribs and hollow sockets.
    for (let i = 0; i < 3; i++) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.34 - i * 0.05, 0.045, 0.04),
        new THREE.MeshBasicMaterial({ color: p.outline }),
      );
      rib.position.set(0, 1.19 - i * 0.15, 0.245);
      r.bob.add(rib);
      extras.push(rib);
    }
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.5, 0.04),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    spine.position.set(0, 1.1, 0.245);
    r.bob.add(spine);
    r.eyes.forEach((e) => e.scale.setScalar(1.5));
    const jaw = part(
      new THREE.BoxGeometry(0.26, 0.07, 0.16),
      p.neutral,
      p.outline,
      1.1,
    );
    jaw.position.set(0, -0.22, 0.18);
    r.head.add(jaw);
    extras.push(jaw);
  }

  if (role === "frontend") {
    // Artist: beret, and a palette held out in one hand.
    const beret = part(
      new THREE.CylinderGeometry(0.3, 0.26, 0.1, 16),
      p.accent,
      p.outline,
      1.1,
    );
    beret.position.set(0.02, 0.29, -0.02);
    beret.rotation.z = -0.24;
    const stalk = part(
      new THREE.SphereGeometry(0.05, 8, 8),
      p.accent,
      p.outline,
      1.2,
    );
    stalk.position.set(0.02, 0.37, -0.02);
    r.head.add(beret, stalk);

    const palette = part(
      new THREE.CylinderGeometry(0.19, 0.19, 0.035, 16),
      p.neutral,
      p.outline,
      1.1,
    );
    palette.rotation.set(1.35, 0, 0.35);
    palette.position.set(-0.02, -0.62, 0.16);
    palette.scale.set(1.15, 1, 1.15);
    r.armL.add(palette);
    extras.push(beret, palette);
  }

  if (role === "qa") {
    // Old inspector: monocle on one eye, beard, permanent lean-in.
    const monocle = part(
      new THREE.TorusGeometry(0.1, 0.022, 8, 18),
      p.accent,
      p.outline,
      1.18,
    );
    monocle.position.set(0.12, 0.04, 0.29);
    r.head.add(monocle);

    // A sphere behind the jaw read as a second chin. A cone hanging off the
    // front of the face reads as a beard from any angle.
    const beard = part(new THREE.ConeGeometry(0.23, 0.38, 14), p.neutral, p.outline, 1.06);
    beard.position.set(0, -0.34, 0.14);
    beard.rotation.x = -0.22;
    beard.scale.set(1, 1, 0.72);
    r.head.add(beard);

    const tache = part(
      new THREE.CapsuleGeometry(0.05, 0.2, 4, 8),
      p.neutral,
      p.outline,
      1.1,
    );
    tache.rotation.z = Math.PI / 2;
    tache.position.set(0, -0.12, 0.27);
    r.head.add(tache);
    extras.push(tache);

    const brow = part(
      new THREE.BoxGeometry(0.34, 0.05, 0.06),
      p.neutral,
      p.outline,
      1.1,
    );
    brow.position.set(0, 0.17, 0.26);
    brow.rotation.z = 0.12;
    r.head.add(brow);
    extras.push(monocle, beard, brow);
  }

  if (role === "scout") {
    // Magnifier: ring plus handle, held up at eye height.
    const glass = part(new THREE.TorusGeometry(0.15, 0.03, 8, 20), p.accent, p.outline, 1.14);
    const handle = part(
      new THREE.CapsuleGeometry(0.028, 0.18, 4, 8),
      p.neutral,
      p.outline,
      1.14,
    );
    handle.position.y = -0.24;
    glass.add(handle);
    glass.position.set(0, -0.62, 0.12);
    r.armR.add(glass);
    extras.push(glass);
  }

  if (role === "clinician") {
    // Clipboard, held flat the way someone actually reads one.
    const board = part(new THREE.BoxGeometry(0.34, 0.44, 0.03), p.neutral, p.outline, 1.07);
    const clip = part(new THREE.BoxGeometry(0.16, 0.06, 0.05), p.accent, p.outline, 1.12);
    clip.position.set(0, 0.2, 0.03);
    board.add(clip);
    board.position.set(0.02, -0.62, 0.16);
    board.rotation.set(1.25, 0, 0.2);
    r.armL.add(board);
    extras.push(board);
  }

  if (role === "dev") {
    // Laptop, open, tilted toward the face.
    const lap = part(new THREE.BoxGeometry(0.44, 0.03, 0.32), p.neutral, p.outline, 1.07);
    const lid = part(new THREE.BoxGeometry(0.44, 0.3, 0.03), p.accentDim, p.outline, 1.07);
    lid.position.set(0, 0.15, -0.15);
    lid.rotation.x = -0.35;
    lap.add(lid);
    lap.position.set(0, 0.92, 0.42);
    r.bob.add(lap);
    extras.push(lap);
  }

  if (role === "adversary") {
    // Rhino: horn, ears, hunched forward, cape trailing behind.
    const horn = part(
      new THREE.ConeGeometry(0.11, 0.42, 12),
      p.accent,
      p.outline,
      1.12,
    );
    horn.position.set(0, 0.12, 0.32);
    horn.rotation.x = -0.28;
    horn.scale.setScalar(1.2);
    r.head.add(horn);

    for (const x of [-0.24, 0.24]) {
      const ear = part(
        new THREE.ConeGeometry(0.075, 0.17, 8),
        p.neutralDim,
        p.outline,
        1.14,
      );
      ear.position.set(x, 0.26, 0);
      r.head.add(ear);
      extras.push(ear);
    }

    const cape = part(
      new THREE.PlaneGeometry(0.88, 0.92, 1, 1),
      p.accentDim,
      p.outline,
      1.02,
    );
    (cape.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
    cape.position.set(0, 1.04, -0.36);
    r.bob.add(cape);

    r.head.rotation.x = 0.22;
    r.torso.rotation.x = 0.16;
    extras.push(horn, cape);
  }

  let pokedAt = -99;
  const seed = role.charCodeAt(0);

  return {
    root: r.root,
    targets: [r.torso, ...r.head.children, ...extras],
    poke(t) {
      pokedAt = t;
    },
    update(t) {
      const since = t - pokedAt;
      const reacting = since >= 0 && since < 1.1;
      const react = reacting ? bounce(since / 1.1) : 0;

      // Breathing, always. A still character reads as a prop.
      const breath = Math.sin(t * 1.9 + seed) * 0.028;
      r.torso.scale.set(1 - breath * 0.6, 1 + breath, 1 - breath * 0.6);
      r.bob.position.y = Math.sin(t * 1.9 + seed) * 0.035 + react * 0.55;
      r.head.position.y = 1.62 + Math.sin(t * 1.9 + seed + 0.4) * 0.02;

      // Idle gait, distinct per role.
      switch (pose) {
        case "conduct": {
          // Conducting: arms sweep out of phase, brain rings turn.
          r.armL.rotation.x = Math.sin(t * 1.5) * 0.55 - 0.3;
          r.armR.rotation.x = Math.sin(t * 1.5 + Math.PI) * 0.55 - 0.3;
          r.armL.rotation.z = 0.35;
          r.armR.rotation.z = -0.35;
          r.head.rotation.y = Math.sin(t * 0.7) * 0.3;
          extras.forEach((e, i) => {
            e.rotation.z += 0.004 * (i + 1);
          });
          break;
        }
        case "type": {
          // Typing: fast, small, unbothered.
          r.armL.rotation.x = -1.15 + Math.sin(t * 11) * 0.14;
          r.armR.rotation.x = -1.15 + Math.sin(t * 11 + 1.7) * 0.14;
          r.armL.rotation.z = 0.5;
          r.armR.rotation.z = -0.5;
          r.head.rotation.x = 0.28;
          break;
        }
        case "paint": {
          // Painting: one long arc, head following the stroke.
          const stroke = Math.sin(t * 1.15);
          r.armR.rotation.x = -0.9 + stroke * 0.75;
          r.armR.rotation.z = -0.5 + stroke * 0.3;
          r.armL.rotation.x = -0.55;
          r.armL.rotation.z = 0.7;
          r.head.rotation.z = stroke * 0.1;
          r.head.rotation.y = stroke * 0.16;
          break;
        }
        case "peer": {
          // Leaning in and back out, looking for the flaw.
          const peer = (Math.sin(t * 0.9) + 1) / 2;
          r.bob.rotation.x = peer * 0.16;
          r.bob.position.z = peer * 0.22;
          r.armR.rotation.x = -1.35;
          r.armR.rotation.z = -0.75;
          r.armL.rotation.x = 0.18;
          r.head.rotation.y = Math.sin(t * 1.6) * 0.22;
          break;
        }
        case "charge": {
          // Pawing the ground, horn dipping, cape alive.
          const paw = Math.sin(t * 2.4);
          r.legR.rotation.x = Math.max(0, paw) * 0.7;
          r.armL.rotation.x = -0.35 + paw * 0.2;
          r.armR.rotation.x = -0.35 - paw * 0.2;
          r.armL.rotation.z = 0.55;
          r.armR.rotation.z = -0.55;
          r.head.rotation.x = 0.22 + Math.max(0, -paw) * 0.22;
          const cape = extras[extras.length - 1];
          cape.rotation.x = Math.sin(t * 2.1) * 0.18 - 0.1;
          break;
        }
        case "run": {
          // Legs and arms counter-swinging, body leaning into the run.
          const stride = Math.sin(t * 7.5);
          r.legL.rotation.x = stride * 0.85;
          r.legR.rotation.x = -stride * 0.85;
          r.armL.rotation.x = -stride * 0.75;
          r.armR.rotation.x = stride * 0.75;
          r.armL.rotation.z = 0.3;
          r.armR.rotation.z = -0.3;
          r.bob.rotation.x = 0.14;
          break;
        }
        case "point": {
          // One arm up at the thing worth looking at, the other on the hip.
          r.armR.rotation.x = -2.45 + Math.sin(t * 2) * 0.1;
          r.armR.rotation.z = -0.35;
          r.armL.rotation.x = -0.2;
          r.armL.rotation.z = 0.95;
          r.head.rotation.x = -0.22;
          r.head.rotation.y = Math.sin(t * 0.8) * 0.12;
          break;
        }
        case "check": {
          // Reading, then glancing up to compare against what is in front.
          const glance = Math.sin(t * 0.8);
          r.armL.rotation.x = -1.25;
          r.armL.rotation.z = 0.45;
          r.armR.rotation.x = -0.75 + Math.max(0, glance) * 0.5;
          r.armR.rotation.z = -0.55;
          r.head.rotation.x = 0.3 - Math.max(0, glance) * 0.5;
          break;
        }
      }

      // Reaction: squash, launch, and a signature flourish.
      if (reacting) {
        const squash = 1 + react * 0.22;
        r.bob.scale.set(1 / squash, squash, 1 / squash);
        switch (role) {
          case "orchestrator":
            r.bob.rotation.y = react * Math.PI * 2;
            break;
          case "scout":
          case "clinician":
          case "dev":
          case "buyer":
            r.bob.rotation.y = react * Math.PI * 2;
            break;
          case "backend":
            r.bob.position.x = Math.sin(since * 46) * 0.05 * (1 - react);
            break;
          case "frontend":
            r.armR.rotation.x = -2.4 * react;
            r.bob.rotation.z = -react * 0.4;
            break;
          case "qa":
            r.head.scale.setScalar(1 + react * 0.3);
            r.bob.rotation.x = -react * 0.3;
            break;
          case "adversary":
            r.bob.position.z = react * 0.9;
            r.bob.rotation.x = react * 0.35;
            break;
        }
      } else {
        r.bob.scale.setScalar(1);
        r.bob.rotation.set(pose === "peer" || pose === "run" ? r.bob.rotation.x : 0, 0, 0);
        r.head.scale.setScalar(1);
        r.bob.position.x = 0;
      }

      // Blink, on an irregular beat so it never looks metronomic.
      const blink = Math.sin(t * 1.3 + seed) > 0.985 ? 0.12 : 1;
      r.eyes.forEach((e) => {
        e.scale.y = blink * (role === "backend" ? 1.5 : 1);
      });
    },
  };
}
