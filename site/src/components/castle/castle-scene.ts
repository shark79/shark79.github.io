import * as THREE from "three";
import { ROOMS, type RoomId } from "@/lib/content";
import * as P from "./castle-parts";
import * as I from "./castle-interiors";
import { buildCastle, type CastleAssembly } from "./castle-build";
import { computeCameraTarget, doorOpenAmount } from "./castle-camera";

const CAM_DAMP = 5; // ~0.08/frame at 60fps, frame-rate independent

function disposeMaterial(mat: THREE.Material) {
  for (const v of Object.values(mat as unknown as Record<string, unknown>)) {
    if (v instanceof THREE.Texture) v.dispose();
  }
  mat.dispose();
}

export class CastleScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private assembly: CastleAssembly;
  private raycaster = new THREE.Raycaster();
  private openingHits: THREE.Mesh[];

  private camPos = new THREE.Vector3(0, 2.6, 10.8);
  private lookAt = new THREE.Vector3(0, 2, 0);
  private parallax = new THREE.Vector3();
  private parallaxTarget = new THREE.Vector3();

  private animState = new Map<RoomId, { open: number }>();
  private visited = new Set<RoomId>();
  private loadedRooms = new Set<RoomId>();
  private hoveredOpening: RoomId | null = null;
  private hoveredPainting: string | null = null;
  private activeRoom: RoomId | null = null;

  private sawFirstVisitedUpdate = false;
  private everComplete = false;
  private pennantRaised = false;
  private confetti: (ReturnType<typeof P.buildConfetti> & { elapsed: number }) | null = null;

  scrollY = 0;
  breakpoints: number[] = [];
  reducedMotion = false;
  onActiveRoomChange: ((id: RoomId | null) => void) | null = null;

  private running = false;
  private raf: number | null = null;
  private timeoutId: number | null = null;
  private lastT = 0;
  private lastScrollY = 0;
  private lastScrollChangeAt = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    const dprCap = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 1.75;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Neutral (not AgX/ACES filmic) keeps pastels pastel — filmic curves crush
    // light warm hues toward brown, which read as "muddy" on this palette.
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.scene.fog = new THREE.Fog(P.COLOR.bg, 11, 27);
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);

    this.assembly = buildCastle();
    this.scene.add(this.assembly.world);
    ROOMS.forEach((r) => this.animState.set(r.id, { open: 0 }));
    this.openingHits = [...this.assembly.openings.values()].map((r) => r.hit);

    // Bright, airy fill: a light warm-tan ground bounce (not saturated
    // terracotta) so undersides don't read as dirty, plus a strong sky tint.
    const hemi = new THREE.HemisphereLight(P.COLOR.cream, 0xe9d3bd, 1.15);
    const key = new THREE.DirectionalLight(0xfff2df, 2.1);
    key.position.set(-7, 10, 6);
    key.castShadow = true;
    const shadowRes = dprCap <= 1.5 ? 1024 : 1536;
    key.shadow.mapSize.set(shadowRes, shadowRes);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0025;
    key.shadow.normalBias = 0.02;
    const fill = new THREE.DirectionalLight(P.COLOR.cream, 0.7);
    fill.position.set(6, 4, 8);
    this.scene.add(hemi, key, fill);

    this.tick = this.tick.bind(this);
  }

  setSize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setParallax(nx: number, ny: number) {
    this.parallaxTarget.set(nx * 0.35, ny * 0.2, 0);
  }

  setHoveredOpening(id: RoomId | null) {
    this.hoveredOpening = id;
  }

  setHoveredPainting(file: string | null) {
    this.hoveredPainting = file;
  }

  raycastOpenings(clientX: number, clientY: number): RoomId | null {
    const ndc = new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.openingHits, false);
    return hits.length ? ((hits[0].object.userData.roomId as RoomId) ?? null) : null;
  }

  raycastPaintings(clientX: number, clientY: number, roomId: RoomId): string | null {
    const interior = this.assembly.interiors.get(roomId);
    if (!interior || interior.paintings.length === 0) return null;
    const ndc = new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const meshes = interior.paintings.map((p) => p.frame);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    return interior.paintings.find((p) => p.frame === hits[0].object)?.file ?? null;
  }

  getScreenPosition(world: THREE.Vector3): { x: number; y: number } {
    const p = world.clone().project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight };
  }

  getOpeningAnchor(id: RoomId): THREE.Vector3 {
    return this.assembly.openings.get(id)!.anchor;
  }

  updateVisited(rooms: RoomId[]) {
    const isFirst = !this.sawFirstVisitedUpdate;
    this.sawFirstVisitedUpdate = true;
    this.visited = new Set(rooms);
    const complete = rooms.length >= ROOMS.length;
    if (complete && !this.everComplete) {
      this.everComplete = true;
      this.pennantRaised = true;
      if (isFirst || this.reducedMotion) {
        this.assembly.pennant.position.y = 0;
      } else {
        this.spawnConfetti();
      }
    }
  }

  private spawnConfetti() {
    const origin = this.assembly.pennant.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0));
    const c = P.buildConfetti(60, origin);
    this.scene.add(c.mesh);
    this.confetti = { ...c, elapsed: 0 };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this.scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.raf != null) cancelAnimationFrame(this.raf);
    if (this.timeoutId != null) clearTimeout(this.timeoutId);
    this.raf = this.timeoutId = null;
  }

  private isActive(): boolean {
    return performance.now() / 1000 - this.lastScrollChangeAt < 0.4 || this.hoveredOpening != null || this.hoveredPainting != null || this.confetti != null;
  }

  private scheduleNext() {
    if (!this.running) return;
    if (this.isActive()) this.raf = requestAnimationFrame(this.tick);
    else this.timeoutId = window.setTimeout(this.tick, 33);
  }

  private tick(tMs?: number) {
    if (!this.running) return;
    const now = tMs ?? performance.now();
    const dt = Math.min(0.05, (now - this.lastT) / 1000 || 0);
    this.lastT = now;
    if (Math.abs(this.scrollY - this.lastScrollY) > 0.5) {
      this.lastScrollY = this.scrollY;
      this.lastScrollChangeAt = now / 1000;
    }
    this.update(dt, now / 1000);
    this.renderer.render(this.scene, this.camera);
    this.scheduleNext();
  }

  private update(dt: number, tSec: number) {
    const target = computeCameraTarget(this.scrollY, this.breakpoints, this.camera.aspect);
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-CAM_DAMP * dt);
    this.camPos.lerp(target.pos, k);
    this.lookAt.lerp(target.look, k);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, target.fov, k);
    this.camera.updateProjectionMatrix();

    const parallaxActive = target.segmentIndex === 0 && !this.reducedMotion;
    this.parallax.lerp(parallaxActive ? this.parallaxTarget : new THREE.Vector3(), 1 - Math.exp(-6 * dt));
    this.camera.position.copy(this.camPos).add(this.parallax);
    this.camera.lookAt(this.lookAt);

    const nextActive = target.t > 0.15 ? ROOMS[Math.min(target.segmentIndex, ROOMS.length - 1)].id : null;
    if (nextActive !== this.activeRoom) {
      this.activeRoom = nextActive;
      this.onActiveRoomChange?.(nextActive);
    }

    const damp = this.reducedMotion ? 1 : 1 - Math.exp(-6 * dt);
    ROOMS.forEach((room, i) => {
      const rig = this.assembly.openings.get(room.id)!;
      const scrollAmt = doorOpenAmount(i, target.segmentIndex, target.t);
      const hoverAmt = this.hoveredOpening === room.id ? 0.32 : 0;
      const visitedAmt = this.visited.has(room.id) ? 0.16 : 0;
      const openTarget = Math.max(scrollAmt, hoverAmt, visitedAmt);
      const st = this.animState.get(room.id)!;
      st.open = THREE.MathUtils.lerp(st.open, openTarget, damp);
      rig.leaves.forEach((leaf) => {
        leaf.pivot.rotation[leaf.axis] = leaf.openSign * leaf.maxOpen * st.open;
      });
      const litTarget = this.visited.has(room.id) ? 1 : scrollAmt > 0.4 ? 0.55 : 0;
      rig.light.intensity = THREE.MathUtils.lerp(rig.light.intensity, litTarget * 1.7, damp);
      const glowMat = rig.glow.material as THREE.MeshBasicMaterial;
      glowMat.opacity = THREE.MathUtils.lerp(glowMat.opacity, litTarget * 0.8, damp);

      if ((scrollAmt > 0.1 || this.visited.has(room.id)) && !this.loadedRooms.has(room.id)) {
        this.loadedRooms.add(room.id);
        const interior = this.assembly.interiors.get(room.id);
        if (interior && interior.paintings.length) I.loadRoomTextures(interior);
      }
    });

    this.assembly.path.segments.forEach((seg, i) => {
      const lit = this.visited.has(ROOMS[i].id) ? 1 : 0;
      const mat = seg.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, lit * 0.9, damp);
      mat.color.lerp(new THREE.Color(lit ? P.COLOR.butter : P.COLOR.cream), damp);
    });

    this.assembly.interiors.forEach((interior) => {
      interior.paintings.forEach((pm) => {
        const hovered = this.hoveredPainting === pm.file;
        pm.group.rotation.y = THREE.MathUtils.lerp(pm.group.rotation.y, hovered ? 0.05 : 0, damp);
        const mat = pm.picture.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, hovered ? 0.35 : 0.08, damp);
      });
    });

    if (!this.reducedMotion) this.updateAmbient(dt, tSec);
    this.updateConfetti(dt);

    this.assembly.pennant.position.y = THREE.MathUtils.lerp(this.assembly.pennant.position.y, this.pennantRaised ? 0 : -1.1, this.reducedMotion ? 1 : 1 - Math.exp(-2.2 * dt));
    if (!this.reducedMotion && this.pennantRaised) {
      const flag = this.assembly.pennant.userData.flag as THREE.Mesh;
      flag.rotation.z = Math.sin(tSec * 6) * 0.1;
    }
  }

  private updateAmbient(dt: number, tSec: number) {
    this.assembly.cloudRig.rotation.y += dt * 0.012;
    this.assembly.birds.forEach((bird, i) => {
      const a = tSec * 0.35 + (i * Math.PI * 2) / 3;
      const r = 3.4 + i * 0.35;
      bird.position.set(Math.cos(a) * r, 5.5 + Math.sin(a * 2) * 0.15, Math.sin(a) * r * 0.6 + 1.2);
      bird.rotation.y = -a + Math.PI / 2;
      const flap = Math.sin(tSec * 13 + i) * 0.5;
      const wings = bird.userData.wings as THREE.Mesh[] | undefined;
      if (wings) {
        wings[0].rotation.x = flap;
        wings[1].rotation.x = -flap;
      }
    });
    this.assembly.balloon.position.set(((tSec * 0.12 + 6) % 16) - 8, 6.3 + Math.sin(tSec * 0.3) * 0.15, -6.5);
    this.assembly.weathervane.rotation.y = Math.sin(tSec * 0.3) * 0.3;
  }

  private updateConfetti(dt: number) {
    if (!this.confetti) return;
    const { mesh, pos, vel, rot, count } = this.confetti;
    this.confetti.elapsed += dt;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      vel[i * 3 + 1] -= 1.1 * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.rotation.set(rot[i * 3] * this.confetti.elapsed, rot[i * 3 + 1] * this.confetti.elapsed, rot[i * 3 + 2] * this.confetti.elapsed);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    const fadeMat = mesh.material as THREE.MeshBasicMaterial;
    fadeMat.opacity = Math.max(0, 1 - this.confetti.elapsed / 3.2);
    if (this.confetti.elapsed > 3.4) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      fadeMat.dispose();
      this.confetti = null;
    }
  }

  dispose() {
    this.stop();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else if (mat) disposeMaterial(mat);
    });
    I.disposePaintingTextures();
    P.disposeGrain();
    this.renderer.dispose();
  }
}
