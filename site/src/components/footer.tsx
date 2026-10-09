import { PROFILE } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1400px] flex-col gap-3 border-t border-line px-6 py-8 sm:flex-row sm:justify-between sm:px-12">
      <p className="label text-muted-foreground">{PROFILE.name} · 2026</p>
      <a href={PROFILE.source} target="_blank" rel="noopener noreferrer" className="label text-muted-foreground hover:text-foreground">
        Source
      </a>
    </footer>
  );
}
