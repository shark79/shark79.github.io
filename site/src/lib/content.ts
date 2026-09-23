/**
 * Every word on the site lives here. Components render it; they don't own it.
 *
 * NDA: the day job is at DocAide.ai. Never name an internal tool, feature, or
 * codename — describe the work as a skill or a publicly known tool only.
 */

export const PROFILE = {
  name: "Shashank Jamkhandi",
  role: "AI Engineer",
  eyebrow: "AI Engineer · Applied GenAI & Agentic Systems",
  // The positioning line: helpful *and* restrained. Don't sand it down.
  tagline: ["AI that helps.", "And knows when not to."],
  intro:
    "I build AI that people rely on: clinical tools at DocAide.ai, and agent systems that stop to ask a human before they do anything that matters.",
  email: "shashankjamkhandi@gmail.com",
  phone: { display: "(623) 275-9852", href: "tel:+16232759852" },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sjam" },
    { label: "GitHub", href: "https://github.com/shark79" },
  ],
  source: "https://github.com/shark79/shark79.github.io",
} as const;

/* ------------------------------------------------------------------ rooms */

/**
 * The castle's rooms. Each one is a door or window in the 3D hub and a
 * section on the page (`id` is the section's DOM id). Order = page order.
 */
export const ROOMS = [
  {
    id: "about",
    n: "01",
    place: "The Study",
    label: "About me",
    opening: "window", // left tower window
    hint: "Who's behind the castle",
  },
  {
    id: "work",
    n: "02",
    place: "The Workshop",
    label: "Projects",
    opening: "gate", // the main gate
    hint: "Eleven things I've built",
  },
  {
    id: "experience",
    n: "03",
    place: "The Hall",
    label: "Experience",
    opening: "window", // right tower window
    hint: "Where I've worked",
  },
  {
    id: "skills",
    n: "04",
    place: "The Tool Room",
    label: "Skills",
    opening: "balcony", // keep balcony
    hint: "What I work with",
  },
  {
    id: "gallery",
    n: "05",
    place: "The Gallery",
    label: "Off the clock",
    opening: "round-window", // round window high on the keep
    hint: "Photos I've taken",
  },
  {
    id: "contact",
    n: "06",
    place: "The Post Tower",
    label: "Contact",
    opening: "turret", // top turret, carrier-bird perch
    hint: "Send a message up",
  },
] as const;

export type RoomId = (typeof ROOMS)[number]["id"];

/* --------------------------------------------------------------- projects */

export type Quiz = {
  question: string;
  options: string[];
  answer: number;
  reveal: string;
};

export type Stat = { label: string; value: string };

export type Project = {
  id: string;
  name: string;
  /** ISO yyyy-mm of when work started. The list is sorted on this. */
  start: string;
  period: string;
  brief: string;
  tags: string[];
  links?: { label: string; href: string }[];
  whatItDoes: string;
  impact: string;
  whatILearned: string;
  quiz: Quiz;
  stats: Stat[];
  /** Has a playable mini-game rendered inside the card. */
  game?: "seat-race";
};

