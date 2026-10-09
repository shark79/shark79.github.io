import { defineJob } from "@/content/schema";

export default defineJob({
  id: "docaide",
  start: "2025-06",
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
});
