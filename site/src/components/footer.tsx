export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 border-t border-border px-6 py-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:flex-row sm:px-10">
      <p>
        Shashank Jamkhandi ·{" "}
        <a
          href="https://github.com/shark79/shark79.github.io"
          target="_blank"
          rel="noreferrer"
          className="text-primary"
        >
          source
        </a>
      </p>
      <p>Built from scratch · 2026</p>
    </footer>
  );
}
