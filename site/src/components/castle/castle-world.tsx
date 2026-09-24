"use client";

import { useEffect, useRef } from "react";
import { ROOMS, type RoomId } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import type { CastleScene as CastleSceneT } from "./castle-scene";

type Props = {
  onSceneReady?: (scene: CastleSceneT | null) => void;
  onActiveRoomChange?: (id: RoomId | null) => void;
};

/**
 * The persistent, fixed, full-viewport 3D world behind the whole page. Pure
 * lifecycle plumbing — the actual three.js world lives in `CastleScene`.
 * Pointer events pass straight through (`pointer-events-none`); `CastleHub`
 * layers its own interactive bands on top where openings/paintings live.
 */
export function CastleWorld({ onSceneReady, onActiveRoomChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CastleSceneT | null>(null);

  useEffect(() => {
    let cancelled = false;
    let scene: CastleSceneT | null = null;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    async function mount() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const { CastleScene } = await import("./castle-scene");
        if (cancelled) return;
        scene = new CastleScene(canvas);
        scene.reducedMotion = reducedMotionQuery.matches;
        scene.setSize(window.innerWidth, window.innerHeight);
        scene.onActiveRoomChange = (id) => onActiveRoomChange?.(id);
        sceneRef.current = scene;
        onSceneReady?.(scene);
        measure();
        onScroll();
        if (!document.hidden) scene.start();
      } catch {
        // No WebGL / three failed to load: poster background + door rail still work.
        onSceneReady?.(null);
      }
    }

    let breakpoints: number[] = [];
    function measure() {
      const heroTop = 0;
      const tops = ROOMS.map((r) => {
        const el = document.getElementById(r.id);
        if (!el) return heroTop;
        return el.getBoundingClientRect().top + window.scrollY;
      });
      breakpoints = [heroTop, ...tops];
      if (scene) scene.breakpoints = breakpoints;
    }

    function onScroll() {
      if (scene) scene.scrollY = window.scrollY;
    }

    let resizeRaf = 0;
    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (scene) scene.setSize(window.innerWidth, window.innerHeight);
        measure();
      });
    }

    function onVisibility() {
      if (!scene) return;
      if (document.hidden) scene.stop();
      else scene.start();
    }

    function onReducedMotionChange() {
      if (scene) scene.reducedMotion = reducedMotionQuery.matches;
    }

    function onPointerMove(e: PointerEvent) {
      if (!scene || e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      scene.setParallax(nx, -ny);
    }

    mount();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);
    // Fonts/layout can still shift section offsets after first paint.
    const remeasure = window.setTimeout(measure, 800);

    return () => {
      cancelled = true;
      clearTimeout(remeasure);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      sceneRef.current = null;
      onSceneReady?.(null);
      scene?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable from the caller's perspective
  }, []);

  const progress = useProgress();
  useEffect(() => {
    sceneRef.current?.updateVisited(progress.rooms);
  }, [progress.rooms]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_30%,var(--butter,#FBE6A6),var(--cream,#FFF3DF)_55%,var(--background,#FBF7F1)_100%)]"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