const ALL_PROJECTS: Project[] = [
  {
    id: "campaignforge",
    name: "CampaignForge",
    start: "2026-09",
    period: "Sep 2026 · Hackathon",
    brief:
      "A team of AI agents that turns a campaign brief into finished images and social posts, and stops for a human yes before anything costs money or goes public.",
    tags: ["MCP", "TypeScript", "Multi-Agent", "OpenAI Images", "Human-in-the-loop"],
    links: [
      { label: "GitHub", href: "https://github.com/shark79/agent-harness-build" },
    ],
    whatItDoes:
      "You fill in a guided brief. A planner agent turns it into a few creative concepts, and nothing else happens until a person picks one. Then it generates the images, writes separate drafts for LinkedIn, Meta, and TikTok from that one approved concept, and shows everything right inside the chat. Publishing is its own step: every single post needs a fresh approval of that exact post.",
    impact:
      "The approval gates sit exactly where the money and the risk are: before image generation spends budget, and before anything goes out under a real brand's name. Publishing is switched off by default, and even when it's on, the publish tool is marked destructive so the system has to ask.",
    whatILearned:
      "The biggest risk in the project wasn't the AI, it was four social networks. Every connection had to be proven against test accounts before a live demo, because a demo that leans on someone else's service on a Saturday is a demo that can fail.",
    quiz: {
      question:
        "The agents have written a post and it looks perfect. What has to happen before it goes live?",
      options: [
        "Nothing, it posts itself",
        "A person approves that exact post",
        "A second agent signs off",
      ],
      answer: 1,
      reveal:
        "A person approves that exact post, every time. Approving the campaign never quietly approves the posts, and publishing stays off until someone turns it on.",
    },
    stats: [
      { label: "Networks drafted for", value: "3" },
      { label: "Human approval gates", value: "2" },
      { label: "Agent roles", value: "3" },
      { label: "Posts sent without a yes", value: "0" },
    ],
  },
  {
    id: "researchpanel",
    name: "Adversarial Research Panel",
    start: "2026-08",
    period: "Aug 2026",
    brief:
      "Four research agents look at an idea from engineering, marketing, product, and finance, cite every claim, then argue with each other. They report. They don't decide.",
    tags: ["Anthropic API", "FastAPI", "Python", "Multi-Agent", "Web Search"],
    links: [
      { label: "GitHub", href: "https://github.com/shark79/agentic-workflow-claude" },
    ],
    whatItDoes:
      "Give it a feature idea. Each agent answers its own question: can it be built, is there a market, does it fit the product, does the money come back. They search the web and have to cite every line. Switch on adversarial mode and they challenge each other's findings, then defend their own. Results land in four tabs: findings, verdicts, the debate, and a full audit trail.",
    impact:
      "Two rules are enforced in code, not asked for in a prompt. Any citation pointing at a page the search never actually returned is thrown out. And an agent that files ten findings doesn't get ten times the say: every agent carries the same total weight, so being loud dilutes you.",
    whatILearned:
      "A prompt that says \"please cite real sources\" is a wish. A check that compares every link against what the search actually returned is a guarantee. I also learned to show the cost before spending it: the app estimates every run and asks first.",
    quiz: {
      question:
        "One agent files ten findings, another files one. Whose voice counts for more in the result?",
      options: ["The one with ten", "They count the same", "Whoever cites more links"],
      answer: 1,
      reveal:
        "The same. Every agent carries equal total weight, so ten findings are worth a tenth each. A press release republished by eight outlets doesn't count as eight sources either.",
    },
    stats: [
      { label: "Research agents", value: "4" },
      { label: "Invented citations kept", value: "0" },
      { label: "Tests, no network needed", value: "23" },
      { label: "Full debate, ballpark", value: "$2.45" },
    ],
  },
  {
    id: "reservation",
    name: "Reservation System with Failure Handling",
    start: "2026-07-31",
    period: "Jul to Aug 2026",
    brief:
      "A seat-booking app built to survive the exact bugs that take down real booking and payment systems, with tests that trigger those bugs on purpose.",
    tags: ["Reboot", "Python", "React", "MCP", "Durable Workflows"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/shark79/Reservation-System-Failure-Handling",
      },
    ],
    whatItDoes:
      "Four things quietly break booking systems in production: two people buying the same seat in the same instant, a retried request charging a card twice, a crash landing between taking the payment and sending the confirmation, and someone confirming a seat they never held. This handles all four by how it's built, not by patching each one where it shows up. It also runs inside an AI chat window, where one of its tools opens a real, clickable seat map right in the conversation.",
    impact:
      "Each of those four failures has an automated test that actually causes it, racing two real requests against each other and killing the process mid-payment, then checks the system still landed in the right state. That matters more now that AI agents call backends directly: an agent retries anything ambiguous and fires parallel calls far more often than a person clicking a button.",
    whatILearned:
      "Correctness is much cheaper when it comes from the architecture than when it depends on someone remembering to add a lock everywhere it's needed. Also, watching a real interface render inside a chat feels genuinely different from watching an AI describe one.",
    quiz: {
      question:
        "Two buyers tap reserve on the same seat in the same millisecond. How many of them get it?",
      options: ["Exactly one, always", "One, usually", "Both, sometimes"],
      answer: 0,
      reveal:
        "Exactly one. Every seat is its own durable actor, so changes queue up and each one re-checks the real current state before it commits. There's no gap for the second request to slip through.",
    },
    stats: [
      { label: "Failure modes survived", value: "4" },
      { label: "Tests that cause them", value: "4" },
      { label: "Front ends, one backend", value: "2" },
      { label: "Hand-written locks", value: "0" },
    ],
    game: "seat-race",
  },
  {
    id: "jobfinder",
    name: "Job Finder, Visa-Aware Job Search",
    start: "2026-07-28",
    period: "Jul 2026",
    brief:
      "Finds jobs at companies that genuinely sponsor visas, using the government's own filing data, then tailors a resume, finds a recruiter, and drafts the email. You hit send, it never does.",
    tags: ["MCP", "npm", "Node.js", "Apollo.io", "DOL Open Data"],
    links: [
      { label: "GitHub", href: "https://github.com/shark79/job-finder" },
      { label: "npm", href: "https://www.npmjs.com/package/@sharkbuilds/job-finder" },
    ],
    whatItDoes:
      "It checks whether a company has a real history of sponsoring visas using the Department of Labor's own quarterly filings, not a crowdsourced list that's usually out of date. If it does, it checks that company's actual job board, rewrites your resume's wording for that posting without touching the formatting, confirms it still fits on one page, finds a recruiter, drafts a personal email, and logs everything so nothing gets sent twice.",
    impact:
      "It's published on npm, so anyone can run it with a single command. The part I'm proudest of is the guardrail: the agent physically can't send an email, because the send tool was never handed to it. It can only create drafts you read first.",
    whatILearned:
      "Deciding what an agent isn't allowed to do mattered more than what it can do. Taking the send capability away entirely is a much stronger promise than a prompt asking the model not to send.",
    quiz: {
      question:
        "The agent writes personalized outreach emails. How many can it send on its own?",
      options: ["Unlimited", "One per day", "Zero"],
      answer: 2,
      reveal:
        "Zero. The send tool was never on its permitted list, only create-draft. It's a structural limit, not an instruction it could talk itself out of.",
    },
    stats: [
      { label: "Job boards queried live", value: "3" },
      { label: "Emails it can send", value: "0" },
      { label: "Published npm package", value: "1" },
      { label: "Source of sponsor data", value: "DOL" },
    ],
  },
  {
    id: "devteam",
    name: "Autonomous Dev Team on Open-Weight Models",
    start: "2026-07-06",
    period: "Jul to Aug 2026",
    brief:
      "Five AI agents with different jobs, including one whose only job is to break things, built and shipped a working app together for under twelve dollars.",
    tags: ["OpenCode", "OpenRouter", "Multi-Agent", "Kimi K3", "GLM 5.2"],
    links: [
      { label: "GitHub", href: "https://github.com/shark79/MultiAgent-Organization" },
    ],
    whatItDoes:
      "A small software team where every member is an AI agent with its own rules: an orchestrator that plans the work and decides when a phase is done, a backend developer, a frontend developer, a QA agent that writes and runs the tests, and an adversary that tries to break the running app on purpose. They hand work to each other, write every action to an audit log nobody can edit, and stop for a human sign-off before each new phase.",
    impact:
      "The whole build cost $11.56 in model spend, across 27.5 million tokens and 340 requests, on open-weight models rather than expensive frontier ones. An 88% cache hit rate did most of that work. The point isn't the price: the checkpoints, tests, and security pass are what made cheaper models good enough to trust.",
    whatILearned:
      "Agents are fine at writing code. What they're bad at is knowing when to stop. Nearly all my effort went into the rules around them: who can close a defect, when the orchestrator has to ask a human, and what actually counts as proof that something works.",
    quiz: {
      question:
        "Five agents planned, built, tested, and attacked a working app. What did the whole build cost in model spend?",
      options: ["$11.56", "$115", "$1,150"],
      answer: 0,
      reveal:
        "$11.56 for 27.5M tokens. Open-weight models via OpenRouter, an 88.2% cache hit rate, and a blended $0.42 per million tokens.",
    },
    stats: [
      { label: "Total model spend", value: "$11.56" },
      { label: "Tokens", value: "27.5M" },
      { label: "Requests", value: "340" },
      { label: "Cache hit rate", value: "88.2%" },
    ],
  },
  {
    id: "agentcore",
    name: "Production Agentic AI on AWS Bedrock AgentCore",
    start: "2026-05",
    period: "May 2026",
    brief:
      "Several AI agents split up a task instead of one model trying to do everything. Runs on AWS Bedrock AgentCore, coordinated with CrewAI, and connected to outside tools through MCP.",
    tags: ["AWS Bedrock AgentCore", "CrewAI", "MCP", "OpenTelemetry"],
    whatItDoes:
      "Instead of one model handling an entire task, the work is split across agents that each own a piece of it and hand off to each other. It's built on AWS Bedrock AgentCore, coordinated with CrewAI, and uses MCP so agents can call outside tools. The example is a travel agent that researches, plans, and recommends a full itinerary on its own.",
    impact:
      "Most serious AI products will need this shape eventually: several focused agents instead of one giant prompt. It also pushed me to learn a very new part of AWS before most people had touched it.",
    whatILearned:
      "Multi-agent systems break differently from single-agent ones. Getting agents to hand off cleanly and stay in their own lane took more design than the AI logic did.",
    quiz: {
      question:
        "In a multi-agent system, which part breaks first once you move past the demo?",
      options: ["The AI reasoning itself", "The handoffs between agents", "The cloud bill"],
      answer: 1,
      reveal:
        "The handoffs. Each agent works fine alone. Getting them to pass work cleanly and stay in their own lane took more design than the AI logic did.",
    },
    stats: [
      { label: "Agents sharing the task", value: "4" },
      { label: "One giant prompt", value: "0" },
      { label: "Tool protocol", value: "MCP" },
      { label: "Traced end to end", value: "Yes" },
    ],
  },
  {
    id: "summarizers",
    name: "One Summarizer, Three Ways",
    start: "2025-03",
    period: "Mar 2025",
    brief:
      "The same web-page summarizer built three times: on OpenAI in the cloud, on a local Llama 3 that never leaves the laptop, and on Claude through AWS Bedrock.",
    tags: ["Python", "OpenAI", "Ollama", "AWS Bedrock", "spaCy"],
    links: [{ label: "GitHub", href: "https://github.com/shark79/Gen-AI-projects" }],
    whatItDoes:
      "It pulls the readable text out of any web page and turns it into a clean summary. Each version swaps only the model underneath, so quality, speed, and privacy can be compared side by side. A fourth notebook measures how close words and sentences are in meaning.",
    impact:
      "My first hands-on comparison of the model providers I now use every day, and a big part of why moving between models in production later felt routine instead of risky.",
    whatILearned:
      "Keeping the model swappable behind one small interface costs almost nothing on day one and saves you on day three hundred.",
    quiz: {
      question: "Which of the three versions never sends the page anywhere?",
      options: ["OpenAI GPT-4", "Llama 3 via Ollama", "Claude on Bedrock"],
      answer: 1,
      reveal:
        "The Ollama one. Llama 3 runs locally, so the page and the summary never leave the machine. Same pipeline, zero cloud.",
    },
    stats: [
      { label: "Model providers", value: "3" },
      { label: "Runs fully offline", value: "1" },
      { label: "Notebooks", value: "4" },
      { label: "Lines changed to swap", value: "Few" },
    ],
  },
  {
    id: "styloguard",
    name: "StyloGuard, Authorship Verification",
    start: "2025-02-15",
    period: "Feb to May 2025",
    brief:
      "Checks whether a piece of writing actually matches someone's usual style, instead of just checking whether the words were copied.",
    tags: ["Python", "PyTorch", "SQL", "NLP"],
    links: [{ label: "GitHub", href: "https://github.com/shark79/StyloGuard" }],
    whatItDoes:
      "It looks at ten features of how someone writes, like sentence length, word choice, and punctuation habits, and compares new writing against that person's usual style. It flags submissions that don't match, even when no text was copied.",
    impact:
      "Most plagiarism tools only check for copied text, which paraphrasing tools get around easily. Style is a lot harder to fake.",
    whatILearned:
      "Catching real inconsistencies without flagging normal variation was the hardest part. People's writing shifts more than you'd expect, even within the same week.",
    quiz: {
      question:
        "How many separate features of someone's writing does it compare to spot a mismatch?",
      options: ["3", "10", "100"],
      answer: 1,
      reveal:
        "Ten, from sentence length to punctuation habits. Enough to catch a real mismatch, few enough to explain to a person why something got flagged.",
    },
    stats: [
      { label: "Style features compared", value: "10" },
      { label: "Text it needs copied", value: "0" },
      { label: "Beats paraphrasing", value: "Yes" },
      { label: "Built over", value: "4 mo" },
    ],
  },
  {
    id: "skillsynq",
    name: "SkillSynQ",
    start: "2025-02-01",
    period: "Feb to Mar 2025",
    brief:
      "Reads a job posting, works out which skills you're missing, and signs you up for the right courses. Serverless from start to finish.",
    tags: ["AWS Lambda", "OpenAI", "DynamoDB", "Selenium"],
    whatItDoes:
      "It pulls live job postings and course listings, compares them with OpenAI, and shows exactly which skills you're missing for a role. Approve a course match and it enrols you automatically, no extra steps.",
    impact:
      "Built in 36 hours at ASU's GenAI hackathon and picked for the showcase demos. Small tool, genuinely annoying problem: nobody wants to compare a job description against a course catalog by hand.",
    whatILearned:
      "Scraping live data is messier than any tutorial admits. I spent more time on broken page layouts and rate limits than on the matching logic.",
    quiz: {
      question:
        "Empty repo to showcase demo at ASU's GenAI hackathon. How long did it take?",
      options: ["36 hours", "2 weeks", "3 months"],
      answer: 0,
      reveal:
        "36 hours. Most of it went on scraping live job and course pages that kept changing shape, not on the matching logic.",
    },
    stats: [
      { label: "Empty repo to demo", value: "36h" },
      { label: "Picked for showcase", value: "Yes" },
      { label: "Servers to manage", value: "0" },
      { label: "Steps to enrol", value: "1" },
    ],
  },
  {
    id: "simulator",
    name: "Data Center Energy Simulator",
    start: "2024-12",
    period: "Dec 2024 to Apr 2025 · ASU",
    brief:
      "Pick how an AI data center gets its power, set a budget, and watch the cost, emissions, and waste change as you go.",
    tags: ["Python", "Streamlit", "Pandas", "Plotly"],
    links: [{ label: "GitHub", href: "https://github.com/shark79/Simulator" }],
    whatItDoes:
      "Six energy sources, solar, wind, hydro, nuclear, gas, and coal, each with real 2023 figures for output, cost, CO₂, and toxic waste. You mix them under a budget and it scores the result for sustainability, with charts showing where the money and the emissions actually go.",
    impact:
      "Built for a responsible-AI program at ASU and used in a classroom activity where students budgeted their own energy mix. It turns \"AI uses a lot of energy\" from a headline into a tradeoff you have to make yourself.",
    whatILearned:
      "People remember a decision they made far better than a number they read. The interactive part mattered more than perfect data.",
    quiz: {
      question:
        "Students got a budget and six power sources. What were they really trading off?",
      options: ["Cost against emissions", "Speed against accuracy", "Storage against bandwidth"],
      answer: 0,
      reveal:
        "Cost against emissions and waste. The cheapest mix is rarely the cleanest, and the simulator makes you feel that instead of just read it.",
    },
    stats: [
      { label: "Energy sources", value: "6" },
      { label: "Real data from", value: "2023" },
      { label: "Used in class", value: "Yes" },
      { label: "Score", value: "0–100" },
    ],
  },
  {
    id: "googlefiber",
    name: "Google Fiber Customer Support Analysis",
    start: "2024-09",
    period: "Sep to Nov 2024",
    brief:
      "Dug into support call data and found exactly where the biggest customer problems were coming from.",
    tags: ["Tableau", "BigQuery", "ETL", "Python"],
    whatItDoes:
      "I analyzed patterns in repeat support calls to find where the real problems started. One market region alone was behind 62% of all repeat calls.",
    impact:
      "That kind of finding changes where a company puts its resources. Instead of spreading fixes evenly, the team could focus on the one region causing most of the pain, with dashboards to track it going forward.",
    whatILearned:
      "The best insights often sit in data nobody sliced the right way. Not a complicated model, just the right question asked of the right data.",
    quiz: {
      question: "One market region was responsible for what share of every repeat support call?",
      options: ["12%", "38%", "62%"],
      answer: 2,
      reveal:
        "62%, from one region. Nothing clever in the model, just slicing the data by a dimension nobody had tried.",
    },
    stats: [
      { label: "Repeat calls, one region", value: "62%" },
      { label: "Regions analysed", value: "8" },
      { label: "Dashboards shipped", value: "Live" },
      { label: "Models required", value: "0" },
    ],
  },
];

