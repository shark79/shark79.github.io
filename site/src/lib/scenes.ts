import * as THREE from "three";
import { bounce, contactShadow, part } from "@/lib/toon";
import { character, type Role } from "@/lib/characters";

/**
 * One accent hue and neutrals, nothing else — the 3D has to read as part of
 * the same site, not a toy dropped on top of it. Two sets so the scenes stay
 * legible against a near-black and a near-white background, plus a dedicated
 * outline tone, which is what does most of the work.
 */
export const PALETTES = {
  dark: {
    accent: 0x9a8bff,
    accentDim: 0x6f61c8,
    neutral: 0xe8e8ea,
    neutralDim: 0x8b8b95,
    deep: 0x3a3a44,
    outline: 0x16161c,
  },
  light: {
    accent: 0x6d4df6,
    accentDim: 0x9c8bf5,
    neutral: 0xd6d6de,
    neutralDim: 0xa6a6b2,
    deep: 0xbcbcc8,
    outline: 0x1c1c22,
  },
} as const;

export type Palette = {
  accent: number;
  accentDim: number;
  neutral: number;
  neutralDim: number;
  deep: number;
  outline: number;
};

export type Handle = {
  tick: (t: number) => void;
  /** How close to sit and what height to look at. Framing is most of it. */
  frame?: { z: number; y: number };
  /** Objects a tap can land on, and what to do when one is hit. */
  targets?: THREE.Object3D[];
  hit?: (object: THREE.Object3D, t: number) => void;
};

export type SceneBuilder = (group: THREE.Group, p: Palette) => Handle;

/** Everything sits on the same implied floor, which is half the grounding. */
function floor(group: THREE.Group, radius: number, y = -1.15) {
  const blob = contactShadow(radius);
  blob.position.y = y;
  blob.material.opacity = 0.4;
  group.add(blob);
  return blob;
}

/** Shared "poke it and it responds" bookkeeping. */
function reactor() {
  const poked = new Map<THREE.Object3D, number>();
  return {
    hit(object: THREE.Object3D, t: number) {
      poked.set(object, t);
    },
    amount(object: THREE.Object3D, t: number, dur = 0.9) {
      const at = poked.get(object);
      if (at === undefined) return 0;
      const since = t - at;
      return since >= 0 && since < dur ? bounce(since / dur) : 0;
    },
  };
}

/* ------------------------------------------------------------------ *
 * Level 02 — the agent team, as five creatures.
 * ------------------------------------------------------------------ */
