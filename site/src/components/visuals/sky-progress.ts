/** Shared hero-to-work handoff, also used when a scene finishes lazy-loading. */
export function skyProgress() {
  const work = document.getElementById("work");
  return Math.max(0, Math.min(1, scrollY / Math.max(1, work?.offsetTop ?? innerHeight)));
}

export function spiralEntrance() {
  const t = Math.max(0, Math.min(1, (skyProgress() - 0.5) / 0.5));
  return t * t * (3 - 2 * t);
}