/** Newest first, always — sorted here so adding a project can't break order. */
export const PROJECTS: Project[] = [...ALL_PROJECTS].sort((a, b) =>
  b.start.localeCompare(a.start),
);

/* ------------------------------------------------------------- about/edu */

export const ABOUT = [
  "I got into LLMs around 2023, not because everyone else was talking about them, but because I saw how useful they actually were. Getting a model to do something that would normally take days of manual work never got old.",
  "Most of what I build starts with something that annoys me. StyloGuard came from watching AI detectors get fooled by simple paraphrasing tools. SkillSynQ came from being tired of decoding job descriptions by hand. The energy simulator came from wanting data center carbon costs to feel real instead of like numbers in a report.",
  "Right now I'm an AI Developer at DocAide.ai, doing the most demanding work of my career: clinical AI, where mistakes aren't an option and speed matters as much as accuracy. Shipping FastAPI services, orchestrating LLMs, and leading a production move from GPT-4o to Claude on AWS Bedrock has taught me more than any side project could.",
  "Healthcare is where I am today. Finance, gaming, and design are where I'd like to take the same ideas next: systems that scale and are built responsibly. Still learning as I go, just quicker than I used to.",
];

export const ABOUT_QUIZ: Quiz = {
  question:
    "I cut the time to generate a clinical note from about 40 seconds to 15. What did that take?",
  options: ["A bigger model", "Running steps in parallel", "Caching the answers"],
  answer: 1,
  reveal:
    "Backend steps that were running one after another had no reason to. Running them at the same time did it. No new model, no cache, nothing that could go stale and hand a clinician the wrong note.",
};

