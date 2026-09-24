import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { RoomId } from "@/lib/content";

/**
 * Procedural clay geometry + materials for the castle. Everything here is
 * built from primitives at runtime — no model or texture files. A single
 * small noise canvas gives every clay surface tactile paper-grain.
 */

export const COLOR = {
  blush: 0xf6b8ae,
  apricot: 0xf9cba0,
  butter: 0xfbe6a6,
  cream: 0xfff3df,
  cloud: 0xfffcf7,
  terracotta: 0xc4523f,
  inkOrange: 0xa8561a,
  ink: 0x1b1714,
  bg: 0xfbf7f1,
  sage: 0xc9d6ad, // just for the pond water; kept muted so it doesn't fight the warm palette
} as const;

/* ------------------------------------------------------------- grain map */

let grain: THREE.CanvasTexture | null = null;

/** One 128px noise canvas, reused (with repeat) across every clay material. */
function getGrain(): THREE.CanvasTexture {
  if (grain) return grain;
  // Small + low-contrast + linear-filtered on repeat: reads as soft paper
  // mottling. A big high-contrast noise map here aliases into hard moiré
  // bands under minification — the opposite of "tactile grain".
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 222 + Math.random() * 26;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grain = new THREE.CanvasTexture(canvas);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(2.5, 2.5);
  grain.colorSpace = THREE.NoColorSpace;
  grain.generateMipmaps = true;
  grain.minFilter = THREE.LinearMipmapLinearFilter;
  grain.magFilter = THREE.LinearFilter;
  return grain;
}

export function disposeGrain() {
  grain?.dispose();
  grain = null;
}

/* ----------------------------------------------------------------- clay */

export function clay(color: number, opts: { roughness?: number; sheen?: number; bump?: number } = {}) {
  // Note: normal/bump perturbation is deliberately skipped — on the extruded
  // arch/leaf shapes (irregular UVs from ExtrudeGeometry) it read as hard
  // banding under the sheen highlight, not soft grain. roughnessMap alone
  // gives the tactile variation without that artifact.
  // A tiny self-emissive floor (same hue, ~6%) keeps pastels reading as
  // themselves in shadow instead of sliding toward brown/olive — a fully
  // shadow-lit #FBE6A6 butter roof shouldn't look like a different color.
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: opts.roughness ?? 0.78,
    metalness: 0,
    sheen: opts.sheen ?? 0.35,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.85,
    roughnessMap: getGrain(),
    emissive: color,
    emissiveIntensity: 0.06,
  });
}

export function roundedBox(w: number, h: number, d: number, radius = 0.08, segments = 2) {
  return new RoundedBoxGeometry(w, h, d, segments, radius);
}

