import * as THREE from "three";
import type { RoomId } from "@/lib/content";
import { PAINTINGS } from "@/lib/content";
import { clay, roundedBox, COLOR } from "./castle-parts";

/**
 * Shallow interior dioramas behind each opening, plus the framed paintings
 * (Study, Hall, and the Gallery hall). Painting *textures* load lazily —
 * geometry is free and built up front, but network fetches only start once
 * `loadRoomTextures(id)` is called (the scene calls it as the camera nears
 * that room).
 */

export type PaintingMesh = {
  file: string;
  group: THREE.Group;
  picture: THREE.Mesh;
  frame: THREE.Mesh;
};

export type Interior = {
  group: THREE.Group;
  light?: THREE.PointLight;
  paintings: PaintingMesh[];
};

function shell(w: number, h: number, depth: number, wallColor: number, floorColor: number) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), clay(wallColor, { roughness: 0.9 }));
  wall.position.z = -depth;
  wall.receiveShadow = true;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, depth), clay(floorColor, { roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -h / 2, -depth / 2);
  floor.receiveShadow = true;
  g.add(wall, floor);
  return g;
}

/** One framed painting: clay frame + aspect-correct picture plane, texture applied later. */
function paintingFrame(file: string, w: number, h: number, tint: number, target = 0.4): PaintingMesh {
  const pw = target * (w / Math.max(w, h));
  const ph = target * (h / Math.max(w, h));
  const group = new THREE.Group();

  const frame = new THREE.Mesh(roundedBox(pw + 0.06, ph + 0.06, 0.035, 0.012, 1), clay(tint, { roughness: 0.55, sheen: 0.5 }));
  // Unlit on purpose: a lit material this close to several other light
  // sources (the opening's own light, hemisphere, key, fill) blows out to a
  // flat white rectangle — a framed photo should read the same regardless
  // of what's lighting the room around it. The warm grade is baked into
  // `color` as a multiplicative tint, not simulated via real lighting.
  const picture = new THREE.Mesh(
    new THREE.PlaneGeometry(pw, ph),
    new THREE.MeshBasicMaterial({ color: 0xe9d9c0 }),
  );
  picture.position.z = 0.02;
  frame.castShadow = true;

  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.05, 5),
    new THREE.MeshBasicMaterial({ color: COLOR.inkOrange }),
  );
  rail.position.set(0, ph / 2 + 0.05, 0);
  const cord = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, ph / 2 + 0.03, 0), new THREE.Vector3(0, ph / 2 + 0.16, 0)]),
    new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.35 }),
  );

  group.add(frame, picture, rail, cord);
  group.userData.roomFile = file;
  return { file, group, picture, frame };
}

const TINTS = [COLOR.blush, COLOR.apricot, COLOR.butter, COLOR.cream];
const loadedTextures = new Map<string, THREE.Texture>();
let loader: THREE.TextureLoader | null = null;

/** Kicks off (or reuses) a network fetch for one painting's optimized texture. */
function loadTexture(file: string): Promise<THREE.Texture> {
  const cached = loadedTextures.get(file);
  if (cached) return Promise.resolve(cached);
  loader ??= new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader!.load(
      `/gallery/paintings/${file}`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        loadedTextures.set(file, tex);
        resolve(tex);
      },
      undefined,
      reject,
    );
  });
}