export const STATS: Stat[] = [
  { label: "Master's GPA, ASU", value: "4.0" },
  { label: "Faster clinical notes", value: "60%" },
  { label: "Medication capture", value: "100%" },
  { label: "Agent iterations shipped", value: "40+" },
];

export const EDUCATION = [
  {
    degree: "M.S. Information Technology",
    school: "Arizona State University",
    meta: "Aug 2023 to May 2025 · GPA 4.0",
  },
  {
    degree: "B.Tech Computer Science & Engineering",
    school: "JNTU Hyderabad, India",
    meta: "Aug 2019 to Jul 2023",
  },
];

/* ------------------------------------------------------------- experience */

export const JOBS = [
  {
    company: "DocAide.ai",
    period: "Jun 2025 to Present",
    role: "AI Developer",
    desc: "I work on AI used in real clinical settings, so there's no room for the system to guess wrong. It's changed how I think about building software when real people depend on it.",
    bullets: [
      "Cut the time to generate a clinical note by more than half, from about 40 seconds to 15, by getting backend steps to run at the same time instead of one after another.",
      "Built the search system behind almost every AI feature on the platform, so it pulls up the right patient information quickly. Later moved it to a faster storage setup as usage grew.",
      "Built AI workflows that write medical orders straight into the hospital's record system with the correct medical codes and built-in checks that catch mistakes first. Got medication capture from noisy audio to 100%.",
      "Ran two AI models head to head on clinical note accuracy, led the switch to the winner, and made both fully supported on AWS Bedrock, so a clinician's answer never depends on which model is running underneath.",
      "Rebuilt how patient data is stored: vitals, labs, imaging, and cardiology results moved out of one overloaded field into their own tables, with the pipeline that fills them from clinical notes and a graph of vitals over time.",
      "Built subscription billing from scratch on Square: checkout, signed webhooks so payment events can be trusted, full payment lifecycle tracking, and automatic receipt and failed-payment emails. Shipped in three phases.",
      "Owned the critical fixes: a full production outage of both AI features, vitals not being picked up from dictated notes, and three cases of the assistant answering confidently but wrongly. Root-caused each one.",
    ],
  },
  {
    company: "Arizona State University",
    period: "Dec 2024 to May 2025",
    role: "Principled Innovation Assistant",
    desc: "Less about writing code, more about getting people to care. I helped build tools that make the environmental cost of AI feel like a real number instead of an abstract idea.",
    bullets: [
      "Built an energy simulator where you pick power sources and instantly see the cost and environmental tradeoffs, so the decisions stop being theoretical.",
      "Ran a classroom activity where students budgeted their own energy mix, and wrote guides that explain AI concepts to people without a technical background.",
    ],
  },
];