function mesh(geo: THREE.BufferGeometry, color: number, opts?: Parameters<typeof clay>[1]) {
  const m = new THREE.Mesh(geo, clay(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ------------------------------------------------------------- island & roofs */

/** A rounded-top mesa that tapers to a point underneath — the classic floating island trick. */
export function buildIsland(): THREE.Group {
  const g = new THREE.Group();
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(3.9, 0),
    new THREE.Vector2(4.55, -0.22),
    new THREE.Vector2(4.7, -0.5),
    new THREE.Vector2(4.25, -0.9),
    new THREE.Vector2(2.7, -1.55),
    new THREE.Vector2(0.9, -2.15),
    new THREE.Vector2(0, -2.35),
  ];
  const geo = new THREE.LatheGeometry(pts, 28);
  g.add(mesh(geo, COLOR.cream, { roughness: 0.88, sheen: 0.15 }));
  return g;
}

/** A soft bell-curved conical roof with a slight eave overhang, via a lathed profile. */
export function bellRoof(baseRadius: number, height: number, color: number) {
  const pts = [
    new THREE.Vector2(0, height),
    new THREE.Vector2(baseRadius * 0.1, height * 0.92),
    new THREE.Vector2(baseRadius * 0.52, height * 0.6),
    new THREE.Vector2(baseRadius * 0.9, height * 0.2),
    new THREE.Vector2(baseRadius * 1.18, height * 0.05), // eave lip flares past the wall
    new THREE.Vector2(baseRadius * 1.02, 0),
  ];
  return mesh(new THREE.LatheGeometry(pts, 20), color, { roughness: 0.6, sheen: 0.5 });
}

/**
 * A tower body: either a rounded-box (the square keep) or a round
 * cylinder-with-bevelled-cap (corner towers, turret) — plus faint stone
 * course lines. Returns the group and its top Y.
 */
export function buildTower(w: number, h: number, d: number, wallColor: number, baseY = 0, round = false) {
  const g = new THREE.Group();
  let wall: THREE.Mesh;
  if (round) {
    const r = w / 2;
    wall = mesh(new THREE.CylinderGeometry(r * 0.93, r, h, 18), wallColor, { roughness: 0.82 });
    const cap = mesh(new THREE.TorusGeometry(r * 1.03, r * 0.06, 8, 20), wallColor, { roughness: 0.8 });
    cap.rotation.x = Math.PI / 2;
    cap.position.y = baseY + 0.03;
    g.add(cap);
  } else {
    wall = mesh(roundedBox(w, h, d, 0.14), wallColor, { roughness: 0.82 });
  }
  wall.position.y = baseY + h / 2;
  g.add(wall);

  const courses = 3;
  for (let i = 1; i <= courses; i++) {
    const strip = round
      ? mesh(new THREE.TorusGeometry((w / 2) * 0.965, 0.014, 6, 18), COLOR.ink, { roughness: 0.9 })
      : mesh(roundedBox(w + 0.015, 0.03, d + 0.015, 0.02, 1), COLOR.ink, { roughness: 0.9 });
    if (round) strip.rotation.x = Math.PI / 2;
    const mat = strip.material as THREE.MeshPhysicalMaterial;
    mat.opacity = 0.14;
    mat.transparent = true;
    strip.position.y = baseY + (h * i) / (courses + 1);
    strip.castShadow = false;
    g.add(strip);
  }
  return { group: g, topY: baseY + h };
}

/* --------------------------------------------------------------- openings */

export type Leaf = { pivot: THREE.Group; axis: "x" | "y"; openSign: 1 | -1; maxOpen: number };

export type OpeningRig = {
  id: RoomId;
  group: THREE.Group;
  leaves: Leaf[];
  light: THREE.PointLight;
  glow: THREE.Mesh;
  hit: THREE.Mesh;
  anchor: THREE.Vector3;
};

function pinnedSign(label: string): THREE.Group {
  const g = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 56;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFF3DF";
  ctx.fillRect(0, 0, 96, 56);
  ctx.fillStyle = "#1B1714";
  ctx.font = "700 30px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 48, 30);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    roundedBox(0.32, 0.19, 0.025, 0.02, 1),
    new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.7, metalness: 0 }),
  );
  board.castShadow = true;
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), clay(COLOR.inkOrange, { roughness: 0.4 }));
  pin.position.y = 0.075;
  g.add(board, pin);
  return g;
}

type OpeningKind = "arch" | "window" | "double" | "round" | "flap";

