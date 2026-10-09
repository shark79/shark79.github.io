import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * A white sculpture of thin rounded slats stacked along a sweeping 3D spine,
 * each slat turned a little further than the last, like a twisted spine.
 * Lit as studio product shot: soft environment light plus one shadowing
 * key light, so the gaps between slats fall into deep, soft shadow.
 *
 * `setProgress(0..1)` is scroll position through the projects; the spine
 * rotates and its twist travels with it.
 */

const SLATS = 210;
const SLAT = { w: 3.1, h: 0.1, d: 1.15 };

// The spine: a smooth helix, 1.3 turns, tilted so it sweeps across the frame.
const SPINE = new THREE.CatmullRomCurve3(
  Array.from({ length: 40 }, (_, i) => {
    const t = i / 39;
    const a = t * Math.PI * 2 * 1.3;
    return new THREE.Vector3(Math.cos(a) * 2.7, 7 - t * 14, Math.sin(a) * 2.7);
  }),
);

export type SpiralScene = {
  setProgress: (p: number) => void;
  resize: () => void;
  dispose: () => void;
};

export function createSpiral(canvas: HTMLCanvasElement, reducedMotion: boolean): SpiralScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.32;
  // Far slats dissolve into the page instead of ending on a hard edge.
  scene.fog = new THREE.Fog(0xffffff, 14, 26);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 15);

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-7, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 4;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 9, bottom: -9, near: 1, far: 30 });
  scene.add(key);

  const geo = new RoundedBoxGeometry(SLAT.w, SLAT.h, SLAT.d, 3, 0.03);
  const mat = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.5, metalness: 0 });
  const slats = new THREE.InstancedMesh(geo, mat, SLATS);
  slats.castShadow = true;
  slats.receiveShadow = true;

  const sculpture = new THREE.Group();
  sculpture.add(slats);
  scene.add(sculpture);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const twist = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);

  /** Lay the slats along the spine. `phase` slides the twist along it. */
  function layout(phase: number) {
    for (let i = 0; i < SLATS; i++) {
      const t = i / (SLATS - 1);
      const pos = SPINE.getPointAt(t);
      const tan = SPINE.getTangentAt(t);
      // Slat thickness axis (y) follows the spine; twist turns it about that axis.
      q.setFromUnitVectors(up, tan);
      twist.setFromAxisAngle(up, t * Math.PI * 1.4 + phase);
      q.multiply(twist);
      slats.setMatrixAt(i, m.compose(pos, q, one));
    }
    slats.instanceMatrix.needsUpdate = true;
  }

  let target = 0;
  let current = 0;
  let raf = 0;
  let last = performance.now();

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    current += (target - current) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    const idle = reducedMotion ? 0 : now * 0.00004;
    sculpture.rotation.y = -0.35 + current * Math.PI * 1.1 + idle;
    sculpture.rotation.z = 0.32;
    layout(current * Math.PI * 1.5 + idle * 2);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait screens: step back so the sweep still fits.
    camera.position.z = w < h ? 22 : 15;
    camera.updateProjectionMatrix();
  }

  resize();
  layout(0);
  raf = requestAnimationFrame(frame);

  return {
    setProgress: (p) => {
      target = p;
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      geo.dispose();
      mat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
