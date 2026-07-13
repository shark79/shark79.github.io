const ROW_1 = [
  ["openai", "OpenAI"],
  ["amazonaws", "AWS"],
  ["fastapi", "FastAPI"],
  ["postgresql", "PostgreSQL"],
  ["docker", "Docker"],
  ["pytorch", "PyTorch"],
  ["react", "React"],
  ["python", "Python"],
] as const;

const ROW_2 = [
  ["tensorflow", "TensorFlow"],
  ["github", "GitHub"],
  ["pandas", "Pandas"],
  ["numpy", "NumPy"],
  ["jupyter", "Jupyter"],
  ["googlecloud", "Google Cloud"],
  ["scikitlearn", "scikit-learn"],
  ["javascript", "JavaScript"],
] as const;

function Row({
  items,
  reverse,
}: {
  items: readonly (readonly [string, string])[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max items-center gap-0 ${
          reverse ? "animate-showreel-reverse" : "animate-showreel"
        }`}
      >
        {doubled.map(([slug, label], i) => (
          <span
            key={`${slug}-${i}`}
            className="flex items-center gap-2.5 px-7 font-mono text-xs uppercase tracking-widest text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/${slug}.svg`}
              alt=""
              aria-hidden="true"
              className="size-4 opacity-70 grayscale dark:invert"
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Showreel() {
  return (
    <div className="flex flex-col gap-4 border-y border-border bg-secondary/40 py-6">
      <Row items={ROW_1} />
      <Row items={ROW_2} reverse />
    </div>
  );
}
