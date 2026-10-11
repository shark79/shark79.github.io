import { collectProjects } from "@/content/schema";
import agenticCommerce from "./agentic-commerce";
import campaignforge from "./campaignforge";
import researchpanel from "./researchpanel";
import reservation from "./reservation";
import jobfinder from "./jobfinder";
import devteam from "./devteam";
import agentcore from "./agentcore";
import summarizers from "./summarizers";
import styloguard from "./styloguard";
import skillsynq from "./skillsynq";
import simulator from "./simulator";
import googlefiber from "./googlefiber";

/**
 * To add a project: create `<id>.ts` next to this file with `defineProject`,
 * then add it below. Order here doesn't matter — the list is validated and
 * sorted newest-first by `start`, and the page sizes itself to the count.
 */
export const PROJECTS = collectProjects([
  agenticCommerce,
  campaignforge,
  researchpanel,
  reservation,
  jobfinder,
  devteam,
  agentcore,
  summarizers,
  styloguard,
  skillsynq,
  simulator,
  googlefiber,
]);
