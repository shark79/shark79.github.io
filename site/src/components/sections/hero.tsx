"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Hero() {
  return (
    <section className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden px-6 pb-20 pt-12 sm:px-10">
      <DottedSurface className="opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-1 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,var(--primary)/12%,transparent)]"
      />

      <div className="glass-panel relative z-10 mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-10">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span className="inline-block h-px w-8 bg-muted-foreground" />
          AI Engineer / Applied GenAI &amp; Agentic Systems
        </p>
        {/* No hard break on mobile — the line simply wraps; the two-line
            split only reads well once there's room for it. */}
        <h1 className="font-heading text-[12vw] font-semibold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          AI that <span className="text-primary">helps</span>.{" "}
          <br className="hidden sm:inline" />
          And knows when <span className="text-primary">not</span> to.
        </h1>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            RAG Pipelines · Agentic AI · AWS Bedrock
            <br />
            Clinical AI @ DocAide.ai · ASU M.S. 4.0 GPA
          </p>
          <div className="flex items-center gap-4">
            <InteractiveHoverButton
              text="Work"
              className="w-36"
              onClick={() =>
                document
                  .getElementById("work")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />
            <a
              href="#contact"
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              Get in touch ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