/** Builds one door/shutter/hatch opening: leaves, an interior light, a lit-glow pane, a hit box, and a pinned number sign. */
export function buildOpening(
  id: RoomId,
  n: string,
  kind: OpeningKind,
  w: number,
  h: number,
  anchor: THREE.Vector3,
  leafColor: number = COLOR.apricot,
): OpeningRig {
  const group = new THREE.Group();
  group.position.copy(anchor);

  const leaves: Leaf[] = [];
  const frameColor = COLOR.cream;

  // Arched gates have a fanlight above the door line, so their glow needs
  // extra headroom to match.
  const recessH = kind === "arch" ? h * 1.3 : h * 0.96;
  const recessOffsetY = kind === "arch" ? h * 0.12 : 0;

  // A warm glow right at the threshold when the room is lit. No opaque
  // backing plane here on purpose — every opening now has a real interior
  // behind it (see castle-interiors.ts), and an opaque plane in front of
  // that interior would just hide it. Additive blending means this can
  // never occlude what's behind it either, only brighten it.
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.9, recessH * 0.94),
    new THREE.MeshBasicMaterial({ color: COLOR.butter, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  glow.position.set(0, recessOffsetY, 0.01);
  group.add(glow);

  const light = new THREE.PointLight(COLOR.butter, 0, 3.2, 2);
  light.position.set(0, 0, 0.3);
  group.add(light);

  // `hingeX` is where the leaf's outer edge (the hinge) sits. The leaf
  // geometry is `|hingeX|` wide and centered on its own origin, so within the
  // pivot (which sits AT the hinge) its center must be offset by half that —
  // not the full `hingeX`, which would double-place it back near center.
  function addLeaf(leafMesh: THREE.Mesh, hingeX: number, side: 1 | -1, maxOpen: number) {
    const pivot = new THREE.Group();
    pivot.position.x = hingeX;
    leafMesh.position.x = -hingeX / 2;
    pivot.add(leafMesh);
    group.add(pivot);
    leaves.push({ pivot, axis: "y", openSign: side, maxOpen });
  }

  if (kind === "arch") {
    // A rectangular double door (built from the same well-tested primitive as the
    // windows) under a flat fanlight transom — reads as an arched gate without the
    // custom Shape/ExtrudeGeometry triangulation that banded badly on a tall door.
    const hw = w / 2;
    const doorH = h * 0.76;
    const transomR = hw + 0.04;
    const fan = new THREE.Mesh(
      new THREE.CircleGeometry(transomR, 20, 0, Math.PI),
      clay(frameColor, { roughness: 0.7 }),
    );
    fan.position.set(0, doorH, -0.015);
    group.add(fan);
    const fanRim = new THREE.Mesh(new THREE.TorusGeometry(transomR, 0.03, 6, 20, Math.PI), clay(leafColor, { roughness: 0.55, sheen: 0.5 }));
    fanRim.position.set(0, doorH, -0.01);
    group.add(fanRim);

    const leftM = mesh(roundedBox(hw - 0.01, doorH, 0.07, 0.04, 1), leafColor, { roughness: 0.55, sheen: 0.5 });
    const rightM = mesh(roundedBox(hw - 0.01, doorH, 0.07, 0.04, 1), leafColor, { roughness: 0.55, sheen: 0.5 });
    leftM.position.y = rightM.position.y = doorH / 2 - h / 2;
    addLeaf(leftM, -hw, -1, 1.9);
    addLeaf(rightM, hw, 1, 1.9);
  } else if (kind === "round") {
    const r = w / 2;
    const left = new THREE.Mesh(halfDiscExtrude(r, "left"), clay(leafColor, { roughness: 0.6, sheen: 0.5 }));
    const right = new THREE.Mesh(halfDiscExtrude(r, "right"), clay(leafColor, { roughness: 0.6, sheen: 0.5 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.03, 0.035, 8, 24), clay(frameColor));
    ring.position.z = -0.02;
    group.add(ring);
    addLeaf(left, 0, -1, 1.7);
    addLeaf(right, 0, 1, 1.7);
  } else if (kind === "flap") {
    const flap = mesh(roundedBox(w, h, 0.05, 0.03, 1), leafColor, { roughness: 0.6, sheen: 0.5 });
    const pivot = new THREE.Group();
    pivot.position.y = -h / 2;
    flap.position.y = h / 2;
    pivot.add(flap);
    group.add(pivot);
    leaves.push({ pivot, axis: "x", openSign: -1, maxOpen: 1.4 });
  } else {
    // window (single-wide shutters) or double (balcony doors) — same rectangular-leaf pattern
    const hw = w / 2;
    const leftM = mesh(roundedBox(hw, h, 0.06, 0.03, 1), leafColor, { roughness: 0.6, sheen: 0.5 });
    const rightM = mesh(roundedBox(hw, h, 0.06, 0.03, 1), leafColor, { roughness: 0.6, sheen: 0.5 });
    addLeaf(leftM, -hw, -1, kind === "double" ? 2.0 : 1.75);
    addLeaf(rightM, hw, 1, kind === "double" ? 2.0 : 1.75);
  }

  // Modest, not-too-generous padding: several openings stack close together
  // on the same facade, and an over-padded hit box swallows its neighbor's
  // clicks. Not using `recessH` here on purpose — the fanlight doesn't need
  // full hover coverage, correct room targeting matters more.
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.6),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hit.userData.roomId = id;
  group.add(hit);

  const sign = pinnedSign(n);
  sign.position.set(w / 2 + 0.24, h / 2 + 0.1, 0.15);
  sign.rotation.z = -0.08;
  group.add(sign);

  return { id, group, leaves, light, glow, hit, anchor: anchor.clone() };
}

function halfDiscExtrude(r: number, side: "left" | "right") {
  const shape = new THREE.Shape();
  const sign = side === "right" ? 1 : -1;
  shape.moveTo(0, -r);
  const segs = 16;
  // Start at i=1: i=0 would duplicate the moveTo point with a zero-length
  // segment, which triangulated into visible banding on the door leaves.
  for (let i = 1; i <= segs; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / segs;
    shape.lineTo(sign * Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.lineTo(0, -r);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 });
  geo.translate(0, 0, -0.025);
  return geo;
}

/* -------------------------------------------------------------- props */

export function buildFlowerBox(width: number) {
  const g = new THREE.Group();
  const box = mesh(roundedBox(width, 0.14, 0.14, 0.02, 1), COLOR.terracotta, { roughness: 0.75 });
  g.add(box);
  const count = Math.max(3, Math.round(width * 6));
  const bud = new THREE.SphereGeometry(0.035, 6, 5);
  const inst = new THREE.InstancedMesh(bud, clay(COLOR.blush, { roughness: 0.55, sheen: 0.6 }), count);
  const petalColors = [COLOR.blush, COLOR.apricot, COLOR.butter];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set((i / (count - 1) - 0.5) * (width - 0.1), 0.1, (Math.random() - 0.5) * 0.05);
    dummy.scale.setScalar(0.8 + Math.random() * 0.5);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    inst.setColorAt(i, new THREE.Color(petalColors[i % petalColors.length]));
  }
  inst.castShadow = true;
  g.add(inst);
  return g;
}

