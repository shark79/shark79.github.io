import { ArrowUpRight } from "lucide-react";
import { PROFILE } from "@/lib/content";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-40">
      <p className="label reveal text-muted-foreground">
        05 <span aria-hidden="true">—</span> Contact
      </p>
      <h2 className="reveal mt-6 text-[clamp(44px,9vw,140px)] leading-[0.95] font-light tracking-[-0.04em]">
        Let&apos;s talk.
      </h2>
      <a
        href={`mailto:${PROFILE.email}`}
        className="reveal group mt-12 inline-flex items-center gap-3 border-b border-foreground/30 pb-2 text-[clamp(18px,2.4vw,30px)] font-light break-all transition-colors hover:border-foreground"
      >
        {PROFILE.email}
        <ArrowUpRight className="size-6 shrink-0 transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1" />
      </a>
      <ul className="reveal mt-14 flex flex-wrap gap-x-10 gap-y-4">
        <li>
          <a href={PROFILE.phone.href} className="label inline-block py-2 transition-opacity hover:opacity-60">
            {PROFILE.phone.display}
          </a>
        </li>
        {PROFILE.links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex items-center gap-1.5 py-2 transition-opacity hover:opacity-60"
            >
              {l.label} <ArrowUpRight className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
