import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Contact() {
  return (
    <section id="contact" className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="inline-block h-px w-8 bg-muted-foreground" />
          Let&apos;s build something
        </p>
        <h2 className="font-heading text-4xl font-semibold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
          Got something
          <br />
          <span className="text-primary">interesting</span>
          <br />
          <span className="text-transparent [-webkit-text-stroke:1.5px_var(--muted-foreground)]">
            in mind?
          </span>
        </h2>

        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <a
            href="mailto:shashankjamkhandi@gmail.com"
            className="group inline-flex items-center gap-3 border-b border-border pb-2 font-heading text-xl font-semibold tracking-tight transition-colors hover:border-primary hover:text-primary sm:text-2xl"
          >
            shashankjamkhandi@gmail.com
            <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </a>
          <InteractiveHoverButton text="Say hi" className="w-32" />
        </div>

        <div className="mt-10 flex flex-wrap gap-6">
          <a
            href="tel:+16232759852"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            (623) 275-9852 ↗
          </a>
          <a
            href="https://www.linkedin.com/in/sjam"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com/shark79"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
