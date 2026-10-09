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
  setEnter: (e: number) => void;
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
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  room.dispose();
  const env = envTarget.texture;
  scene.environment = env;
  scene.environmentIntensity = 0.32;
  // Far slats dissolve into the page instead of ending on a hard edge.
  const fog = new THREE.Fog(0xffffff, 14, 14.1);
  scene.fog = fog;

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
  let enter = 0;
  let baseY = 0;
  let visible = false;
  let dirty = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) invalidate();
  });
  io.observe(canvas);
  function invalidate() { dirty = true; if (!raf) raf = requestAnimationFrame(frame); }
  const onVisibility = () => { if (!document.hidden && visible) invalidate(); };
  document.addEventListener("visibilitychange", onVisibility);

  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    current += (target - current) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    const idle = reducedMotion ? 0 : now * 0.00004;
    sculpture.rotation.y = -0.35 + current * Math.PI * 1.1 + idle + (reducedMotion ? 0 : (1 - enter) * 0.45);
    sculpture.position.y = baseY - (reducedMotion ? 0 : (1 - enter) * 1.2);
    sculpture.rotation.z = 0.32;
    layout(current * Math.PI * 1.5 + idle * 2);
    if (dirty || !reducedMotion) renderer.render(scene, camera);
    dirty = false;
    if (!reducedMotion) raf = requestAnimationFrame(frame);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Desktop: sit between the title column and the numbers. Portrait: step
    // back and lift into the top of the stage, above the project text.
    const portrait = w < h;
    baseY = portrait ? 1.6 : 0;
    camera.position.z = portrait ? 22 : 18.5;
    sculpture.position.set(portrait ? 0 : 0.5, portrait ? 1.6 : 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }

  resize();
  layout(0);

  return {
    setProgress: (p) => {
      target = p;
      invalidate();
    },
    setEnter: (e) => {
      enter = THREE.MathUtils.clamp(e, 0, 1);
      fog.far = reducedMotion ? 26 : THREE.MathUtils.lerp(fog.near + 0.1, 26, enter);
      // Fog conceals the form in white; opacity also removes its silhouette.
      canvas.style.opacity = String(enter);
      invalidate();
    },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mat.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
