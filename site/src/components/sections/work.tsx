"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/lib/content";
import { useScene } from "@/components/visuals/use-scene";
import { spiralEntrance } from "@/components/visuals/sky-progress";
import { cn } from "@/lib/utils";

const loadSpiral = () => import("@/components/visuals/spiral-scene").then((m) => m.createSpiral);
const N = PROJECTS.length;
/** Scroll distance per project, in viewport heights. Generous, so a quick
 *  flick moves one project rather than skipping past two or three. */
const STEP_VH = 135;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The projects as one pinned scene: the spiral shares the hero's sky and
 * turns with scroll, while the projects hand over to one another around it.
 * Every slide stays in the DOM (screen readers read them all); focusing a
 * link inside one scrolls the story to that slide.
 */
export function Work() {
  const { canvasRef, sceneRef } = useScene(loadSpiral, (scene) => {
    scene.setEnter(spiralEntrance());
    const el = document.getElementById("work");
    if (el) scene.setProgress(Math.min(1, Math.max(0, (scrollY - el.offsetTop) / (el.offsetHeight - innerHeight))));
  });
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const travel = el.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, (scrollY - el.offsetTop) / travel));
      sceneRef.current?.setProgress(p);
      sceneRef.current?.setEnter(spiralEntrance());
      setActive(Math.min(N - 1, Math.floor(p * N)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [sceneRef]);

  const goTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const travel = el.offsetHeight - innerHeight;
    scrollTo({ top: el.offsetTop + ((i + 0.5) / N) * travel });
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-label="Selected work"
      style={{ height: `calc(${N * STEP_VH}vh + 100vh)` }}
      className="relative z-[5]"
    >
      {/* One soft snap point at the middle of each project's stretch: if a
          scroll stops between projects, the page settles on the nearer one. */}
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          aria-hidden="true"
          style={{ top: `${(i + 0.5) * STEP_VH}vh` }}
          className="pointer-events-none absolute h-px w-px snap-start"
        />
      ))}

      {/* Start the visual at the hero's top, so its canvas never gets clipped
          at the hero/work boundary. It still leaves with the last project. */}
      <div aria-hidden="true" className="work-sky-stage pointer-events-none absolute inset-x-0 bottom-0">
        <div className="sticky top-0 h-svh">
          <canvas ref={canvasRef} className="spiral-canvas absolute inset-0 h-full w-full max-sm:h-[62%]" />
        </div>
      </div>

      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Phones: one shared wash under the text (per-slide washes would stack
            over the active slide, since later slides paint on top). */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[5] h-[55%] bg-gradient-to-b from-background/0 via-background/92 via-35% to-background lg:hidden"
        />

        {/* Header row */}
        <div className="absolute inset-x-0 top-24 z-10 mx-auto flex max-w-[1400px] items-baseline justify-between px-6 sm:top-28 sm:px-12">
          <p className="label">Selected work</p>
          <p className="label tabular-nums" aria-hidden="true">
            {pad(active + 1)} / {pad(N)}
          </p>
        </div>

        {/* Slides */}
        <ol className="absolute inset-0 z-10">
          {PROJECTS.map((p, i) => {
            const state = i === active ? "in" : i < active ? "past" : "next";
            return (
              <li
                key={p.id}
                aria-current={i === active ? "true" : undefined}
                onFocusCapture={() => i !== active && goTo(i)}
                className={cn(
                  "absolute inset-0 mx-auto max-w-[1400px] px-6 sm:px-12",
                  state !== "in" && "pointer-events-none",
                )}
              >
                {/* Left: what it is */}
                <div
                  className={cn(
                    "project-glass absolute inset-x-6 bottom-6 p-5 transition-opacity duration-500 sm:inset-x-12 sm:p-7 lg:right-auto lg:bottom-auto lg:top-1/2 lg:w-[34%] lg:-translate-y-1/2",
                    state === "in" ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Line state={state} i={0}>
                    <p className="label text-muted-foreground">{p.period}</p>
                  </Line>
                  <Line state={state} i={1}>
                    <h3 className="mt-4 text-[clamp(28px,3.6vw,52px)] leading-[1.04] font-normal tracking-[-0.02em]">
                      {p.name}
                    </h3>
                  </Line>
                  <Line state={state} i={2}>
                    <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
                      {p.brief}
                    </p>
                  </Line>
                  {p.links && (
                    <Line state={state} i={3}>
                      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                        {p.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label group inline-flex items-center gap-1.5 border-b border-foreground/30 pb-1 transition-colors hover:border-foreground"
                          >
                            {l.label}
                            <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    </Line>
                  )}
                </div>

                {/* Right: the numbers (desktop only — mobile keeps it to the essentials) */}
                <div className={cn(
                  "project-glass absolute top-1/2 right-12 hidden w-[24%] -translate-y-1/2 p-6 transition-opacity duration-500 lg:block",
                  state === "in" ? "opacity-100" : "opacity-0",
                )}>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-9">
                    {p.stats.map((s, k) => (
                      <li key={s.label}>
                        <Line state={state} i={k + 1}>
                          <p className="text-[clamp(26px,2.4vw,38px)] leading-none font-light tracking-[-0.02em]">
                            {s.value}
                          </p>
                          <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{s.label}</p>
                        </Line>
                      </li>
                    ))}
                  </ul>
                  <Line state={state} i={5}>
                    <p className="label mt-10 leading-6 text-muted-foreground">{p.tags.join("  ·  ")}</p>
                  </Line>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Index ticks */}
        <nav
          aria-label="Jump to project"
          className="absolute top-1/2 right-5 z-20 hidden -translate-y-1/2 flex-col gap-1 lg:flex"
        >
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${pad(i + 1)}: ${p.name}`}
              aria-current={i === active ? "true" : undefined}
              className="group flex h-6 w-6 items-center justify-end"
            >
              <span
                className={cn(
                  "h-px bg-foreground transition-all duration-500 ease-[var(--ease-out)]",
                  i === active ? "w-5 opacity-100" : "w-2.5 opacity-30 group-hover:opacity-70",
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

/** One line of a slide: rises in, leaves upward, staggered by `i`. */
function Line({
  state,
  i,
  children,
}: {
  state: "in" | "past" | "next";
  i: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ transitionDelay: state === "in" ? `${120 + i * 70}ms` : "0ms" }}
      className={cn(
        "transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out)] motion-reduce:transform-none motion-reduce:filter-none",
        state === "in" && "opacity-100",
        state === "past" && "-translate-y-8 opacity-0 blur-[2px]",
        state === "next" && "translate-y-8 opacity-0 blur-[2px]",
      )}
    >
      {children}
    </div>
  );
}
