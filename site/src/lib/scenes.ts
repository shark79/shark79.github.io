import * as THREE from "three";

/**
 * One accent hue and neutrals, nothing else — the 3D has to read as part of
 * the same site, not a toy dropped on top of it. Two sets so the scenes stay
 * legible against a near-black and a near-white background.
 */
export const PALETTES = {
  dark: {
    accent: 0x9a8bff,
    accentDim: 0x6f61c8,
    neutral: 0xe8e8ea,
    neutralDim: 0x7a7a80,
    deep: 0x3a3a44,
  },
  light: {
    accent: 0x6d4df6,
    accentDim: 0x9c8bf5,
    neutral: 0x2a2a2e,
    neutralDim: 0x8e8e96,
    deep: 0xc9c9d2,
  },
} as const;

export type Palette = {
  accent: number;
  accentDim: number;
  neutral: number;
  neutralDim: number;
  deep: number;
};
export type Tick = (t: number) => void;
export type SceneBuilder = (group: THREE.Group, p: Palette) => Tick;

// Lambert, not Standard: per-vertex lighting instead of a full PBR fragment
// shader. At these sizes the two are indistinguishable and this one is far
// cheaper to fill, which is most of what makes the scenes safe on a phone.
const solid = (color: number, opacity = 1) =>
  new THREE.MeshLambertMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });

const glow = (color: number) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });

/** Level 02 — five agents with distinct roles, passing work between them. */
const agents: SceneBuilder = (group, p) => {
  const roles: { marker: THREE.BufferGeometry; accent: boolean }[] = [
    { marker: new THREE.OctahedronGeometry(0.28), accent: true }, // orchestrator
    { marker: new THREE.BoxGeometry(0.42, 0.42, 0.42), accent: false }, // backend
    { marker: new THREE.PlaneGeometry(0.55, 0.4), accent: false }, // frontend
    { marker: new THREE.TorusGeometry(0.22, 0.07, 8, 20), accent: false }, // qa
    { marker: new THREE.ConeGeometry(0.26, 0.5, 16), accent: false }, // adversary
  ];

  const bodies: THREE.Group[] = [];
  roles.forEach((role, i) => {
    const lead = i === 0;
    const figure = new THREE.Group();
    const tone = lead ? p.accent : p.neutralDim;

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24, lead ? 0.62 : 0.5, 4, 12),
      solid(lead ? p.accentDim : p.deep),
    );
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 18, 14),
      solid(tone),
    );
    head.position.y = lead ? 0.68 : 0.6;
    const marker = new THREE.Mesh(role.marker, solid(tone));
    marker.position.y = lead ? 1.15 : 1.02;

    figure.add(body, head, marker);
    // Orchestrator centre-front, the four workers in an arc behind it.
    if (lead) {
      figure.position.set(0, 0.1, 1.1);
      figure.scale.setScalar(1.15);
    } else {
      const a = (-0.9 + (i - 1) * 0.6) * 1.0;
      figure.position.set(Math.sin(a) * 2.6, 0, Math.cos(a) * 2.6 - 1.2);
    }
    group.add(figure);
    bodies.push(figure);
  });

  // The task token: leaves the orchestrator, visits a worker, comes back.
  const token = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), glow(p.accent));
  group.add(token);

  return (t) => {
    bodies.forEach((f, i) => {
      f.position.y = (i === 0 ? 0.1 : 0) + Math.sin(t * 1.6 + i) * 0.07;
      f.rotation.y = Math.sin(t * 0.5 + i * 1.4) * 0.35;
    });
    const leg = (t * 0.45) % 4;
    const target = bodies[1 + Math.floor(leg)];
    const k = leg % 1;
    const out = Math.sin(k * Math.PI); // go and come back
    token.position.lerpVectors(
      bodies[0].position,
      target.position,
      out,
    );
    token.position.y += 1.25 + Math.sin(k * Math.PI) * 0.5;
    const s = 0.8 + out * 0.5;
    token.scale.setScalar(s);
  };
};

