import { cn } from "@/lib/utils";

/** A small hand-drawn-feeling wavy rule, used sparingly between subsections. */
export function SquiggleDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-2.5 w-full text-border", className)}
    >
      <path
        d="M0 5.5 Q 8 1, 17 5.5 T 34 5.5 T 51 5.5 T 68 5.5 T 85 5.5 T 102 5.5 T 119 5.5 T 136 5.5 T 153 5.5 T 170 5.5 T 187 5.5 T 200 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
