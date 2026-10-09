"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PROFILE } from "@/lib/content";
import { useScene } from "@/components/visuals/use-scene";
import { skyProgress } from "@/components/visuals/sky-progress";

const loadClouds = () => import("@/components/visuals/cloud-scene").then((m) => m.createClouds);
const loadWisps = () => import("@/components/visuals/wisp-scene").then((m) => m.createWisps);

export function Hero() {
  const { canvasRef, sceneRef } = useScene(loadClouds, (scene) => scene.setFly(skyProgress()));
  const { canvasRef: wispRef, sceneRef: wispSceneRef } = useScene(loadWisps, (scene) => scene.setClear(skyProgress()));
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const fly = skyProgress();
      sceneRef.current?.setFly(fly);
      wispSceneRef.current?.setClear(fly);
      // CSS fallback follows the same handoff when WebGL is unavailable.
      backdropRef.current?.style.setProperty("--sky-fade", String(1 - fly));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [sceneRef, wispSceneRef]);

  return (
    <>
      <div ref={backdropRef} aria-hidden="true" className="sky-backdrop pointer-events-none fixed inset-0 z-0 bg-background">
        <div className="sky-fallback absolute inset-0" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <section id="top" className="relative z-10 h-svh min-h-[560px]">
        <canvas ref={wispRef} aria-hidden="true" className="hero-name-clouds pointer-events-none absolute inset-0 z-10 h-full w-full" />
        <div className="mx-auto flex h-full max-w-[1600px] flex-col items-center justify-center px-6 text-center sm:px-12">
          <p className="label relative z-20 text-foreground/70">{PROFILE.role}</p>
          <div className="hero-name-stage relative mt-7 isolate">
            <h1 className="hero-name relative z-0 font-light leading-[1.1] uppercase">
              {PROFILE.name.split(" ").map((name) => <span key={name} className="block">{name}</span>)}
            </h1>
          </div>
          <span aria-hidden="true" className="relative z-20 mt-10 block h-px w-14 bg-foreground/40" />
          <a href="#work" className="group relative z-20 mt-7 inline-flex min-h-11 items-center gap-3 text-[17px] font-light tracking-wide transition-opacity hover:opacity-70">
            See what I&apos;ve built
            <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1" />
          </a>
        </div>
        <a href="#work" className="label absolute inset-x-0 bottom-8 z-20 mx-auto flex min-h-11 w-fit items-center gap-3">
          <ArrowDown className="size-4" />
          Scroll down to discover
        </a>
      </section>
    </>
  );
}
