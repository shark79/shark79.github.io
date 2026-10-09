"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PROFILE } from "@/lib/content";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#gallery", label: "Gallery" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 pt-6 sm:px-12 sm:pt-8">
        <a href="#top" className="label py-2 tracking-[0.3em]">
          SJ
        </a>

        <div className="glass hidden items-center gap-1 rounded-full p-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="label rounded-full px-4 py-2.5 transition-colors hover:bg-white/70"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${PROFILE.email}`}
            className="label ml-1 rounded-full bg-foreground px-5 py-2.5 text-background transition-opacity hover:opacity-85"
          >
            Get in touch
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="glass flex size-11 items-center justify-center rounded-full md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="glass mx-4 mt-3 rounded-3xl p-3 md:hidden">
          <ul>
            {[...LINKS, { href: "#contact", label: "Contact" }].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3.5 text-[22px] font-light"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
