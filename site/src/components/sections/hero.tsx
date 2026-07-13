import { DottedSurface } from "@/components/ui/dotted-surface";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-6 pb-20 pt-32 sm:px-10"
    >
      <DottedSurface className="opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-1 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,var(--primary)/12%,transparent)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span className="inline-block h-px w-8 bg-muted-foreground" />
          AI Engineer / GenAI Developer · Arizona
        </p>
        <h1 className="font-heading text-[13vw] font-semibold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          <span className="text-muted-foreground/30 line-through decoration-2">
            Don&apos;t
          </span>{" "}
          judge a book
          <br />
          by its <span className="text-primary">cover</span>.
        </h1>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            RAG Pipelines · Agentic AI · AWS Bedrock
            <br />
            Clinical AI @ CMCI · ASU M.S. 4.0 GPA
          </p>
          <div className="flex items-center gap-4">
            <InteractiveHoverButton text="Work" className="w-36" />
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
