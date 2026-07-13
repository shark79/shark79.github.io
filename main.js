// ── LOADER ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 900);
});

// ── CUSTOM CURSOR ───────────────────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animCursor() {
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

document.querySelectorAll('a, button, .proj-row, .skill-pill').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── SCROLL PROGRESS ─────────────────────────────────────
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
  prog.style.width = pct + '%';
});

// ── NAV SCROLL STATE ────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ─────────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
  });
});

// ── SCROLL REVEAL ────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── PROJECT MODAL DATA ───────────────────────────────────
const projects = {
  agentcore: {
    num: '01 / 04', name: 'Production Agentic AI on AWS Bedrock AgentCore', period: 'May 2026',
    metrics: [
      { val: 'CrewAI', label: 'Orchestration' },
      { val: 'MCP', label: 'Tool integration' },
      { val: 'OTel', label: 'Observability' },
    ],
    body: `<p>A serverless multi-agent system built on <strong>AWS Bedrock AgentCore</strong> — using its full primitive surface: Runtime, Memory, Identity, and Gateway — orchestrated with <span class="ac">CrewAI</span> and wired up to external tools via <span class="cy">MCP (Model Context Protocol)</span>.</p>
    <p>Deployed through Lambda + API Gateway, with OpenTelemetry and CloudWatch instrumentation so agent behavior is actually observable in production, not a black box.</p>
    <p>The reference case exercising the whole system end to end: an itinerary-and-recommendations agent — multi-step planning, tool calls, memory across a session, identity-aware personalization.</p>`
  },
  skillsynq: {
    num: '02 / 04', name: 'SkillSynQ', period: 'Feb 2025 — Mar 2025',
    metrics: [
      { val: 'AWS', label: 'Serverless' },
      { val: 'Auto', label: 'Enrollment' },
      { val: '36h', label: 'Hackathon build' },
    ],
    body: `<p>Job hunting is a weird experience. You're looking at a job description with 15 requirements and trying to figure out which three actually matter, which courses would fill the gaps, and whether you should even apply. I built SkillSynQ to handle that analysis automatically.</p>
    <p>The pipeline: scrape live job and course data (<strong>Selenium + BeautifulSoup + REST APIs</strong>) mapping LinkedIn job skills to university courses, matched using <span class="ac">OpenAI</span>, surfaced through a chatbot interface.</p>
    <p>The part I'm most proud of is <span class="cy">auto-enrollment</span> — once a user confirms a course match, the system updates their enrollment status directly in DynamoDB, running on <strong>AWS Lambda + S3</strong> so it scales without server management. Originally prototyped over 36 hours at ASU's GenAI hackathon, where the build was selected for showcase demos.</p>`
  },
  styloguard: {
    num: '03 / 04', name: 'Stylometric Authorship Verification', period: 'Feb 2025 — May 2025',
    github: 'https://github.com/shark79/StyloGuard',
    metrics: [
      { val: '10', label: 'Linguistic features' },
      { val: 'SQL', label: 'Index pipeline' },
      { val: 'Auto', label: 'Tracking' },
    ],
    body: `<p>This one came from watching AI detectors get gamed repeatedly. Tools that look at <strong>what</strong> you wrote get beaten by paraphrasing tools. Stylometry looks at <strong>how</strong> you write — sentence length distribution, vocabulary richness, punctuation habits, function word ratios. Those are genuinely hard to fake.</p>
    <p>I fingerprint writing style across <span class="ac">10 linguistic features</span> and compare submissions against reference essays, backed by an <span class="cy">automated SQL pipeline</span> linking stylometric indexes to student records for consistent tracking over a semester.</p>
    <p>Getting the sensitivity right so it wasn't flagging normal variation took several iterations — the difference between a student writing tired vs. submitting someone else's work is subtle, and the system had to learn that boundary.</p>`
  },
  googlefiber: {
    num: '04 / 04', name: 'Google Fiber Customer Support Analysis', period: 'Sept 2024 — Nov 2024',
    metrics: [
      { val: '62%', label: 'Repeat-contact share' },
      { val: '1', label: 'Market region isolated' },
      { val: 'ETL', label: 'Backed dashboards' },
    ],
    body: `<p>The most valuable analysis is often the one that just finds the obvious thing nobody was looking at. I was working through Google Fiber support call data trying to understand why so many customers were calling back within days of a resolved issue.</p>
    <p>The data was unambiguous: one <span class="ac">market region</span> was responsible for <strong>62% of all repeat-contact share</strong>. Not a gradual distribution — one region, disproportionately.</p>
    <p>That kind of finding is exactly what lets operations confidently reallocate resources rather than spreading fixes evenly across everything. Built <span class="cy">ETL-backed dashboards</span> for real-time KPI monitoring, so the team could track whether fixes were actually working after deployment.</p>`
  }
};

function openModal(key) {
  const p = projects[key];
  if (!p) return;
  const metrics = p.metrics.map(m => `<div class="modal-metric"><div class="m-val">${m.val}</div><div class="m-label">${m.label}</div></div>`).join('');
  const link = p.github ? `<a href="${p.github}" target="_blank" class="m-link">↗ GitHub</a>` : '';
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-num">${p.num}</div>
    <div class="modal-title">${p.name}</div>
    <div class="modal-period">${p.period}</div>
    <div class="modal-metrics">${metrics}</div>
    <div class="modal-body">${p.body}</div>
    ${link ? `<div class="modal-footer">${link}</div>` : ''}
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
