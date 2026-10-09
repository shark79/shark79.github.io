"use client";

import { useEffect, useRef, useState } from "react";
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
  // Mirrors sceneRef in React state so the progress-sync effect below can
  // depend on "the scene just became ready", not only on "rooms changed" —
  // the scene loads lazily (dynamic import) and saved progress usually
  // hydrates from localStorage well before that finishes, so relying on the
  // rooms-changed effect alone missed replaying it once the scene existed.
  const [readyScene, setReadyScene] = useState<CastleSceneT | null>(null);

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
        setReadyScene(scene);
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
      // The page can't actually scroll past `scrollHeight - innerHeight` — if
      // contact's section plus the footer is shorter than one viewport (common
      // on mobile), the raw top of #contact sits beyond the max reachable
      // scrollY, so it's never crossed and the final pull-back never completes.
      const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const lastIndex = tops.length - 1;
      // Never clamp below the second-to-last breakpoint — breakpoints must stay
      // non-decreasing for the segment lookup in castle-camera.ts.
      tops[lastIndex] = Math.max(tops[lastIndex - 1] ?? 0, Math.min(tops[lastIndex], maxScrollY));
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

    // Section tops move whenever page height changes for reasons that aren't
    // a viewport resize — a project card expanding, a game growing its own
    // content — so the camera needs a remeasure then too, not only on window
    // resize. Throttled through the same rAF as onResize.
    let bodyResizeRaf = 0;
    const bodyResizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(bodyResizeRaf);
      bodyResizeRaf = requestAnimationFrame(measure);
    });
    bodyResizeObserver.observe(document.body);

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
      cancelAnimationFrame(bodyResizeRaf);
      bodyResizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      sceneRef.current = null;
      setReadyScene(null);
      onSceneReady?.(null);
      scene?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable from the caller's perspective
  }, []);

  const progress = useProgress();
  useEffect(() => {
    // Depends on `readyScene` too (not just `progress.rooms`): the scene loads
    // lazily and localStorage-hydrated progress usually arrives first, so the
    // rooms-changed run alone would no-op against a still-null scene and the
    // lit windows/completion state would never get replayed once it existed.
    readyScene?.updateVisited(progress.rooms);
  }, [readyScene, progress.rooms]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_30%,var(--butter,#FBE6A6),var(--cream,#FFF3DF)_55%,var(--background,#FBF7F1)_100%)]"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