let puffGeo: THREE.SphereGeometry | null = null;
/** Shared smooth-sphere puff geometry (20x14 segments — genuinely round, not faceted). */
function cloudPuffGeometry() {
  puffGeo ??= new THREE.SphereGeometry(1, 20, 14);
  return puffGeo;
}

function cloudMaterial(roughness: number, sheen: number) {
  // Near-white; the faint warm underside comes for free from the scene's
  // tan hemisphere ground-bounce lighting the puffs' lower hemisphere.
  return clay(COLOR.cloud, { roughness, sheen });
}

/** A handful of soft, fewer-but-bigger drifting cloud puffs, instanced. Tight
 * overlapping offsets so puffs read as one fluffy mass, not separate potatoes. */
export function buildCloudField(count: number, radius: number, yRange: [number, number]) {
  const inst = new THREE.InstancedMesh(cloudPuffGeometry(), cloudMaterial(0.9, 0.12), count * 5);
  const dummy = new THREE.Object3D();
  let idx = 0;
  const clouds: { angle: number; r: number; y: number; speed: number }[] = [];
  for (let c = 0; c < count; c++) {
    const angle = Math.random() * Math.PI * 2;
    const r = radius * (0.75 + Math.random() * 0.5);
    const y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
    const speed = 0.015 + Math.random() * 0.02;
    clouds.push({ angle, r, y, speed });
    const cx = Math.cos(angle) * r;
    const cz = Math.sin(angle) * r;
    const puffs = 5;
    const baseS = 0.38 + Math.random() * 0.16;
    for (let p = 0; p < puffs; p++) {
      dummy.position.set(cx + (Math.random() - 0.5) * 0.7, y + (Math.random() - 0.5) * 0.1, cz + (Math.random() - 0.5) * 0.38);
      const s = baseS * (0.82 + Math.random() * 0.28);
      dummy.scale.set(s, s * 0.7, s);
      dummy.updateMatrix();
      inst.setMatrixAt(idx++, dummy.matrix);
    }
  }
  inst.frustumCulled = false;
  return { mesh: inst, clouds };
}

/** A ring of soft cloud puffs around the island's rim — the "floating on clouds" skirt
 * that replaces a hard disc edge. */