/** Level 03 — a seat block, two requests racing for the same seat. */
const seats: SceneBuilder = (group, p) => {
  const geo = new THREE.BoxGeometry(0.5, 0.14, 0.5);
  const rows = 3;
  const cols = 7;
  const hot = { r: 1, c: 3 };
  let hotMesh: THREE.Mesh | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isHot = r === hot.r && c === hot.c;
      const m = new THREE.Mesh(geo, solid(isHot ? p.accent : p.deep));
      m.position.set((c - (cols - 1) / 2) * 0.72, 0, (r - 1) * 0.8);
      m.rotation.x = -0.28;
      group.add(m);
      if (isHot) hotMesh = m;
    }
  }

  const a = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), glow(p.accent));
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), glow(p.neutral));
  group.add(a, b);
  const seat = hotMesh!.position.clone();

  return (t) => {
    const k = (t * 0.5) % 1;
    const ease = k * k;
    a.position.set(-4.2 + (seat.x + 4.2) * ease, 0.9 - ease * 0.5, -2.6 + (seat.z + 2.6) * ease);
    b.position.set(4.2 + (seat.x - 4.2) * ease, 0.9 - ease * 0.5, 2.6 + (seat.z - 2.6) * ease);
    const hit = k > 0.86 ? 1 : 0;
    hotMesh!.scale.y = 1 + hit * 2.4;
    a.visible = b.visible = k < 0.94;
    group.rotation.y = Math.sin(t * 0.22) * 0.22;
  };
};

/** Level 04 — a field of companies, a scan sweeping for real sponsors. */
const scan: SceneBuilder = (group, p) => {
  const count = 44;
  const geo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
  const marks: { mesh: THREE.Mesh; angle: number; sponsor: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 2.1 + (i % 3) * 0.62;
    const sponsor = i % 7 === 0;
    const mesh = new THREE.Mesh(geo, solid(sponsor ? p.accentDim : p.deep));
    mesh.position.set(
      Math.cos(angle) * radius,
      ((i % 5) - 2) * 0.24,
      Math.sin(angle) * radius,
    );
    group.add(mesh);
    marks.push({ mesh, angle, sponsor });
  }

  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.4),
    new THREE.MeshBasicMaterial({
      color: p.accent,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    }),
  );
  group.add(beam);

  return (t) => {
    const sweep = (t * 0.7) % (Math.PI * 2);
    beam.rotation.y = sweep;
    marks.forEach((m) => {
      let d = Math.abs(((m.angle - sweep + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      d = Math.PI - d;
      const near = Math.max(0, 1 - d * 2.2);
      const lift = m.sponsor ? near : near * 0.35;
      m.mesh.scale.setScalar(1 + lift * 1.5);
      m.mesh.rotation.y = t * 0.6;
    });
    group.rotation.x = 0.28;
  };
};

/** Level 05 — one prompt splitting into focused agents. */
const split: SceneBuilder = (group, p) => {
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), solid(p.accentDim));
  group.add(core);

  const kids: THREE.Mesh[] = [];
  const lines: THREE.Line[] = [];
  for (let i = 0; i < 3; i++) {
    const k = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), solid(p.accent));
    group.add(k);
    kids.push(k);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      new THREE.LineBasicMaterial({ color: p.neutralDim, transparent: true, opacity: 0.5 }),
    );
    group.add(line);
    lines.push(line);
  }

  return (t) => {
    core.rotation.y = t * 0.4;
    core.rotation.x = t * 0.22;
    const pulse = 1 + Math.sin(t * 2) * 0.05;
    core.scale.setScalar(pulse);
    kids.forEach((k, i) => {
      const a = t * 0.8 + (i / 3) * Math.PI * 2;
      const tilt = i * 0.5;
      k.position.set(Math.cos(a) * 2.5, Math.sin(a + tilt) * 1.2, Math.sin(a) * 2.5);
      k.rotation.y = t * 1.2;
      const pos = lines[i].geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, 0, 0, 0);
      pos.setXYZ(1, k.position.x, k.position.y, k.position.z);
      pos.needsUpdate = true;
    });
  };
};

/** Level 06 — lines of writing, one drifting out of the author's pattern. */
const glyphs: SceneBuilder = (group, p) => {
  const rows = 9;
  const bars: THREE.Mesh[] = [];
  for (let i = 0; i < rows; i++) {
    const w = 2.4 + ((i * 37) % 17) / 10;
    const odd = i === 5;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.12, 0.34),
      solid(odd ? p.accent : p.neutralDim, odd ? 1 : 0.75),
    );
    m.position.set(0, (i - rows / 2) * 0.42, 0);
    group.add(m);
    bars.push(m);
  }
  return (t) => {
    bars.forEach((b, i) => {
      const odd = i === 5;
      b.position.z = Math.sin(t * 1.1 + i * 0.5) * 0.18 + (odd ? 0.9 + Math.sin(t * 2) * 0.2 : 0);
      b.rotation.z = Math.sin(t * 0.7 + i) * 0.03 + (odd ? 0.12 : 0);
    });
    group.rotation.y = -0.5 + Math.sin(t * 0.3) * 0.18;
    group.rotation.x = 0.1;
  };
};

