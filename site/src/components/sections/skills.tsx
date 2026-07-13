const CATEGORIES = [
  {
    name: "GenAI & LLM",
    skills: [
      "RAG Pipelines",
      "LangChain",
      "Agentic AI",
      "LLM Orchestration",
      "Prompt Engineering",
      "Model Evaluation",
      "Multi-Agent",
      "MCP",
      "Fine-tuning",
      "CrewAI",
      "AWS Strands",
      "Guardrails",
      "LLM Observability",
    ],
  },
  {
    name: "Models & APIs",
    skills: [
      "OpenAI GPT-4o",
      "OpenAI Embeddings",
      "Anthropic Claude",
      "Amazon Titan",
      "AWS Bedrock",
      "gpt-4o-transcribe",
    ],
  },
  {
    name: "AWS & Backend",
    skills: [
      "Bedrock AgentCore",
      "Lambda",
      "ECS",
      "S3",
      "S3 Vectors",
      "RDS",
      "API Gateway",
      "Secrets Manager",
      "Docker",
      "CI/CD",
      "CloudWatch",
      "OpenTelemetry",
      "Python",
      "FastAPI",
      "SQL",
      "PostgreSQL",
      "PGVector",
      "Pydantic",
      "Semantic Search",
      "ETL",
    ],
  },
  {
    name: "Tools & Domain",
    skills: [
      "Claude Code",
      "JavaScript",
      "React",
      "GCP BigQuery",
      "Dataflow",
      "Looker",
      "Tableau",
      "NumPy",
      "Pandas",
      "scikit-learn",
      "PyTorch",
      "TensorFlow",
      "HIPAA Certified",
      "FHIR",
      "ICD-10",
      "SNOMED CT",
      "EHRs",
      "MIPS / HIMSS",
    ],
  },
];

export function Skills() {
  return (
    <section className="border-b border-border px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-baseline gap-6">
          <span className="font-mono text-xs text-muted-foreground">04</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            What I work with
          </h2>
        </div>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <div className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground">
                {cat.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