export function buildCloudSkirt(count: number, radius: number, y: number) {
  const inst = new THREE.InstancedMesh(cloudPuffGeometry(), cloudMaterial(0.9, 0.15), count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
    const r = radius * (0.94 + Math.random() * 0.18);
    const s = 0.5 + Math.random() * 0.45;
    dummy.position.set(Math.cos(a) * r, y + (Math.random() - 0.5) * 0.3, Math.sin(a) * r);
    dummy.scale.set(s, s * 0.65, s);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  inst.frustumCulled = false;
  return inst;
}

export function buildBird() {
  const g = new THREE.Group();
  const body = mesh(new THREE.ConeGeometry(0.03, 0.14, 6), COLOR.ink, { roughness: 0.5 });
  body.rotation.x = Math.PI / 2;
  const wingGeo = new THREE.ConeGeometry(0.09, 0.02, 4);
  const wingL = mesh(wingGeo, COLOR.ink, { roughness: 0.5 });
  const wingR = mesh(wingGeo, COLOR.ink, { roughness: 0.5 });
  wingL.rotation.z = Math.PI / 2;
  wingR.rotation.z = -Math.PI / 2;
  wingL.position.x = -0.06;
  wingR.position.x = 0.06;
  g.add(body, wingL, wingR);
  g.userData.wings = [wingL, wingR];
  return g;
}

export function buildBalloon() {
  const g = new THREE.Group();
  const envelope = mesh(new THREE.IcosahedronGeometry(0.55, 1), COLOR.apricot, { roughness: 0.55, sheen: 0.5 });
  envelope.scale.set(1, 1.25, 1);
  const basket = mesh(roundedBox(0.22, 0.16, 0.22, 0.02, 1), COLOR.terracotta, { roughness: 0.8 });
  basket.position.y = -0.85;
  const lineMat = new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.5 });
  for (const x of [-0.09, 0.09]) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x * 1.4, -0.35, 0), new THREE.Vector3(x, -0.78, 0)]),
      lineMat,
    );
    g.add(line);
  }
  g.add(envelope, basket);
  return g;
}

export function buildWeathervane() {
  const g = new THREE.Group();
  const rod = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), COLOR.inkOrange, { roughness: 0.4 });
  rod.position.y = 0.2;
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(-0.14, 0);
  arrowShape.lineTo(0.06, 0.045);
  arrowShape.lineTo(0.06, -0.045);
  arrowShape.closePath();
  const arrow = mesh(new THREE.ExtrudeGeometry(arrowShape, { depth: 0.012, bevelEnabled: false }), COLOR.terracotta, { roughness: 0.5, sheen: 0.5 });
  arrow.position.y = 0.4;
  const ns = mesh(new THREE.ConeGeometry(0.03, 0.09, 4), COLOR.inkOrange, { roughness: 0.4 });
  ns.position.y = 0.44;
  g.add(rod, arrow, ns);
  return g;
}

export function buildLantern() {
  const g = new THREE.Group();
  const post = mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.5, 6), COLOR.inkOrange, { roughness: 0.4 });
  post.position.y = 0.25;
  // Emissive glass sells the glow on its own — two real lights per lantern
  // pair (four total) isn't worth the shader cost across every frame.
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 8),
    new THREE.MeshPhysicalMaterial({ color: COLOR.butter, roughness: 0.3, transmission: 0.55, thickness: 0.3, emissive: COLOR.butter, emissiveIntensity: 0.9 }),
  );
  globe.position.y = 0.52;
  g.add(post, globe);
  return g;
}

export function buildBunting(from: THREE.Vector3, to: THREE.Vector3, count: number) {
  const g = new THREE.Group();
  const colors = [COLOR.blush, COLOR.apricot, COLOR.butter];
  const flagGeo = new THREE.ConeGeometry(0.045, 0.08, 3);
  const curveDrop = 0.18;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const p = from.clone().lerp(to, t);
    p.y -= Math.sin(t * Math.PI) * curveDrop;
    const flag = mesh(flagGeo, colors[i % colors.length], { roughness: 0.6, sheen: 0.5 });
    flag.rotation.z = Math.PI;
    flag.position.copy(p);
    g.add(flag);
  }
  const curvePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const p = from.clone().lerp(to, t);
    p.y -= Math.sin(t * Math.PI) * curveDrop;
    curvePts.push(p);
  }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePts), new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.4 }));
  g.add(line);
  return g;
}

