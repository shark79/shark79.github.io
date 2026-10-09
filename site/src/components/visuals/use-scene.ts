"use client";

import { useEffect, useRef } from "react";

type Scene = { resize: () => void; dispose: () => void };

/**
 * Mounts a three.js scene into a canvas after first paint. `load` is a
 * dynamic import, so three.js never sits in the initial bundle. If WebGL is
 * unavailable the canvas just stays empty and the CSS backdrop shows.
 */
export function useScene<S extends Scene>(
  load: () => Promise<(canvas: HTMLCanvasElement, reducedMotion: boolean) => S>,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<S | null>(null);

  useEffect(() => {
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onResize = () => sceneRef.current?.resize();

    load()
      .then((create) => {
        if (disposed || !canvasRef.current) return;
        sceneRef.current = create(canvasRef.current, reduced);
        window.addEventListener("resize", onResize);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // `load` is a stable module-level import thunk.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasRef, sceneRef };
}
