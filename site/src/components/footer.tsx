import { PROFILE } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-10 text-center font-mono text-[11px] tracking-widest text-muted-foreground uppercase sm:flex-row sm:text-left">
      <p>
        {PROFILE.name} ·{" "}
        <a
          href={PROFILE.source}
          target="_blank"
          rel="noreferrer"
          className="text-primary transition-colors hover:text-foreground"
        >
          source
        </a>
      </p>
      <p>Built by hand · 2026</p>
    </footer>
  );
}