export function buildPond(radius: number) {
  const g = new THREE.Group();
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshPhysicalMaterial({ color: COLOR.sage, roughness: 0.25, metalness: 0, transmission: 0.2, thickness: 0.4 }),
  );
  water.rotation.x = -Math.PI / 2;
  g.add(water);
  const rim = mesh(new THREE.TorusGeometry(radius + 0.03, 0.03, 6, 20), COLOR.cream, { roughness: 0.8 });
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.01;
  g.add(rim);
  for (let i = 0; i < 3; i++) {
    const pad = mesh(new THREE.CircleGeometry(0.07 + Math.random() * 0.04, 8), COLOR.apricot, { roughness: 0.6 });
    pad.rotation.x = -Math.PI / 2;
    const a = Math.random() * Math.PI * 2;
    const r = radius * (0.3 + Math.random() * 0.4);
    pad.position.set(Math.cos(a) * r, 0.015, Math.sin(a) * r);
    g.add(pad);
  }
  return g;
}

export function buildCrateStack() {
  const g = new THREE.Group();
  const sizes: [number, number, number][] = [
    [0.22, 0.18, 0.2],
    [0.18, 0.16, 0.17],
  ];
  let y = 0;
  sizes.forEach(([w, h, d], i) => {
    const c = mesh(roundedBox(w, h, d, 0.015, 1), i === 0 ? COLOR.apricot : COLOR.butter, { roughness: 0.85 });
    c.position.set((Math.random() - 0.5) * 0.05, y + h / 2, (Math.random() - 0.5) * 0.05);
    c.rotation.y = (Math.random() - 0.5) * 0.3;
    y += h;
    g.add(c);
  });
  const book = mesh(roundedBox(0.16, 0.03, 0.12, 0.008, 1), COLOR.terracotta, { roughness: 0.6 });
  book.position.set(0.14, 0.02, 0.02);
  book.rotation.y = 0.4;
  g.add(book);
  return g;
}

export function buildTelescope() {
  const g = new THREE.Group();
  const tripod = new THREE.Group();
  for (const a of [0, 2.1, 4.2]) {
    const leg = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 5), COLOR.inkOrange, { roughness: 0.4 });
    leg.position.set(Math.cos(a) * 0.07, 0.14, Math.sin(a) * 0.07);
    leg.rotation.z = Math.cos(a) * 0.3;
    leg.rotation.x = Math.sin(a) * 0.3;
    tripod.add(leg);
  }
  const tube = mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.32, 10), COLOR.terracotta, { roughness: 0.5, sheen: 0.5 });
  tube.rotation.z = Math.PI / 3.2;
  tube.position.set(0.04, 0.34, 0);
  g.add(tripod, tube);
  return g;
}

export function buildKite() {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.16);
  shape.lineTo(0.12, 0);
  shape.lineTo(0, -0.16);
  shape.lineTo(-0.12, 0);
  shape.closePath();
  const kite = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false }), COLOR.blush, { roughness: 0.6, sheen: 0.5 });
  g.add(kite);
  const tail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.16, 0),
      new THREE.Vector3(-0.04, -0.3, 0),
      new THREE.Vector3(0.04, -0.42, 0),
    ]),
    new THREE.LineBasicMaterial({ color: COLOR.terracotta, transparent: true, opacity: 0.7 }),
  );
  g.add(tail);
  return g;
}