export const ACTIVITIES = [
  {
    org: "SODA, Software Developers Association at ASU",
    desc: "Member. Tech talks, conferences, and hackathons.",
  },
  {
    org: "Hindu Yuva, ASU",
    desc: "Volunteer organizer. Helped run student cultural events and networking mixers.",
  },
];

/** Read-alongside for the "spot the confident wrong answer" game. */
export const ACCURACY_NOTE =
  "The bug that matters most in clinical AI isn't a crash, it's a confident wrong answer: an invented symptom, a stale date, a medication list that quietly drops two prescriptions. All three happened in production and all three were root-caused and fixed.";

/* ----------------------------------------------------------------- skills */

export const SKILLS = [
  {
    name: "GenAI & LLM",
    skills: [
      "RAG Pipelines", "LangChain", "Agentic AI", "LLM Orchestration",
      "Prompt Engineering", "Model Evaluation", "Multi-Agent", "MCP",
      "Fine-tuning", "CrewAI", "AWS Strands", "Guardrails", "LLM Observability",
    ],
  },
  {
    name: "Models & APIs",
    skills: [
      "OpenAI GPT-4o", "OpenAI Embeddings", "Anthropic Claude", "Amazon Titan",
      "AWS Bedrock", "gpt-4o-transcribe", "Ollama",
    ],
  },
  {
    name: "Cloud & Backend",
    skills: [
      "Bedrock AgentCore", "Lambda", "ECS", "S3", "S3 Vectors", "RDS",
      "API Gateway", "Secrets Manager", "Docker", "CI/CD", "CloudWatch",
      "OpenTelemetry", "Python", "FastAPI", "TypeScript", "SQL", "PostgreSQL",
      "PGVector", "Pydantic", "Semantic Search", "ETL",
    ],
  },
  {
    name: "Tools & Domain",
    skills: [
      "Claude Code", "JavaScript", "React", "GCP BigQuery", "Dataflow", "Looker",
      "Tableau", "NumPy", "Pandas", "scikit-learn", "PyTorch", "TensorFlow",
      "HIPAA Certified", "FHIR", "ICD-10", "SNOMED CT", "EHRs", "MIPS / HIMSS",
    ],
  },
];

/* ---------------------------------------------------------------- gallery */

export const PHOTOS = [
  "IMG_0148.jpg", "IMG_0150.jpg", "IMG_0158.jpg", "IMG_0161.jpg",
  "IMG_0170.jpg", "IMG_0249.jpg", "IMG_0369.jpg", "IMG_0722.jpg",
  "IMG_1234.jpg", "IMG_1369.jpg", "IMG_2609.jpg", "IMG_3560.jpg",
  "IMG_4732.jpg",
];
