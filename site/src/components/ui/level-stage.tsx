"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { PALETTES, SCENES } from "@/lib/scenes";
import { backOut } from "@/lib/toon";

/**
 * One renderer for the whole page, borrowed by whichever level is on screen.
 *
 * Nine stages meant nine WebGL contexts, which browsers cap and phones punish.
 * Sections are tall enough that only one stage is ever really visible, so a
 * single shared context serves all of them and the page never pays for a
 * second one. Quality is dialled from the device, not from a feature flag —
 * every visitor gets every scene.
 */
let shared: THREE.WebGLRenderer | null = null;
/** Only the most recently scrolled-to stage may drive the shared canvas. */
let ownerId: string | null = null;

function isSmall() {
  return window.innerWidth < 768;
}

function getRenderer() {
  if (!shared) {
    const small = isSmall();
    shared = new THREE.WebGLRenderer({
      alpha: true,
      // Antialiasing is a fill-rate tax. At phone size the DPR cap hides the
      // difference, so spend the budget on frame rate instead.
      antialias: !small,
      powerPreference: "high-performance",
    });
    shared.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  }
  return shared;
}

type Props = {
  /** Which scene to build — keyed to the level id. */
  scene: string;
  /** Once cleared, the scene settles back so the info card leads. */
  cleared?: boolean;
  className?: string;
};

export function LevelStage({ scene, cleared = false, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const id = useId();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        // Scrolling into a level hands it the canvas; scrolling back hands
        // it straight back, because ownership is re-taken here every time.
        if (entry.isIntersecting) ownerId = id;
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [id]);

  useEffect(() => {
    const host = hostRef.current;
    const build = SCENES[scene];
    if (!host || !visible || !build) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = isSmall();
    const palette = resolvedTheme === "light" ? PALETTES.light : PALETTES.dark;

    const renderer = getRenderer();
    const camera = new THREE.PerspectiveCamera(42, 3, 0.1, 100);
    const root = new THREE.Scene();
    const group = new THREE.Group();
    root.add(group);
    const handle = build(group, palette);
    const tick = handle.tick;

    const resize = () => {
      const w = host.clientWidth || 600;
      const h = host.clientHeight || 200;
      renderer.setSize(w, h);
      const aspect = w / h;
      camera.aspect = aspect;
      // Each scene says how close to sit; a narrow phone canvas then pulls in
      // further still, so the subject fills the frame instead of floating in
      // the middle of it.
      const base = handle.frame?.z ?? 7;
      camera.position.set(0, (handle.frame?.y ?? 0) + 0.5, base);
      camera.lookAt(0, handle.frame?.y ?? 0, 0);
      camera.updateProjectionMatrix();
    };


    // Three lights, because toon banding needs a direction to band along:
    // a key to shape it, a rim behind to lift it off the background, and a
    // soft hemisphere so the shadow side never goes fully dead.
    root.add(new THREE.HemisphereLight(palette.neutral, palette.deep, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3.5, 6, 5);
    root.add(key);
    const rim = new THREE.DirectionalLight(palette.accent, 2.6);
    rim.position.set(-4, 2.5, -5);
    root.add(rim);


    ownerId = id;
    host.appendChild(renderer.domElement);
    resize();

    // Static devices get one composed frame, not a paused animation loop.
    if (reduced) {
      tick(0);
      group.scale.setScalar(1);
      renderer.render(root, camera);
    }

    const clock = new THREE.Clock();
    // Halve the work on phones: these are slow ambient scenes, 30fps reads
    // identically and leaves the main thread free for scrolling.
    const minFrame = small ? 1 / 30 : 0;
    let acc = 0;
    let intro = 0;
    let frame = 0;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      const delta = clock.getDelta();
      acc += delta;
      if (acc < minFrame) return;
      acc -= minFrame;
      if (document.hidden) return;
      // One canvas for the whole page: only its current owner draws, and
      // taking it back means re-attaching and re-fitting to this host.
      if (ownerId !== id) return;
      if (renderer.domElement.parentElement !== host) {
        host.appendChild(renderer.domElement);
        resize();
      }

      if (intro < 1) intro = Math.min(1, intro + delta * 1.5);
      // Overshoot, not ease-out: it should land past the mark and settle.
      const eased = intro >= 1 ? 1 : backOut(intro, 1.35);

      tick(clock.getElapsedTime());
      group.position.y = -1.5 * (1 - eased);
      group.scale.setScalar(0.72 + 0.28 * eased);

      renderer.render(root, camera);
    };
    if (!reduced) frame = requestAnimationFrame(loop);

    window.addEventListener("resize", resize);

    // Tap to poke. Pointer events only bind when a scene declares targets,
    // so the stage stays inert (and non-blocking) when there is nothing to hit.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      if (!handle.targets?.length || !handle.hit) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const struck = raycaster.intersectObjects(handle.targets, true)[0];
      if (struck) handle.hit(struck.object, clock.getElapsedTime());
    };
    if (handle.targets?.length) {
      host.style.pointerEvents = "auto";
      host.style.cursor = "pointer";
      host.addEventListener("pointerdown", onPointer);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointerdown", onPointer);
      // Give the canvas back, but keep the context alive for the next level.
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, [scene, visible, resolvedTheme, id]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`touch-manipulation overflow-hidden transition-opacity duration-1000 ${
        cleared ? "opacity-35" : "opacity-100"
      } ${className ?? "h-56 w-full sm:h-64"}`}
    />
  );
}
