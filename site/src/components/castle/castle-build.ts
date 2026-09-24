import * as THREE from "three";
import { ROOMS, type RoomId } from "@/lib/content";
import * as P from "./castle-parts";
import * as I from "./castle-interiors";

/** World layout in one place so geometry, openings, path, and camera framing agree. */
export const LAYOUT = {
  keep: { x: 0, z: 0, w: 2.6, h: 3.9, d: 2.2, roofH: 1.7 },
  towerL: { x: -2.55, z: 0.4, w: 1.5, h: 2.5, d: 1.5, roofH: 1.3 },
  towerR: { x: 2.55, z: 0.4, w: 1.5, h: 2.5, d: 1.5, roofH: 1.3 },
  turret: { x: 0, z: 0, w: 1.05, d: 1.05, h: 1.15, roofH: 0.95 },
};

export type CastleAssembly = {
  world: THREE.Group;
  openings: Map<RoomId, P.OpeningRig>;
  interiors: Map<RoomId, I.Interior>;
  path: { group: THREE.Group; segments: THREE.Mesh[] };
  cloudRig: THREE.Group;
  birds: THREE.Group[];
  balloon: THREE.Group;
  weathervane: THREE.Group;
  pennant: THREE.Group;
};

export function buildCastle(): CastleAssembly {
  const world = new THREE.Group();
  world.add(P.buildIsland());

  const { keep, towerL, towerR, turret } = LAYOUT;

  const keepT = P.buildTower(keep.w, keep.h, keep.d, P.COLOR.cream, 0, false);
  const towerLT = P.buildTower(towerL.w, towerL.h, towerL.d, P.COLOR.cream, 0, true);
  towerLT.group.position.set(towerL.x, 0, towerL.z);
  const towerRT = P.buildTower(towerR.w, towerR.h, towerR.d, P.COLOR.cream, 0, true);
  towerRT.group.position.set(towerR.x, 0, towerR.z);
  const turretT = P.buildTower(turret.w, turret.h, turret.d, P.COLOR.cream, keep.h + keep.roofH, true);
  world.add(keepT.group, towerLT.group, towerRT.group, turretT.group);

  const keepRoof = P.bellRoof(1.85, keep.roofH, P.COLOR.blush);
  keepRoof.position.set(keep.x, keepT.topY, keep.z);
  const towerLRoof = P.bellRoof(1.05, towerL.roofH, P.COLOR.apricot);
  towerLRoof.position.set(towerL.x, towerLT.topY, towerL.z);
  const towerRRoof = P.bellRoof(1.05, towerR.roofH, P.COLOR.butter);
  towerRRoof.position.set(towerR.x, towerRT.topY, towerR.z);
  const turretRoof = P.bellRoof(0.72, turret.roofH, P.COLOR.blush);
  turretRoof.position.set(turret.x, turretT.topY, turret.z);
  world.add(keepRoof, towerLRoof, towerRRoof, turretRoof);

  // ---- openings --------------------------------------------------------
  // work/skills/gallery are all stacked on the same x=0 facade — spaced with
  // a deliberate gap between each so their hit boxes can't overlap and steal
  // each other's clicks (verified by raycasting a fixed pixel; see castle-parts
  // buildOpening's hit-box comment).
  const anchors: Record<RoomId, THREE.Vector3> = {
    about: new THREE.Vector3(towerL.x, 1.35, towerL.z + towerL.d / 2),
    work: new THREE.Vector3(0, 0.8, keep.d / 2),
    experience: new THREE.Vector3(towerR.x, 1.35, towerR.z + towerR.d / 2),
    skills: new THREE.Vector3(0, 2.25, keep.d / 2),
    gallery: new THREE.Vector3(0, 3.3, keep.d / 2),
    contact: new THREE.Vector3(0, keep.h + keep.roofH + 0.6, turret.d / 2),
  } as Record<RoomId, THREE.Vector3>;

  // Leaf colors cycle blush/apricot/butter per opening — terracotta is reserved
  // for thin trims (frame rings, pins) so it never dominates a whole frame.
  const specs: [RoomId, string, "arch" | "window" | "double" | "round" | "flap", number, number, number][] = [
    ["about", "01", "window", 0.62, 0.9, P.COLOR.blush],
    ["work", "02", "arch", 1.05, 1.4, P.COLOR.apricot],
    ["experience", "03", "window", 0.62, 0.9, P.COLOR.butter],
    ["skills", "04", "double", 0.95, 1.0, P.COLOR.blush],
    ["gallery", "05", "round", 0.6, 0.6, P.COLOR.apricot],
    ["contact", "06", "flap", 0.55, 0.5, P.COLOR.butter],
  ];

  const openings = new Map<RoomId, P.OpeningRig>();
  const interiors = new Map<RoomId, I.Interior>();
  for (const [id, n, kind, w, h, leafColor] of specs) {
    const rig = P.buildOpening(id, n, kind, w, h, anchors[id], leafColor);
    world.add(rig.group);
    openings.set(id, rig);

    // The tower/keep walls are complete, hole-less shells (no real cutout at
    // each opening) — anything positioned *behind* the threshold sits inside
    // that solid, front-facing geometry and is invisible from outside. So
    // interiors seen from outside (everything except the gallery hall, which
    // the camera flies inside of — back-face-culled walls are invisible
    // *from the inside*, so that one works recessed) are pulled forward to
    // sit just in front of the wall instead, like a shallow display nook.
    let interior: I.Interior;
    if (id === "about" || id === "experience") {
      interior = I.buildSmallInterior(id);
      interior.group.position.z = 0.55; // shell depth 0.55 — wall lands flush with the surface
    } else if (id === "gallery") {
      interior = I.buildGalleryHall();
      interior.group.position.set(0, -0.35, -3.6);
    } else {
      interior = I.buildPlainInterior(w, h, P.COLOR.cream);
      interior.group.position.z = 0.42; // shell depth 0.4
    }
    rig.group.add(interior.group);
    interiors.set(id, interior);
  }

  // ---- balcony ledge + telescope (skills) -----------------------------
  const ledge = new THREE.Mesh(P.roundedBox(1.1, 0.08, 0.4, 0.02, 1), P.clay(P.COLOR.cream, { roughness: 0.8 }));
  ledge.position.set(0, 1.65, keep.d / 2 + 0.2);
  const railGeo = new THREE.TorusGeometry(0.012, 0.012, 6, 8);
  // Balusters sit right above the gate — leave them out of the shadow pass so
  // their railing doesn't paint hard bar-shadows down the door below.
  for (let i = -4; i <= 4; i++) {
    const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), P.clay(P.COLOR.terracotta));
    baluster.position.set((i / 4) * 0.5, 1.85, keep.d / 2 + 0.38);
    baluster.castShadow = false;
    world.add(baluster);
  }
  const handrail = new THREE.Mesh(railGeo, P.clay(P.COLOR.terracotta));
  handrail.rotation.x = Math.PI / 2;
  handrail.scale.set(45, 1, 1);
  handrail.position.set(0, 2.03, keep.d / 2 + 0.38);
  handrail.castShadow = false;
  const telescope = P.buildTelescope();
  telescope.position.set(0.3, 1.69, keep.d / 2 + 0.22);
  world.add(ledge, telescope);

  // ---- exterior props --------------------------------------------------
  const flowerL = P.buildFlowerBox(0.55);
  flowerL.position.set(towerL.x, 1.02, towerL.z + towerL.d / 2 + 0.06);
  const flowerR = P.buildFlowerBox(0.55);
  flowerR.position.set(towerR.x, 1.02, towerR.z + towerR.d / 2 + 0.06);
  world.add(flowerL, flowerR);

  const pond = P.buildPond(0.55);
  pond.position.set(2.7, 0.02, 2.9);
  world.add(pond);

  const crates = P.buildCrateStack();
  crates.position.set(towerL.x - 0.55, 0, towerL.z + 0.5);
  world.add(crates);

  const lanternL = P.buildLantern();
  lanternL.position.set(-0.75, 0, keep.d / 2 + 0.5);
  const lanternR = P.buildLantern();
  lanternR.position.set(0.75, 0, keep.d / 2 + 0.5);
  world.add(lanternL, lanternR);

  const bunting1 = P.buildBunting(
    new THREE.Vector3(towerL.x + 0.4, towerLT.topY + 0.3, towerL.z + 0.3),
    new THREE.Vector3(-1.0, keepT.topY + 0.2, keep.d / 2 - 0.1),
    5,
  );
  const bunting2 = P.buildBunting(
    new THREE.Vector3(1.0, keepT.topY + 0.2, keep.d / 2 - 0.1),
    new THREE.Vector3(towerR.x - 0.4, towerRT.topY + 0.3, towerR.z + 0.3),
    5,
  );
  world.add(bunting1, bunting2);

  const kite = P.buildKite();
  kite.position.set(towerR.x + 1.1, towerRT.topY + 1.6, -0.6);
  kite.rotation.z = 0.25;
  const kiteTail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1.3, -1.9, 0.8)]),
    new THREE.LineBasicMaterial({ color: P.COLOR.ink, transparent: true, opacity: 0.3 }),
  );
  kite.add(kiteTail);
  world.add(kite);

  const fox = P.buildFox();
  fox.position.set(1.3, 0, keep.d / 2 + 0.35);
  fox.rotation.y = -0.5;
  world.add(fox);

  const weathervane = P.buildWeathervane();
  weathervane.position.set(0.35, turretT.topY + turret.roofH, turret.z);
  world.add(weathervane);

  const pennant = P.buildPennant();
  pennant.position.set(-0.35, turretT.topY + turret.roofH - 1.1, turret.z);
  world.add(pennant);

  // ---- golden path (island surface, one segment per room) -------------
  const pathPts = [
    new THREE.Vector3(0, 0.02, 3.6),
    new THREE.Vector3(towerL.x, 0.02, 1.9),
    new THREE.Vector3(0, 0.02, 2.15),
    new THREE.Vector3(towerR.x, 0.02, 1.9),
    new THREE.Vector3(0.9, 0.02, 1.6),
    new THREE.Vector3(-0.9, 0.02, 1.6),
    new THREE.Vector3(0, 0.02, 0.7),
  ];
  const path = P.buildPath(pathPts);
  world.add(path.group);

  // Island skirt: a ring of soft puffs hides the rim, standing in for the
  // hard disc edge — this is what makes it read as "floating on clouds".
  const skirt = P.buildCloudSkirt(22, 4.55, -0.35);
  world.add(skirt);
  const skirtLow = P.buildCloudSkirt(14, 3.3, -1.15);
  world.add(skirtLow);

  // ---- ambient background (not static — the scene animates these) -----
  const cloudRig = new THREE.Group();
  cloudRig.add(P.buildCloudField(9, 8.2, [3.8, 6.6]).mesh);
  world.add(cloudRig);
  const birds = [P.buildBird(), P.buildBird(), P.buildBird()];
  birds.forEach((b) => world.add(b));
  const balloon = P.buildBalloon();
  balloon.scale.setScalar(1.3);
  world.add(balloon);

  return { world, openings, interiors, path, cloudRig, birds, balloon, weathervane, pennant };
}

export const ROOM_ORDER = ROOMS.map((r) => r.id);
