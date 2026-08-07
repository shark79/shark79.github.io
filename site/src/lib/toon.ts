import * as THREE from "three";

/**
 * The cheap-looking part was never the polygon count — it was smooth PBR
 * shading on primitives with no silhouette. Mobile games read as expensive
 * because of banded toon shading, a hard outline, and a contact shadow that
 * plants the thing on the ground. All three are nearly free.
 */

let ramp: THREE.DataTexture | null = null;

/** Three-step ramp: the banding is what makes it read as illustrated. */
export function toonRamp() {
  if (!ramp) {
    const steps = new Uint8Array([70, 150, 225, 255]);
    ramp = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    ramp.minFilter = THREE.NearestFilter;
    ramp.magFilter = THREE.NearestFilter;
    ramp.needsUpdate = true;
  }
  return ramp;
}

export function toon(color: number) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonRamp() });
}

/**
 * Inverted hull outline: the same geometry, backfaces only, pushed out a
 * little. One extra draw call for a silhouette that survives any background.
 * Added as a child so it inherits every animation the part does.
 */
export function outline(mesh: THREE.Mesh, color: number, weight = 1.07) {
  const hull = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }),
  );
  hull.scale.multiplyScalar(weight);
  hull.renderOrder = -1;
  mesh.add(hull);
  return mesh;
}

/** A part plus its outline, in one call. */
export function part(
  geometry: THREE.BufferGeometry,
  color: number,
  outlineColor?: number,
  weight?: number,
) {
  const mesh = new THREE.Mesh(geometry, toon(color));
  if (outlineColor !== undefined) outline(mesh, outlineColor, weight);
  return mesh;
}

let blobTexture: THREE.Texture | null = null;

/** Soft radial blob standing in for a shadow — no shadow map, no cost. */
export function contactShadow(radius = 1) {
  if (!blobTexture) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.55, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    blobTexture = new THREE.CanvasTexture(canvas);
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({
      map: blobTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Overshoot easing. Everything in a good mobile game lands past its mark. */
export function backOut(k: number, amount = 1.7) {
  const c = amount + 1;
  const p = k - 1;
  return 1 + c * p * p * p + amount * p * p;
}

export const bounce = (k: number) => Math.sin(k * Math.PI) ** 0.6;
