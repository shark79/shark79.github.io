/**
 * Every word on the site lives here or in src/content/ (one file per project
 * and job). Components import from this module; they don't own any copy.
 *
 * NDA: the day job is at DocAide.ai. Never name an internal tool, feature, or
 * codename — describe the work as a skill or a publicly known tool only.
 */

export const PROFILE = {
  name: "Shashank Jamkhandi",
  role: "AI Engineer",
  eyebrow: "AI Engineer · Applied GenAI & Agentic Systems",
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

/* ---------------------------------------------------- projects & jobs */

// One file per entry under src/content/, validated and sorted at build time.
export { PROJECTS } from "@/content/projects";
export { JOBS } from "@/content/experience";
export type { Project, Job, Stat } from "@/content/schema";
import type { Stat } from "@/content/schema";

/* ------------------------------------------------------------- about/edu */

export const ABOUT = [
  "I got into LLMs around 2023, not because everyone else was talking about them, but because I saw how useful they actually were. Getting a model to do something that would normally take days of manual work never got old.",
  "Most of what I build starts with something that annoys me. StyloGuard came from watching AI detectors get fooled by simple paraphrasing tools. SkillSynQ came from being tired of decoding job descriptions by hand. The energy simulator came from wanting data center carbon costs to feel real instead of like numbers in a report.",
  "Right now I'm an AI Developer at DocAide.ai, doing the most demanding work of my career: clinical AI, where mistakes aren't an option and speed matters as much as accuracy. Shipping FastAPI services, orchestrating LLMs, and leading a production move from GPT-4o to Claude on AWS Bedrock has taught me more than any side project could.",
  "Healthcare is where I am today. Finance, gaming, and design are where I'd like to take the same ideas next: systems that scale and are built responsibly. Still learning as I go, just quicker than I used to.",
];

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