/** A small clay fox, sitting, watching the gate. */
export function buildFox() {
  const g = new THREE.Group();
  const body = mesh(new THREE.CapsuleGeometry(0.07, 0.1, 4, 8), COLOR.apricot, { roughness: 0.65, sheen: 0.4 });
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.09;
  const head = mesh(new THREE.SphereGeometry(0.055, 10, 8), COLOR.apricot, { roughness: 0.65, sheen: 0.4 });
  head.position.set(0.1, 0.16, 0);
  const snout = mesh(new THREE.ConeGeometry(0.025, 0.06, 6), COLOR.cream, { roughness: 0.6 });
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(0.16, 0.14, 0);
  const earGeo = new THREE.ConeGeometry(0.02, 0.045, 4);
  const earL = mesh(earGeo, COLOR.terracotta, { roughness: 0.6 });
  const earR = mesh(earGeo, COLOR.terracotta, { roughness: 0.6 });
  earL.position.set(0.09, 0.21, 0.035);
  earR.position.set(0.09, 0.21, -0.035);
  const tail = mesh(new THREE.ConeGeometry(0.05, 0.22, 8), COLOR.blush, { roughness: 0.6, sheen: 0.4 });
  tail.rotation.z = Math.PI / 2.4;
  tail.position.set(-0.13, 0.14, 0);
  g.add(body, head, snout, earL, earR, tail);
  return g;
}

export function buildPennant() {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), COLOR.inkOrange, { roughness: 0.4 });
  pole.position.y = 0.55;
  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0.18);
  flagShape.lineTo(0.32, 0.06);
  flagShape.lineTo(0, -0.06);
  flagShape.closePath();
  const flag = mesh(new THREE.ExtrudeGeometry(flagShape, { depth: 0.008, bevelEnabled: false }), COLOR.terracotta, { roughness: 0.55, sheen: 0.5 });
  flag.position.y = 0.95;
  g.add(pole, flag);
  g.userData.flag = flag;
  return g;
}

/** A confetti burst: instanced flat pastel squares. Positions/velocities live in the returned buffers. */
export function buildConfetti(count: number, origin: THREE.Vector3) {
  const geo = new THREE.PlaneGeometry(0.06, 0.06);
  const colors = [COLOR.blush, COLOR.apricot, COLOR.butter, COLOR.terracotta];
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, vertexColors: true });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const rot = new Float32Array(count * 3);
  const dummy = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    pos[i * 3] = origin.x + (Math.random() - 0.5) * 0.6;
    pos[i * 3 + 1] = origin.y + Math.random() * 0.3;
    pos[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.6;
    dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
    c.set(colors[i % colors.length]);
    colorAttr.setXYZ(i, c.r, c.g, c.b);
    vel[i * 3] = (Math.random() - 0.5) * 0.6;
    vel[i * 3 + 1] = 0.6 + Math.random() * 0.5;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    rot[i * 3] = Math.random() * 4;
    rot[i * 3 + 1] = Math.random() * 4;
    rot[i * 3 + 2] = Math.random() * 4;
  }
  inst.geometry.setAttribute("color", colorAttr);
  return { mesh: inst, pos, vel, rot, count };
}

let dotGeo: THREE.CylinderGeometry | null = null;
function pathDotGeometry() {
  dotGeo ??= new THREE.CylinderGeometry(0.045, 0.05, 0.022, 8);
  return dotGeo;
}

/** A soft dotted path between waypoints — small rounded discs along a CatmullRom curve,
 * split into per-room segments so each can "light" independently as rooms are visited. */
export function buildPath(points: THREE.Vector3[]) {
  const segments: THREE.InstancedMesh[] = [];
  const g = new THREE.Group();
  const dummy = new THREE.Object3D();
  for (let i = 0; i < points.length - 1; i++) {
    const curve = new THREE.CatmullRomCurve3([points[i], points[i].clone().lerp(points[i + 1], 0.5).setY(0.02), points[i + 1]]);
    const dotsPerSegment = 7;
    const m = new THREE.InstancedMesh(
      pathDotGeometry(),
      new THREE.MeshStandardMaterial({ color: COLOR.cream, roughness: 0.55, emissive: COLOR.butter, emissiveIntensity: 0 }),
      dotsPerSegment,
    );
    for (let d = 0; d < dotsPerSegment; d++) {
      const p = curve.getPoint((d + 0.5) / dotsPerSegment);
      dummy.position.set(p.x, 0.015, p.z);
      dummy.updateMatrix();
      m.setMatrixAt(d, dummy.matrix);
    }
    m.receiveShadow = true;
    segments.push(m);
    g.add(m);
  }
  return { group: g, segments };
}
