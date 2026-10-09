/** "01 — About" label over a large, light statement. */
export function SectionHead({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <header className="reveal">
      <p className="label text-muted-foreground">
        {n} <span aria-hidden="true">—</span> {label}
      </p>
      <h2 className="mt-6 max-w-[22ch] text-[clamp(30px,4.4vw,60px)] leading-[1.08] font-light tracking-[-0.02em]">
        {children}
      </h2>
    </header>
  );
}
