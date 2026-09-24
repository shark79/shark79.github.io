"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { ROOMS } from "@/lib/content";
import { TOTAL_ROOMS, useProgress } from "@/lib/progress";
import { CastleMini } from "@/components/ui/castle-mini";

export function Nav() {
  const [open, setOpen] = React.useState(false);
  const { rooms, keys } = useProgress();

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <div className="clay-sm relative flex w-full max-w-4xl items-center gap-3 rounded-full bg-card/95 px-3 py-2 sm:px-4">
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="shrink-0 rounded-full px-1 font-heading text-base font-semibold tracking-tight"
        >
          Shashank
        </a>

        <ul className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {ROOMS.map((r) => (
            <li key={r.id}>
              <a
                href={`#${r.id}`}
                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {r.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <a
            href="#top"
            title={`${rooms.length} of ${TOTAL_ROOMS} rooms lit`}
            className="hidden items-center gap-1.5 sm:flex"
          >
            <CastleMini visited={rooms} />
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {rooms.length}/{TOTAL_ROOMS}
            </span>
            {keys.length > 0 && (
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: "var(--ink-orange)" }}
              >
                · {keys.length} key{keys.length === 1 ? "" : "s"}
              </span>
            )}
          </a>

          <a
            href="#contact"
            className="clay-sm clay-interactive hidden h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground sm:inline-flex"
          >
            Say hi
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-full text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="clay absolute inset-x-0 top-[calc(100%+8px)] rounded-[var(--radius-lg)] bg-card p-4 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              {ROOMS.map((r) => (
                <a
                  key={r.id}
                  href={`#${r.id}`}
                  onClick={() => setOpen(false)}
                  className="clay-sm clay-interactive flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-card px-3.5 py-3"
                >
                  <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                    {r.n}
                  </span>
                  <span className="font-heading text-sm font-semibold">{r.label}</span>
                </a>
              ))}
            </div>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="clay-sm clay-interactive mt-2 flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Say hi
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
