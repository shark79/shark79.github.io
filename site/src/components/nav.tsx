"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { TOTAL_LEVELS, useCleared } from "@/lib/progress";

const RING = 2 * Math.PI * 10;

function LevelRing() {
  const cleared = useCleared();
  const done = cleared.length;

  return (
    <a
      href="#work"
      title={`${done} of ${TOTAL_LEVELS} levels cleared`}
      className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="2"
          className="stroke-border"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING * (1 - done / TOTAL_LEVELS)}
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="font-mono text-[10px] tabular-nums">
        {done}/{TOTAL_LEVELS}
      </span>
      <span className="sr-only">levels cleared, jump to the work section</span>
    </a>
  );
}

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#gallery", label: "Gallery" },
];

export function Nav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/70 backdrop-blur-md transition-colors">
      <nav className="flex w-full items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
        <a
          href="#top"
          className="font-heading text-sm font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          sj<span className="text-primary">.</span>
        </a>
        <ul className="hidden items-center gap-8 sm:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <LevelRing />
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden rounded-full border border-border px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors hover:border-primary hover:text-primary sm:inline-block"
          >
            Let&apos;s talk
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground sm:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-6 py-6 sm:hidden">
          <ul className="flex flex-col gap-5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium uppercase tracking-widest text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="text-base font-medium uppercase tracking-widest text-primary"
              >
                Let&apos;s talk
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
