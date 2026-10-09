"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { PROFILE } from "@/lib/content";
import { useScene } from "@/components/visuals/use-scene";

const loadClouds = () => import("@/components/visuals/cloud-scene").then((m) => m.createClouds);

export function Hero() {
  const { canvasRef } = useScene(loadClouds);

  return (
    <section id="top" className="relative h-svh min-h-[560px] overflow-hidden">
      {/* Painted sky shows while the shader loads (and if WebGL is off). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_10%,#9fb8d1_0%,#dfe5ea_45%,#f1f2f3_100%)]"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {/* The sky dissolves into the white page. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 sm:px-12">
        <div className="max-w-xl max-sm:mx-auto max-sm:text-center">
          <p className="label text-foreground/70">{PROFILE.role}</p>
          <h1 className="mt-6 text-[clamp(30px,5.4vw,64px)] font-light leading-[1.1] tracking-[0.18em] uppercase">
            Shashank
            <br />
            Jamkhandi
          </h1>
          <p className="mt-7 text-[17px] leading-relaxed font-light text-foreground/80">
            {PROFILE.tagline[0]} {PROFILE.tagline[1]}
          </p>
          <span aria-hidden="true" className="mt-7 block h-px w-14 bg-foreground/40 max-sm:mx-auto" />
          <a
            href="#work"
            className="group mt-7 inline-flex items-center gap-3 text-[17px] font-light tracking-wide transition-opacity hover:opacity-70"
          >
            See what I&apos;ve built
            <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <a
        href="#work"
        className="label absolute bottom-8 left-6 flex items-center gap-3 sm:left-12"
      >
        <ArrowDown className="size-4" />
        Scroll down to discover
      </a>
    </section>
  );
}
