import * as THREE from "three";
import type { Palette } from "@/lib/scenes";
import { contactShadow, part } from "@/lib/toon";

/**
 * Minifigure construction: everything is a moulded block, not a soft shape.
 * A tapered torso, a cylinder head with a stud on top, C-clamp hands, and
 * legs that hinge off a hip block. Boxes and cylinders read as *built*,
 * where capsules and spheres read as a cartoon blob.
 */

export type Character = {
  root: THREE.Group;
  /** One generous collider per creature — fingers are not laser pointers. */
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

/** Emotes run four seconds, in beats, then hand back to the idle. */
const EMOTE = 4;

/** Progress through one beat of an emote, eased. */
function beat(phase: number, from: number, to: number) {
  if (phase <= from) return 0;
  if (phase >= to) return 1;
  const k = (phase - from) / (to - from);
  return k * k * (3 - 2 * k);
}

/** Up and back down within a beat. */
function pulse(phase: number, from: number, to: number) {
  if (phase <= from || phase >= to) return 0;
  return Math.sin(((phase - from) / (to - from)) * Math.PI);
}

/** A 4-sided cylinder is a trapezoid prism, which is the minifig torso. */
function tapered(top: number, bottom: number, height: number) {
  const g = new THREE.CylinderGeometry(top, bottom, height, 4);
  g.rotateY(Math.PI / 4);
  return g;
}

type Rig = {
  root: THREE.Group;
  bob: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  handL: THREE.Group;
  handR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  eyes: THREE.Mesh[];
};

/** Upper arm, hinged forearm, C-clamp hand — the minifig arm exactly. */
function armRig(tone: number, edge: number, flip: number) {
  const shoulder = new THREE.Group();

  const upper = part(new THREE.BoxGeometry(0.15, 0.28, 0.17), tone, edge, 1.09);
  upper.position.y = -0.14;
  upper.rotation.z = flip * -0.22;
  shoulder.add(upper);

  const elbow = new THREE.Group();
  elbow.position.set(flip * 0.07, -0.27, 0);
  shoulder.add(elbow);

  const fore = part(new THREE.BoxGeometry(0.14, 0.25, 0.16), tone, edge, 1.09);
  fore.position.y = -0.12;
  elbow.add(fore);

  const hand = new THREE.Group();
  hand.position.y = -0.25;
  elbow.add(hand);

  // C-clamp: an open ring, the way a minifig grips.
  const clamp = part(
    new THREE.TorusGeometry(0.075, 0.032, 6, 12, Math.PI * 1.45),
    tone,
    edge,
    1.12,
  );
  clamp.rotation.set(Math.PI / 2, 0, -0.5);
  hand.add(clamp);

  return { shoulder, hand };
}

function legRig(tone: number, edge: number) {
  const hip = new THREE.Group();
  const thigh = part(new THREE.BoxGeometry(0.21, 0.46, 0.26), tone, edge, 1.07);
  thigh.position.y = -0.23;
  hip.add(thigh);
  const foot = part(new THREE.BoxGeometry(0.23, 0.1, 0.34), tone, edge, 1.07);
  foot.position.set(0, -0.5, 0.04);
  hip.add(foot);
  return hip;
}

function base(p: Palette, tone: number, bulk = 1): Rig {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);

  const shadow = contactShadow(0.6 * bulk);
  shadow.position.y = 0.01;
  root.add(shadow);

  // Hips: the block the legs hang off, wider than the waist above it.
  const hips = part(new THREE.BoxGeometry(0.44 * bulk, 0.17, 0.3), tone, p.outline, 1.06);
  hips.position.y = 0.66;
  bob.add(hips);

  const torso = part(tapered(0.23 * bulk, 0.33 * bulk, 0.6), tone, p.outline, 1.06);
  torso.position.y = 1.04;
  bob.add(torso);

  const head = new THREE.Group();
  head.position.y = 1.52;
  bob.add(head);

  const skull = part(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 18), tone, p.outline, 1.06);
  head.add(skull);
  // The stud. Nothing says moulded brick faster.
  const stud = part(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 14), tone, p.outline, 1.1);
  stud.position.y = 0.2;
  head.add(stud);
  const neck = part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), tone);
  neck.position.y = -0.2;
  head.add(neck);

  const eyes: THREE.Mesh[] = [];
  for (const x of [-0.075, 0.075]) {
    const eye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.02, 10),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    eye.rotation.x = Math.PI / 2;
    eye.position.set(x, 0.03, 0.2);
    head.add(eye);
    eyes.push(eye);
  }

  const left = armRig(tone, p.outline, 1);
  const right = armRig(tone, p.outline, -1);
  left.shoulder.position.set(-0.28 * bulk, 1.28, 0);
  right.shoulder.position.set(0.28 * bulk, 1.28, 0);
  bob.add(left.shoulder, right.shoulder);

  const legL = legRig(tone, p.outline);
  const legR = legRig(tone, p.outline);
  legL.position.set(-0.115, 0.6, 0);
  legR.position.set(0.115, 0.6, 0);
  bob.add(legL, legR);

  return {
    root,
    bob,
    torso,
    head,
    armL: left.shoulder,
    armR: right.shoulder,
    handL: left.hand,
    handR: right.hand,
    legL,
    legR,
    eyes,
  };
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
  const bulk = role === "adversary" ? 1.25 : 1;
  const r = base(p, tone, bulk);
  const extras: THREE.Object3D[] = [];

  if (role === "orchestrator") {
    // Brain: lobes moulded over the head, plus the ring it works under.
    // Ridges arcing front-to-back over the dome. Clustered rings on top just
    // read as a hat brim; ridges over the skull read as a brain.
    for (let i = 0; i < 3; i++) {
      const lobe = part(
        new THREE.TorusGeometry(0.185 - i * 0.012, 0.036, 6, 14, Math.PI),
        p.accentDim,
        p.outline,
        1.1,
      );
      lobe.rotation.set(0, Math.PI / 2, 0);
      lobe.position.set((i - 1) * 0.105, 0.12, 0);
      r.head.add(lobe);
      extras.push(lobe);
    }
    // Cap the crown so the ridges sit on something.
    const dome = part(
      new THREE.SphereGeometry(0.19, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      p.accentDim,
      p.outline,
      1.06,
    );
    dome.position.y = 0.12;
    r.head.add(dome);
    const halo = part(new THREE.TorusGeometry(0.28, 0.025, 6, 24), p.accent, p.outline, 1.14);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.52;
    r.head.add(halo);
    extras.push(halo);
  }

  if (role === "backend") {
    // Ribcage printed on the torso front, the way a minifig torso is printed.
    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.3 - i * 0.045, 0.04, 0.03),
        new THREE.MeshBasicMaterial({ color: p.outline }),
      );
      rib.position.set(0, 1.24 - i * 0.13, 0.17 - i * 0.006);
      r.bob.add(rib);
    }
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.5, 0.03),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    spine.position.set(0, 1.1, 0.17);
    r.bob.add(spine);
    r.eyes.forEach((e) => e.scale.setScalar(1.7));
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.035, 0.02),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    jaw.position.set(0, -0.09, 0.2);
    r.head.add(jaw);
  }

  if (role === "frontend") {
    const beret = part(new THREE.CylinderGeometry(0.25, 0.21, 0.08, 14), p.accent, p.outline, 1.08);
    beret.position.set(0.02, 0.21, -0.01);
    beret.rotation.z = -0.22;
    const stalk = part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), p.accent, p.outline, 1.15);
    stalk.position.set(0.02, 0.27, -0.01);
    r.head.add(beret, stalk);

    const palette = part(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 14), p.neutral, p.outline, 1.08);
    palette.rotation.set(1.4, 0, 0.3);
    palette.position.set(0, -0.06, 0.06);
    r.handL.add(palette);
    extras.push(beret, palette);
  }

  if (role === "qa") {
    const monocle = part(new THREE.TorusGeometry(0.062, 0.018, 6, 14), p.accent, p.outline, 1.16);
    monocle.position.set(0.075, 0.03, 0.21);
    r.head.add(monocle);
    const chain = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.16, 0.012),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    chain.position.set(0.13, -0.06, 0.19);
    chain.rotation.z = 0.4;
    r.head.add(chain);

    const beard = part(tapered(0.06, 0.17, 0.3), p.neutral, p.outline, 1.06);
    beard.position.set(0, -0.28, 0.09);
    beard.scale.z = 0.72;
    r.head.add(beard);

    const tache = part(new THREE.BoxGeometry(0.19, 0.045, 0.05), p.neutral, p.outline, 1.09);
    tache.position.set(0, -0.09, 0.2);
    r.head.add(tache);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.04, 0.04),
      new THREE.MeshBasicMaterial({ color: p.outline }),
    );
    brow.position.set(0, 0.11, 0.2);
    r.head.add(brow);
    extras.push(monocle, beard, tache);
  }

  if (role === "scout") {
    const glass = part(new THREE.TorusGeometry(0.13, 0.026, 6, 16), p.accent, p.outline, 1.12);
    const handle = part(new THREE.BoxGeometry(0.035, 0.16, 0.035), p.neutral, p.outline, 1.12);
    handle.position.y = -0.2;
    glass.add(handle);
    glass.position.set(0, 0.06, 0.02);
    glass.rotation.x = 0.2;
    r.handR.add(glass);
    extras.push(glass);
  }

  if (role === "clinician") {
    const board = part(new THREE.BoxGeometry(0.3, 0.4, 0.025), p.neutral, p.outline, 1.06);
    const clip = part(new THREE.BoxGeometry(0.14, 0.05, 0.04), p.accent, p.outline, 1.1);
    clip.position.set(0, 0.18, 0.03);
    board.add(clip);
    board.position.set(0, 0.02, 0.1);
    board.rotation.set(1.2, 0, 0.15);
    r.handL.add(board);
    extras.push(board);
  }

  if (role === "dev") {
    const lap = part(new THREE.BoxGeometry(0.4, 0.03, 0.28), p.neutral, p.outline, 1.06);
    const lid = part(new THREE.BoxGeometry(0.4, 0.26, 0.025), p.accentDim, p.outline, 1.06);
    lid.position.set(0, 0.13, -0.13);
    lid.rotation.x = -0.32;
    lap.add(lid);
    lap.position.set(0, 0.94, 0.36);
    r.bob.add(lap);
    extras.push(lap);
  }

  if (role === "adversary") {
    const horn = part(new THREE.ConeGeometry(0.075, 0.32, 10), p.accent, p.outline, 1.12);
    horn.position.set(0, 0.08, 0.21);
    horn.rotation.x = -0.3;
    r.head.add(horn);

    for (const x of [-0.17, 0.17]) {
      const ear = part(new THREE.ConeGeometry(0.055, 0.14, 6), p.neutralDim, p.outline, 1.14);
      ear.position.set(x, 0.19, 0);
      r.head.add(ear);
    }

    const cape = part(new THREE.PlaneGeometry(0.8, 0.86), p.accentDim, p.outline, 1.02);
    (cape.material as THREE.MeshToonMaterial).side = THREE.DoubleSide;
    cape.position.set(0, 1.06, -0.26);
    r.bob.add(cape);
    extras.push(horn, cape);
  }

  // One invisible collider around the whole creature. A finger on a phone
  // cannot reliably hit a 0.15-unit forearm, and it should not have to.
  const collider = new THREE.Mesh(
    new THREE.BoxGeometry(1.15 * bulk, 2.1, 0.9),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  collider.position.y = 1.0;
  r.bob.add(collider);

  let pokedAt = -99;
  const seed = role.charCodeAt(0) + role.length;

  return {
    root: r.root,
    targets: [collider],
    poke(t) {
      pokedAt = t;
    },
    update(t) {
      const since = t - pokedAt;
      const emoting = since >= 0 && since < EMOTE;
      const ph = emoting ? since / EMOTE : 0;

      // Reset every joint an emote may have moved, so the idle never
      // inherits half a pose when the four seconds are up.
      r.bob.rotation.set(0, 0, 0);
      r.bob.position.x = 0;
      r.bob.position.z = 0;
      r.head.rotation.set(0, 0, 0);
      r.armL.rotation.set(0, 0, 0);
      r.armR.rotation.set(0, 0, 0);
      r.legL.rotation.set(0, 0, 0);
      r.legR.rotation.set(0, 0, 0);

      const breathe = Math.sin(t * 1.9 + seed) * 0.02;
      r.bob.position.y = Math.sin(t * 1.9 + seed) * 0.03;
      r.torso.scale.y = 1 + breathe;

      if (!emoting) {
        switch (pose) {
          case "conduct":
            r.armL.rotation.x = Math.sin(t * 1.5) * 0.5 - 0.35;
            r.armR.rotation.x = Math.sin(t * 1.5 + Math.PI) * 0.5 - 0.35;
            r.armL.rotation.z = 0.3;
            r.armR.rotation.z = -0.3;
            r.head.rotation.y = Math.sin(t * 0.7) * 0.25;
            break;
          case "type":
            r.armL.rotation.x = -1.1 + Math.sin(t * 10) * 0.12;
            r.armR.rotation.x = -1.1 + Math.sin(t * 10 + 1.7) * 0.12;
            r.armL.rotation.z = 0.42;
            r.armR.rotation.z = -0.42;
            r.head.rotation.x = 0.24;
            break;
          case "paint": {
            const stroke = Math.sin(t * 1.15);
            r.armR.rotation.x = -0.85 + stroke * 0.7;
            r.armR.rotation.z = -0.45 + stroke * 0.28;
            r.armL.rotation.x = -0.5;
            r.armL.rotation.z = 0.62;
            r.head.rotation.z = stroke * 0.08;
            break;
          }
          case "peer": {
            const lean = (Math.sin(t * 0.9) + 1) / 2;
            r.bob.rotation.x = lean * 0.15;
            r.bob.position.z = lean * 0.2;
            r.armR.rotation.x = -1.3;
            r.armR.rotation.z = -0.6;
            r.armL.rotation.x = 0.15;
            r.head.rotation.y = Math.sin(t * 1.6) * 0.18;
            break;
          }
          case "charge": {
            const paw = Math.sin(t * 2.4);
            r.legR.rotation.x = Math.max(0, paw) * 0.6;
            r.armL.rotation.x = -0.3 + paw * 0.18;
            r.armR.rotation.x = -0.3 - paw * 0.18;
            r.armL.rotation.z = 0.42;
            r.armR.rotation.z = -0.42;
            r.head.rotation.x = 0.2 + Math.max(0, -paw) * 0.2;
            break;
          }
          case "run": {
            const stride = Math.sin(t * 7.5);
            r.legL.rotation.x = stride * 0.8;
            r.legR.rotation.x = -stride * 0.8;
            r.armL.rotation.x = -stride * 0.7;
            r.armR.rotation.x = stride * 0.7;
            r.bob.rotation.x = 0.12;
            break;
          }
          case "point":
            r.armR.rotation.x = -2.4 + Math.sin(t * 2) * 0.08;
            r.armR.rotation.z = -0.3;
            r.armL.rotation.x = -0.15;
            r.armL.rotation.z = 0.85;
            r.head.rotation.x = -0.2;
            break;
          case "check": {
            const glance = Math.sin(t * 0.8);
            r.armL.rotation.x = -1.2;
            r.armL.rotation.z = 0.4;
            r.armR.rotation.x = -0.7 + Math.max(0, glance) * 0.45;
            r.armR.rotation.z = -0.5;
            r.head.rotation.x = 0.28 - Math.max(0, glance) * 0.45;
            break;
          }
        }
      } else {
        // Four seconds, in beats. A named move, not a squash.
        switch (role) {
          case "orchestrator":
          case "dev": {
            // Take a bow: arms up, sweep down, hold, straighten.
            const up = beat(ph, 0, 0.2);
            const bow = beat(ph, 0.25, 0.5) - beat(ph, 0.7, 0.9);
            r.armL.rotation.x = -2.6 * up + bow * 1.4;
            r.armR.rotation.x = -2.6 * up + bow * 1.4;
            r.armL.rotation.z = 0.5 * up;
            r.armR.rotation.z = -0.5 * up;
            r.bob.rotation.x = bow * 0.85;
            r.head.rotation.x = bow * 0.3;
            break;
          }
          case "backend": {
            // Skeleton dance: hips swivel, arms alternate overhead.
            const on = beat(ph, 0, 0.12) - beat(ph, 0.88, 1);
            const swing = Math.sin(ph * Math.PI * 12);
            r.bob.rotation.y = swing * 0.5 * on;
            r.armL.rotation.x = (-2.5 + swing * 0.9) * on;
            r.armR.rotation.x = (-2.5 - swing * 0.9) * on;
            r.armL.rotation.z = 0.7 * on;
            r.armR.rotation.z = -0.7 * on;
            r.legL.rotation.x = swing * 0.4 * on;
            r.legR.rotation.x = -swing * 0.4 * on;
            r.bob.position.y += Math.abs(swing) * 0.12 * on;
            break;
          }
          case "frontend": {
            // Big brush arc across an invisible canvas, then present it.
            const arc = beat(ph, 0.05, 0.45);
            const present = beat(ph, 0.55, 0.75);
            r.armR.rotation.x = -0.6 - arc * 1.9;
            r.armR.rotation.z = -0.4 + Math.sin(arc * Math.PI * 2) * 0.8;
            r.armL.rotation.x = -0.5 - present * 1.6;
            r.armL.rotation.z = 0.6 + present * 0.5;
            r.bob.rotation.y = present * 0.4;
            r.head.rotation.y = present * 0.35;
            break;
          }
          case "qa":
          case "scout": {
            // Raise the glass, lean right in, then nod twice.
            const raise = beat(ph, 0, 0.2);
            const lean = beat(ph, 0.2, 0.45) - beat(ph, 0.75, 0.95);
            const nod = Math.sin(ph * Math.PI * 8) * beat(ph, 0.5, 0.72);
            r.armR.rotation.x = -1.3 - raise * 0.9;
            r.armR.rotation.z = -0.5;
            r.bob.rotation.x = lean * 0.4;
            r.bob.position.z = lean * 0.45;
            r.head.rotation.x = nod * 0.3;
            break;
          }
          case "adversary": {
            // Paw, charge, stomp, back off.
            const wind = pulse(ph, 0, 0.25);
            const dash = beat(ph, 0.28, 0.42) - beat(ph, 0.62, 0.9);
            const stomp = pulse(ph, 0.42, 0.55);
            r.legR.rotation.x = wind * 1.1;
            r.bob.position.z = dash * 1.3;
            r.bob.rotation.x = dash * 0.4 + stomp * 0.2;
            r.head.rotation.x = 0.3 - stomp * 0.9;
            r.armL.rotation.x = -0.6 - dash * 0.8;
            r.armR.rotation.x = -0.6 - dash * 0.8;
            r.armL.rotation.z = 0.6;
            r.armR.rotation.z = -0.6;
            break;
          }
          case "buyer": {
            // Victory: jump, fist pump, spin on the landing.
            const jump = pulse(ph, 0, 0.35);
            const pump = Math.max(0, Math.sin(ph * Math.PI * 6)) * beat(ph, 0.15, 0.4);
            r.bob.position.y += jump * 0.7;
            r.armR.rotation.x = -1.2 - pump * 1.5;
            r.armR.rotation.z = -0.4;
            r.armL.rotation.x = -0.4;
            r.armL.rotation.z = 0.4;
            r.legL.rotation.x = jump * 0.6;
            r.legR.rotation.x = jump * 0.6;
            r.bob.rotation.y = beat(ph, 0.5, 0.85) * Math.PI * 2;
            break;
          }
          case "clinician": {
            // Flip the page, tap it, look up and nod.
            const flip = pulse(ph, 0, 0.25);
            const tap = Math.max(0, Math.sin(ph * Math.PI * 10)) * beat(ph, 0.3, 0.55);
            const up = beat(ph, 0.6, 0.8);
            r.armL.rotation.x = -1.2 - flip * 0.5;
            r.armL.rotation.z = 0.4;
            r.armR.rotation.x = -1.1 - tap * 0.5;
            r.armR.rotation.z = -0.5;
            r.head.rotation.x = 0.3 - up * 0.6;
            r.head.rotation.y = up * 0.3;
            break;
          }
        }
      }

      const blink = Math.sin(t * 1.3 + seed) > 0.985 ? 0.1 : 1;
      r.eyes.forEach((e) => {
        e.scale.z = blink;
      });
    },
  };
}
