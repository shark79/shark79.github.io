"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TOTAL_LEVELS, useProgress } from "@/lib/progress";

const COUNT = 260;
// Light gravity plus drag: paper confetti hangs, it does not fall like gravel.
const GRAVITY = -13;
const LIFETIME_MS = 6500;

// Same accent and neutrals as every level scene — the celebration has to
// look like the rest of the site, not like a different product.
const PALETTE = [
  0x9a8bff, 0x6f61c8, 0xe8e8ea, 0x7a7a80, 0x9a8bff, 0xc9c9d2,
];

type Piece = {
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  rotation: THREE.Euler;
  position: THREE.Vector3;
};

function Confetti() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    camera.position.z = 34;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    host.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(0.42, 0.62);
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(COUNT * 3),
      3,
    );

    // Three poppers: bottom-left, bottom-centre, bottom-right.
    const origins = [-22, 0, 22];
    const pieces: Piece[] = [];
    const color = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const from = origins[i % origins.length];
      const aim = from === 0 ? 0 : from > 0 ? -1 : 1;
      pieces.push({
        position: new THREE.Vector3(
          from + (Math.random() - 0.5) * 3,
          -20 + Math.random() * 2,
          (Math.random() - 0.5) * 14,
        ),
        velocity: new THREE.Vector3(
          aim * (3 + Math.random() * 9) + (Math.random() - 0.5) * 5,
          19 + Math.random() * 17,
          (Math.random() - 0.5) * 6,
        ),
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 11,
          (Math.random() - 0.5) * 11,
          (Math.random() - 0.5) * 11,
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
      });
      color.setHex(PALETTE[i % PALETTE.length]);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    const dummy = new THREE.Object3D();
    const clock = new THREE.Clock();
    let frame = 0;
    let elapsed = 0;

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      for (let i = 0; i < COUNT; i++) {
        const p = pieces[i];
        p.velocity.y += GRAVITY * dt;
        // Air drag, strongest on the way down, plus a flutter so pieces
        // drift sideways instead of dropping on rails.
        p.velocity.multiplyScalar(1 - 0.6 * dt);
        p.position.addScaledVector(p.velocity, dt);
        p.position.x += Math.sin(elapsed * 2.4 + i) * 1.6 * dt;
        p.rotation.x += p.spin.x * dt;
        p.rotation.y += p.spin.y * dt;
        p.rotation.z += p.spin.z * dt;

        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      // Fade the whole burst out over the last two seconds.
      const remaining = LIFETIME_MS / 1000 - elapsed;
      material.opacity = remaining > 2 ? 1 : Math.max(remaining / 2, 0);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      mesh.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-60"
    />
  );
}

export function LevelComplete() {
  const { cleared } = useProgress();
  const complete = cleared.length >= TOTAL_LEVELS;

  const [fired, setFired] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [burnt, setBurnt] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Adjust state during render rather than from an effect — this fires once,
  // off a value that just changed, and a cascading re-render is the point.
  if (complete && !fired) setFired(true);

  const confetti = fired && !reduced && !burnt;
  const open = fired && !dismissed;

  useEffect(() => {
    if (!fired || reduced) return;
    const stop = window.setTimeout(() => setBurnt(true), LIFETIME_MS);
    return () => window.clearTimeout(stop);
  }, [fired, reduced]);

  if (!open && !confetti) return null;

  return (
    <>
      {confetti && <Confetti />}
      {open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-70 flex justify-center px-6">
          <div
            role="status"
            className="race-pop glass-panel pointer-events-auto w-full max-w-md px-6 py-5 shadow-lg"
          >
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
              All {TOTAL_LEVELS} levels cleared
            </div>
            <p className="font-heading text-2xl font-semibold tracking-tight">
              You actually finished it.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Eight for eight. That is more of this page than almost anyone
              reads, including the people who ask me about it. If you got this
              far you probably have a question worth answering — ask it.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                onClick={() => setDismissed(true)}
                className="min-h-10 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get in touch
              </a>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="min-h-10 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
