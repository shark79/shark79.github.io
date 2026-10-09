/**
 * Shapes for project and job entries, plus the checks that keep a new entry
 * from breaking the page. Every check throws at build time with the file's id
 * in the message, so a bad entry fails `npm run build` instead of shipping.
 *
 * NDA: the day job is at DocAide.ai. Never name an internal tool, feature, or
 * codename — describe the work as a skill or a publicly known tool only.
 */

export type Stat = { label: string; value: string };
export type Link = { label: string; href: string };

export type Project = {
  /** Lowercase slug, unique. Also the file name in content/projects/. */
  id: string;
  name: string;
  /** ISO date work started: yyyy-mm or yyyy-mm-dd. Lists sort on this, newest first. */
  start: string;
  /** Human-readable dates shown on the slide, e.g. "Jul to Aug 2026". */
  period: string;
  /** One or two plain sentences: what it is, for a non-technical reader. */
  brief: string;
  tags: string[];
  links?: Link[];
  whatItDoes: string;
  impact: string;
  whatILearned: string;
  /** Up to 4 headline numbers; the slide shows them as a 2×2 grid. */
  stats: Stat[];
};

export type Job = {
  id: string;
  company: string;
  role: string;
  /** ISO date the role started; jobs sort on this, newest first. */
  start: string;
  period: string;
  desc: string;
  bullets: string[];
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/;
export const MAX_STATS = 4;

function fail(kind: string, id: string, msg: string): never {
  throw new Error(`[content] ${kind} "${id}": ${msg}`);
}

function text(kind: string, id: string, field: string, v: unknown) {
  if (typeof v !== "string" || !v.trim()) fail(kind, id, `"${field}" must be non-empty text`);
}

function common(kind: string, e: { id: string; start: string; period: string }) {
  if (!SLUG.test(e.id)) fail(kind, e.id, `id must be a lowercase slug like "my-project"`);
  if (!DATE.test(e.start)) fail(kind, e.id, `start "${e.start}" must be yyyy-mm or yyyy-mm-dd`);
  text(kind, e.id, "period", e.period);
}

function url(kind: string, id: string, href: string) {
  try {
    const u = new URL(href);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw 0;
  } catch {
    fail(kind, id, `link "${href}" must be an http(s) URL`);
  }
}

/** Identity helper: gives a project file type-checking and autocomplete. */
export const defineProject = (p: Project) => p;
export const defineJob = (j: Job) => j;

function checkProject(p: Project) {
  common("project", p);
  for (const f of ["name", "brief", "whatItDoes", "impact", "whatILearned"] as const) text("project", p.id, f, p[f]);
  if (p.stats.length > MAX_STATS) fail("project", p.id, `at most ${MAX_STATS} stats (has ${p.stats.length})`);
  const labels = new Set<string>();
  for (const s of p.stats) {
    text("project", p.id, "stat.label", s.label);
    text("project", p.id, "stat.value", s.value);
    if (labels.has(s.label)) fail("project", p.id, `duplicate stat label "${s.label}"`);
    labels.add(s.label);
  }
  p.tags.forEach((t) => text("project", p.id, "tag", t));
  const hrefs = new Set<string>();
  for (const l of p.links ?? []) {
    text("project", p.id, "link.label", l.label);
    url("project", p.id, l.href);
    if (hrefs.has(l.href)) fail("project", p.id, `duplicate link "${l.href}"`);
    hrefs.add(l.href);
  }
}

function checkJob(j: Job) {
  common("job", j);
  for (const f of ["company", "role", "desc"] as const) text("job", j.id, f, j[f]);
  j.bullets.forEach((b) => text("job", j.id, "bullet", b));
}

/** Newest first; ties broken by name so order never depends on import order. */
function byStart<T extends { start: string }>(key: (e: T) => string) {
  return (a: T, b: T) => b.start.localeCompare(a.start) || key(a).localeCompare(key(b));
}

function unique<T extends { id: string }>(kind: string, list: T[]) {
  const seen = new Set<string>();
  for (const e of list) {
    if (seen.has(e.id)) fail(kind, e.id, "id is used twice");
    seen.add(e.id);
  }
}

export function collectProjects(list: Project[]): Project[] {
  list.forEach(checkProject);
  unique("project", list);
  return [...list].sort(byStart((p) => p.name));
}

export function collectJobs(list: Job[]): Job[] {
  list.forEach(checkJob);
  unique("job", list);
  return [...list].sort(byStart((j) => j.company));
}