/** Study (about) and Hall (experience): a shallow lit recess with a couple of props. */
export function buildSmallInterior(room: "about" | "experience"): Interior {
  // No dedicated interior light — the opening's own `rig.light` (right at the
  // threshold) already lights this shallow recess once the room is visited;
  // a real light budget adds up fast across six openings' worth of interiors.
  // Narrower than earlier drafts: this opening is only 0.62 wide, and props
  // positioned past roughly ±0.28 sit behind the wall/frame, invisible from
  // outside — everything here stays within that sightline.
  const g = shell(0.95, 1.05, 0.55, COLOR.cream, COLOR.apricot);

  if (room === "about") {
    // A little stacked bookshelf against the back wall + a desk lamp.
    for (let i = 0; i < 3; i++) {
      const book = new THREE.Mesh(roundedBox(0.045, 0.16, 0.12, 0.006, 1), clay(TINTS[i % TINTS.length], { roughness: 0.6 }));
      book.position.set(-0.28 + i * 0.05, -0.4, -0.4);
      book.rotation.y = (Math.random() - 0.5) * 0.1;
      g.add(book);
    }
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.02, 10), clay(COLOR.terracotta));
    lampBase.position.set(0.26, -0.46, -0.32);
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.06, 10, 1, true),
      new THREE.MeshStandardMaterial({ color: COLOR.butter, emissive: COLOR.butter, emissiveIntensity: 0.6, side: THREE.DoubleSide }),
    );
    lampShade.position.set(0.26, -0.38, -0.32);
    g.add(lampBase, lampShade);
  } else {
    // A little pennant banner + a bench.
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.13), clay(COLOR.terracotta, { roughness: 0.6, sheen: 0.5 }));
    banner.position.set(0, 0.34, -0.5);
    const bench = new THREE.Mesh(roundedBox(0.4, 0.07, 0.14, 0.015, 1), clay(COLOR.cream, { roughness: 0.8 }));
    bench.position.set(0, -0.48, -0.22);
    g.add(banner, bench);
  }

  const paintings = PAINTINGS.filter((p) => p.room === room).map((p, i) => {
    const pm = paintingFrame(p.file, p.w, p.h, TINTS[i % TINTS.length], 0.22);
    pm.group.position.set(i === 0 ? -0.14 : 0.14, -0.02, -0.46);
    g.add(pm.group);
    return pm;
  });

  return { group: g, paintings };
}

/**
 * The gallery hall: a spatially separate "pocket" behind the castle the
 * camera pans across once it's through the round window. Nine paintings in
 * a row along one long wall.
 */
export function buildGalleryHall(): Interior {
  const g = new THREE.Group();
  const wallW = 5.6;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, 1.6), clay(COLOR.cream, { roughness: 0.88 }));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(wallW, 2), clay(COLOR.blush, { roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.85;
  const rail = new THREE.Mesh(roundedBox(wallW, 0.03, 0.03, 0.01, 1), clay(COLOR.inkOrange, { roughness: 0.5 }));
  rail.position.y = 0.55;
  g.add(wall, floor, rail);

  const paintings = PAINTINGS.filter((p) => p.room === "gallery");
  const n = paintings.length;
  const frames = paintings.map((p, i) => {
    const pm = paintingFrame(p.file, p.w, p.h, TINTS[i % TINTS.length]);
    pm.group.position.set((i - (n - 1) / 2) * (wallW / n), -0.05, 0.03);
    g.add(pm.group);
    return pm;
  });

  // One light for the whole hall, not one per painting — each frame's picture
  // material already carries its own warm emissive tint (see loadRoomTextures).
  const light = new THREE.PointLight(COLOR.butter, 1.1, 6, 2);
  light.position.set(0, 0.9, 0.7);
  g.add(light);

  return { group: g, light, paintings: frames };
}

export function loadRoomTextures(interior: Interior) {
  interior.paintings.forEach((pm) => {
    loadTexture(pm.file)
      .then((tex) => {
        const mat = pm.picture.material as THREE.MeshBasicMaterial;
        mat.map = tex;
        mat.color.set(0xfff2df); // subtle warm grade, still legible — not a desaturating tint
        mat.needsUpdate = true;
      })
      .catch(() => {
        /* offline / missing asset: frame stays as a soft warm placeholder */
      });
  });
}

export function disposePaintingTextures() {
  loadedTextures.forEach((t) => t.dispose());
  loadedTextures.clear();
}

/** A generic, prop-free lit recess for the rooms without a bespoke diorama yet. */
export function buildPlainInterior(w: number, h: number, wallColor: number): Interior {
  // No dedicated light here either — see buildSmallInterior's note.
  const g = shell(w, h, 0.4, wallColor, COLOR.apricot);
  return { group: g, paintings: [] };
}

export type RoomInteriors = Partial<Record<RoomId, Interior>>;