/** Level 07 — required skills against the ones you have, gaps bridged. */
const bars: SceneBuilder = (group, p) => {
  const n = 6;
  const need: THREE.Mesh[] = [];
  const have: THREE.Mesh[] = [];
  const geo = new THREE.BoxGeometry(0.38, 1, 0.38);
  for (let i = 0; i < n; i++) {
    const a = new THREE.Mesh(geo, solid(p.neutralDim));
    a.position.set((i - (n - 1) / 2) * 0.62, 0, -0.9);
    const b = new THREE.Mesh(geo, solid(p.accent));
    b.position.set((i - (n - 1) / 2) * 0.62, 0, 0.9);
    group.add(a, b);
    need.push(a);
    have.push(b);
  }
  return (t) => {
    need.forEach((m, i) => {
      const h = 1.4 + Math.sin(i * 1.7) * 0.5;
      m.scale.y = h;
      m.position.y = (h * 1) / 2 - 0.6;
    });
    have.forEach((m, i) => {
      const target = 1.4 + Math.sin(i * 1.7) * 0.5;
      const k = (Math.sin(t * 0.9 - i * 0.4) + 1) / 2;
      const h = 0.35 + target * k;
      m.scale.y = h;
      m.position.y = (h * 1) / 2 - 0.6;
    });
    group.rotation.y = 0.5 + Math.sin(t * 0.25) * 0.2;
    group.rotation.x = 0.16;
  };
};

/** Level 08 — eight regions, one carrying almost everything. */
const spike: SceneBuilder = (group, p) => {
  const n = 8;
  const cols: THREE.Mesh[] = [];
  const hot = 5;
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 1, 0.46),
      solid(i === hot ? p.accent : p.deep),
    );
    m.position.x = (i - (n - 1) / 2) * 0.7;
    group.add(m);
    cols.push(m);
  }
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.03, 8, 32),
    glow(p.accent),
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  return (t) => {
    const grow = Math.min(1, ((t * 0.5) % 3) / 1.2);
    cols.forEach((m, i) => {
      const base = i === hot ? 0.5 + grow * 3.4 : 0.5 + ((i * 13) % 7) / 12;
      m.scale.y = base;
      m.position.y = base / 2 - 1;
    });
    ring.position.set(cols[hot].position.x, cols[hot].scale.y - 1 + 0.1, 0);
    ring.scale.setScalar(1 + Math.sin(t * 3) * 0.12);
    group.rotation.y = Math.sin(t * 0.24) * 0.3;
    group.rotation.x = 0.2;
  };
};

/** Level 09 — a stream of note lines with one fabricated fragment. */
const stream: SceneBuilder = (group, p) => {
  const n = 16;
  const items: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const bad = i % 8 === 3;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(bad ? 0.9 : 1.7 + ((i * 29) % 11) / 10, 0.1, 0.28),
      solid(bad ? p.accent : p.neutralDim, bad ? 1 : 0.6),
    );
    m.userData.bad = bad;
    group.add(m);
    items.push(m);
  }
  return (t) => {
    items.forEach((m, i) => {
      const z = (((t * 1.1 + i * 0.55) % 9) - 4.5) * 1;
      m.position.set(m.userData.bad ? Math.sin(t * 4 + i) * 0.22 : 0, ((i % 4) - 1.5) * 0.4, z);
      const near = 1 - Math.min(1, Math.abs(z) / 4.5);
      (m.material as THREE.MeshLambertMaterial).opacity = m.userData.bad
        ? 0.5 + near * 0.5
        : 0.15 + near * 0.5;
      if (m.userData.bad) m.rotation.z = Math.sin(t * 6 + i) * 0.25;
    });
    group.rotation.y = 0.3;
  };
};

/** Level 01 — the person: a core with orbiting work. */
const profile: SceneBuilder = (group, p) => {
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    new THREE.MeshBasicMaterial({ color: p.accentDim, wireframe: true }),
  );
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.02, 8, 64),
    glow(p.neutralDim),
  );
  ring.rotation.x = Math.PI / 2.6;
  group.add(ring);

  const cubes: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const c = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.22, 0.22),
      solid(i % 3 === 0 ? p.accent : p.neutralDim),
    );
    group.add(c);
    cubes.push(c);
  }

  return (t) => {
    core.rotation.y = t * 0.3;
    core.rotation.x = t * 0.17;
    cubes.forEach((c, i) => {
      const a = t * 0.5 + (i / cubes.length) * Math.PI * 2;
      const r = 2.1;
      c.position.set(Math.cos(a) * r, Math.sin(a * 1.6 + i) * 0.5, Math.sin(a) * r);
      c.rotation.set(t * 0.8 + i, t * 0.6, 0);
    });
    ring.rotation.z = t * 0.12;
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