const agents: SceneBuilder = (group, p) => {
  const roles: Role[] = [
    "backend",
    "frontend",
    "orchestrator",
    "qa",
    "adversary",
  ];
  const cast = roles.map((role, i) => {
    const c = character(role, p);
    const lead = role === "orchestrator";
    const x = (i - 2) * 1.2;
    c.root.position.set(x, -1.15, lead ? 0.55 : 0);
    c.root.rotation.y = -x * 0.11;
    if (lead) c.root.scale.setScalar(1.12);
    group.add(c.root);
    return c;
  });

  const targets = cast.flatMap((c) => c.targets);
  const owner = new Map<THREE.Object3D, (typeof cast)[number]>();
  cast.forEach((c) => c.targets.forEach((o) => owner.set(o, c)));

  return {
    frame: { z: 5.1, y: -0.12 },
    tick: (t) => cast.forEach((c) => c.update(t)),
    targets,
    hit: (object, t) => {
      // Tapping any part of a creature pokes the whole creature.
      let node: THREE.Object3D | null = object;
      while (node && !owner.has(node)) node = node.parent;
      if (node) owner.get(node)!.poke(t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 03 — one seat, two buyers, a race you can watch land.
 * ------------------------------------------------------------------ */
/** After the winner lands, the loser gets pushed back out. */
const arrivedEase = (k: number) => (k > 0.8 ? bounce((k - 0.8) / 0.2) : 0);

const seats: SceneBuilder = (group, p) => {
  const rows = 3;
  const cols = 7;
  const hotR = 1;
  const hotC = 3;
  let hot!: THREE.Mesh;
  const all: THREE.Mesh[] = [];

  const deck = new THREE.Group();
  deck.rotation.x = -0.34;
  group.add(deck);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isHot = r === hotR && c === hotC;
      const seat = part(
        new THREE.BoxGeometry(0.5, 0.16, 0.5),
        isHot ? p.accent : p.deep,
        p.outline,
        1.06,
      );
      // A little seat back, so it reads as a seat and not a tile.
      const back = part(
        new THREE.BoxGeometry(0.5, 0.3, 0.12),
        isHot ? p.accentDim : p.deep,
        p.outline,
        1.08,
      );
      back.position.set(0, 0.2, -0.2);
      seat.add(back);
      seat.position.set((c - (cols - 1) / 2) * 0.76, 0, (r - 1) * 0.86);
      deck.add(seat);
      all.push(seat);
      if (isHot) hot = seat;
    }
  }
  floor(group, 3.4, -0.75);

  // Two buyers, not two dots. Parented to the group, not the tilted deck, so
  // they stand upright on it instead of lying back with it.
  const buyerA = character("buyer", p, { tone: p.accent });
  const buyerB = character("buyer", p, { tone: p.neutralDim });
  buyerA.root.scale.setScalar(0.62);
  buyerB.root.scale.setScalar(0.62);
  group.add(buyerA.root, buyerB.root);
  const runnerA = buyerA.root;
  const runnerB = buyerB.root;

  const react = reactor();

  return {
    frame: { z: 6.6, y: -0.1 },
    tick: (t) => {
      const k = (t * 0.42) % 1;
      const travel = k < 0.8 ? k / 0.8 : 1;
      const e = travel * travel * (3 - 2 * travel);

      // Both converge on the seat. One arrives, the other is turned away.
      const bounceBack = arrivedEase(k);
      runnerA.position.set(-3.4 + 2.95 * e, -1.02, 1.5 - 0.35 * e);
      runnerB.position.set(3.4 - 2.95 * (e - bounceBack * 0.55), -1.02, 1.5 - 0.35 * e);
      runnerA.rotation.y = Math.PI * 0.42;
      runnerB.rotation.y = -Math.PI * 0.42 + bounceBack * Math.PI * 0.5;
      buyerA.update(t);
      buyerB.update(t);
      const arrived = k > 0.8;

      const land = arrived ? bounce((k - 0.8) / 0.2) : 0;
      hot.scale.set(1 + land * 0.25, 1 + land * 1.5, 1 + land * 0.25);

      all.forEach((s, i) => {
        if (s === hot) return;
        const poked = react.amount(s, t);
        s.position.y = poked * 0.42 + Math.sin(t * 1.4 + i * 0.6) * 0.02;
        s.scale.setScalar(1 + poked * 0.12);
      });
      group.rotation.y = Math.sin(t * 0.2) * 0.16;
    },
    targets: all,
    hit: (object, t) => react.hit(object, t),
  };
};

/* ------------------------------------------------------------------ *
 * Level 04 — sweeping a field of companies for real sponsors.
 * ------------------------------------------------------------------ */
const scan: SceneBuilder = (group, p) => {
  const count = 36;
  const marks: { mesh: THREE.Mesh; angle: number; sponsor: boolean; base: number }[] = [];
  const react = reactor();

  const ring = new THREE.Group();
  ring.rotation.x = 0.32;
  group.add(ring);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 2.35 + (i % 3) * 0.55;
    const sponsor = i % 6 === 0;
    const h = sponsor ? 0.75 : 0.3 + ((i * 17) % 5) / 14;
    const tower = part(
      new THREE.BoxGeometry(0.3, h, 0.3),
      sponsor ? p.accent : p.deep,
      p.outline,
      1.08,
    );
    tower.position.set(Math.cos(angle) * radius, h / 2 - 0.9, Math.sin(angle) * radius);
    ring.add(tower);
    marks.push({ mesh: tower, angle, sponsor, base: h });
  }

  const scout = character("scout", p, { tone: p.accent });
  scout.root.position.y = -0.92;
  scout.root.scale.setScalar(0.62);
  ring.add(scout.root);

  const sweep = new THREE.Mesh(
    new THREE.CircleGeometry(3.3, 32, 0, 0.7),
    new THREE.MeshBasicMaterial({
      color: p.accent,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  sweep.rotation.x = -Math.PI / 2;
  sweep.position.y = -0.88;
  ring.add(sweep);

  return {
    frame: { z: 7.2, y: -0.25 },
    tick: (t) => {
      const angle = (t * 0.8) % (Math.PI * 2);
      sweep.rotation.z = -angle;
      scout.root.rotation.y = -angle + Math.PI / 2;
      scout.update(t);

      marks.forEach((m) => {
        let d = Math.abs(((m.angle - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        d = Math.PI - d;
        const lit = Math.max(0, 1 - d * 2.6);
        const poked = react.amount(m.mesh, t);
        const grow = m.sponsor ? lit * 0.9 : lit * 0.2;
        const h = m.base * (1 + grow + poked);
        m.mesh.scale.y = h / m.base;
        m.mesh.position.y = h / 2 - 0.9;
      });
    },
    targets: marks.map((m) => m.mesh),
    hit: (object, t) => react.hit(object, t),
  };
};

/* ------------------------------------------------------------------ *
 * Level 05 — one prompt splitting into focused agents.
 * ------------------------------------------------------------------ */
const split: SceneBuilder = (group, p) => {
  const boss = character("orchestrator", p);
  boss.root.position.y = -1.15;
  boss.root.scale.setScalar(0.8);
  group.add(boss.root);
  const core = boss.root;

  const kids: THREE.Mesh[] = [];
  const links: THREE.Line[] = [];
  const react = reactor();

  for (let i = 0; i < 3; i++) {
    const kid = part(new THREE.IcosahedronGeometry(0.42, 1), p.accent, p.outline, 1.1);
    group.add(kid);
    kids.push(kid);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: p.neutralDim, transparent: true, opacity: 0.45 }),
    );
    group.add(line);
    links.push(line);
  }

  return {
    frame: { z: 6.2, y: -0.15 },
    tick: (t) => {
      boss.update(t);
      core.rotation.y = Math.sin(t * 0.4) * 0.25;

      kids.forEach((kid, i) => {
        const a = t * 0.75 + (i / 3) * Math.PI * 2;
        const poke = react.amount(kid, t);
        const radius = 2.45 + poke * 0.9;
        kid.position.set(Math.cos(a) * radius, Math.sin(a + i * 0.6) * 1.05, Math.sin(a) * radius);
        kid.rotation.set(t * 1.1, t * 1.4, 0);
        kid.scale.setScalar(1 + poke * 0.4);
        const pos = links[i].geometry.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, 0, 0, 0);
        pos.setXYZ(1, kid.position.x, kid.position.y, kid.position.z);
        pos.needsUpdate = true;
      });
    },
    targets: [...boss.targets, ...kids],
    hit: (object, t) => {
      if (boss.targets.includes(object) || boss.targets.includes(object.parent!)) {
        boss.poke(t);
        return;
      }
      react.hit(object, t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 06 — lines of writing, one out of the author's pattern.
 * ------------------------------------------------------------------ */
const glyphs: SceneBuilder = (group, p) => {
  const rows = 9;
  const odd = 5;
  const bars: THREE.Mesh[] = [];
  const react = reactor();

  const page = new THREE.Group();
  page.rotation.set(0.14, -0.5, 0);
  group.add(page);

  for (let i = 0; i < rows; i++) {
    const w = 2.3 + ((i * 37) % 17) / 9;
    const isOdd = i === odd;
    const bar = part(
      new THREE.BoxGeometry(w, 0.16, 0.34),
      isOdd ? p.accent : p.neutralDim,
      p.outline,
      1.07,
    );
    bar.position.set((w - 4) / 2, (i - rows / 2) * 0.44, 0);
    page.add(bar);
    bars.push(bar);
  }
  const reader = character("scout", p, { tone: p.neutral });
  reader.root.position.set(-2.5, -2.05, 0.6);
  reader.root.scale.setScalar(0.62);
  reader.root.rotation.y = 0.6;
  group.add(reader.root);
  floor(group, 2.6, -2.3);

  return {
    frame: { z: 6.6, y: -0.5 },
    tick: (t) => {
      bars.forEach((bar, i) => {
        const isOdd = i === odd;
        const poke = react.amount(bar, t);
        bar.position.z =
          Math.sin(t * 1.1 + i * 0.5) * 0.14 +
          (isOdd ? 0.95 + Math.sin(t * 2.2) * 0.18 : 0) +
          poke * 0.7;
        bar.rotation.z = Math.sin(t * 0.7 + i) * 0.025 + (isOdd ? 0.14 : 0);
        bar.scale.y = 1 + poke * 0.6;
      });
      page.rotation.y = -0.5 + Math.sin(t * 0.28) * 0.14;
      reader.update(t);
    },
    targets: [...bars, ...reader.targets],
    hit: (object, t) => {
      if (reader.targets.includes(object)) reader.poke(t);
      else react.hit(object, t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 07 — required skills against what you have, gaps closing.
 * ------------------------------------------------------------------ */
const bars: SceneBuilder = (group, p) => {
  const n = 6;
  const need: THREE.Mesh[] = [];
  const have: THREE.Mesh[] = [];
  const react = reactor();

  const stage = new THREE.Group();
  stage.rotation.set(0.18, 0.48, 0);
  group.add(stage);

  for (let i = 0; i < n; i++) {
    const a = part(new THREE.BoxGeometry(0.42, 1, 0.42), p.deep, p.outline, 1.07);
    a.position.set((i - (n - 1) / 2) * 0.66, 0, -0.95);
    const b = part(new THREE.BoxGeometry(0.42, 1, 0.42), p.accent, p.outline, 1.07);
    b.position.set((i - (n - 1) / 2) * 0.66, 0, 0.95);
    stage.add(a, b);
    need.push(a);
    have.push(b);
  }
  const seeker = character("dev", p, { tone: p.neutral });
  seeker.root.position.set(0, -1.15, 0);
  seeker.root.scale.setScalar(0.62);
  stage.add(seeker.root);
  floor(group, 2.8, -1.4);

  const set = (m: THREE.Mesh, h: number) => {
    m.scale.y = h;
    m.position.y = h / 2 - 1.15;
  };

  return {
    frame: { z: 5.9, y: -0.15 },
    tick: (t) => {
      need.forEach((m, i) => set(m, 1.5 + Math.sin(i * 1.7) * 0.5 + react.amount(m, t)));
      have.forEach((m, i) => {
        const target = 1.5 + Math.sin(i * 1.7) * 0.5;
        const k = (Math.sin(t * 0.85 - i * 0.42) + 1) / 2;
        set(m, 0.35 + target * k + react.amount(m, t));
      });
      stage.rotation.y = 0.48 + Math.sin(t * 0.22) * 0.16;
      seeker.update(t);
    },
    targets: [...need, ...have, ...seeker.targets],
    hit: (object, t) => {
      if (seeker.targets.includes(object)) seeker.poke(t);
      else react.hit(object, t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 08 — eight regions, one carrying almost all of it.
 * ------------------------------------------------------------------ */
const spike: SceneBuilder = (group, p) => {
  const n = 8;
  const hotIndex = 5;
  const cols: THREE.Mesh[] = [];
  const react = reactor();

  const stage = new THREE.Group();
  stage.rotation.x = 0.2;
  group.add(stage);

  for (let i = 0; i < n; i++) {
    const col = part(
      new THREE.BoxGeometry(0.5, 1, 0.5),
      i === hotIndex ? p.accent : p.deep,
      p.outline,
      1.07,
    );
    col.position.x = (i - (n - 1) / 2) * 0.74;
    stage.add(col);
    cols.push(col);
  }
  const analyst = character("dev", p, { pose: "point", tone: p.neutral });
  analyst.root.position.set(-2.9, -1.2, 0.7);
  analyst.root.scale.setScalar(0.6);
  analyst.root.rotation.y = 0.5;
  stage.add(analyst.root);
  floor(group, 3.2, -1.35);

  const crown = part(new THREE.TorusGeometry(0.42, 0.05, 8, 24), p.accent, p.outline, 1.14);
  crown.rotation.x = Math.PI / 2;
  stage.add(crown);

  return {
    frame: { z: 7.3, y: -0.3 },
    tick: (t) => {
      const cycle = (t * 0.42) % 3.4;
      const grow = Math.min(1, cycle / 1.3);
      cols.forEach((col, i) => {
        const poke = react.amount(col, t);
        const h =
          (i === hotIndex ? 0.5 + grow * 3.3 : 0.5 + ((i * 13) % 7) / 11) + poke * 0.8;
        col.scale.y = h;
        col.position.y = h / 2 - 1.2;
      });
      const hot = cols[hotIndex];
      crown.position.set(hot.position.x, hot.position.y + hot.scale.y / 2 + 0.22, 0);
      crown.rotation.z = t * 0.9;
      crown.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
      stage.rotation.y = Math.sin(t * 0.22) * 0.24;
      analyst.update(t);
    },
    targets: [...cols, ...analyst.targets],
    hit: (object, t) => {
      if (analyst.targets.includes(object)) analyst.poke(t);
      else react.hit(object, t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 09 — a stream of note lines, one fabricated.
 * ------------------------------------------------------------------ */
const stream: SceneBuilder = (group, p) => {
  const n = 15;
  const items: THREE.Mesh[] = [];
  const react = reactor();
  group.rotation.y = 0.26;

  for (let i = 0; i < n; i++) {
    const bad = i % 5 === 2;
    const mesh = part(
      new THREE.BoxGeometry(bad ? 1 : 1.9 + ((i * 29) % 11) / 9, 0.15, 0.32),
      bad ? p.accent : p.neutralDim,
      p.outline,
      1.07,
    );
    mesh.userData.bad = bad;
    group.add(mesh);
    items.push(mesh);
  }

  const reader = character("clinician", p, { tone: p.neutral });
  reader.root.position.set(-1.9, -1.45, 1.2);
  reader.root.scale.setScalar(0.6);
  reader.root.rotation.y = 0.75;
  group.add(reader.root);
  floor(group, 2.4, -1.5);

  return {
    frame: { z: 6.4, y: -0.25 },
    tick: (t) => {
      items.forEach((m, i) => {
        const z = ((t * 1.15 + i * 0.6) % 9) - 4.5;
        const poke = react.amount(m, t);
        m.position.set(
          m.userData.bad ? Math.sin(t * 5 + i) * 0.2 : 0,
          ((i % 4) - 1.5) * 0.45,
          z,
        );
        m.scale.setScalar(1 + poke * 0.5);
        if (m.userData.bad) m.rotation.z = Math.sin(t * 6 + i) * 0.22 + poke * 0.6;
      });
      reader.update(t);
    },
    targets: [...items, ...reader.targets],
    hit: (object, t) => {
      if (reader.targets.includes(object)) reader.poke(t);
      else react.hit(object, t);
    },
  };
};

/* ------------------------------------------------------------------ *
 * Level 01 — the person: a core, a ring, and the work orbiting it.
 * ------------------------------------------------------------------ */
const profile: SceneBuilder = (group, p) => {
  const me = character("dev", p, { tone: p.accent });
  me.root.position.y = -1.4;
  group.add(me.root);
  const core = me.root;
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.45, 1),
    new THREE.MeshBasicMaterial({ color: p.accent, wireframe: true, transparent: true, opacity: 0.22 }),
  );
  shell.position.y = -0.25;
  group.add(shell);
  floor(group, 1.5, -1.4);

  const ring = part(new THREE.TorusGeometry(2.15, 0.035, 8, 48), p.neutralDim, p.outline, 1.3);
  ring.rotation.x = Math.PI / 2.5;
  group.add(ring);

  const cubes: THREE.Mesh[] = [];
  const react = reactor();
  for (let i = 0; i < 9; i++) {
    const cube = part(
      new THREE.BoxGeometry(0.26, 0.26, 0.26),
      i % 3 === 0 ? p.accent : p.neutralDim,
      p.outline,
      1.11,
    );
    group.add(cube);
    cubes.push(cube);
  }

  return {
    frame: { z: 6.0, y: -0.2 },
    tick: (t) => {
      me.update(t);
      core.rotation.y = Math.sin(t * 0.35) * 0.22;
      shell.rotation.set(-t * 0.12, -t * 0.2, 0);
      shell.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03);
      ring.rotation.z = t * 0.14;

      cubes.forEach((cube, i) => {
        const a = t * 0.46 + (i / cubes.length) * Math.PI * 2;
        const poke = react.amount(cube, t);
        const r = 2.15 + poke * 0.8;
        cube.position.set(Math.cos(a) * r, Math.sin(a * 1.5 + i) * 0.5, Math.sin(a) * r);
        cube.rotation.set(t * 0.7 + i, t * 0.5, 0);
        cube.scale.setScalar(1 + poke * 0.5);
      });
    },
    targets: [...me.targets, ...cubes],
    hit: (object, t) => {
      if (me.targets.includes(object)) me.poke(t);
      else react.hit(object, t);
    },
  };
};

export const SCENES: Record<string, SceneBuilder> = {
  about: profile,
  devteam: agents,
  reservation: seats,
  jobfinder: scan,
  agentcore: split,
  styloguard: glyphs,
  skillsynq: bars,
  googlefiber: spike,
  accuracy: stream,
};
