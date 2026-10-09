import { collectJobs } from "@/content/schema";
import docaide from "./docaide";
import asu from "./asu";

/** To add a role: create `<id>.ts` with `defineJob`, add it below. Sorted newest-first by `start`. */
export const JOBS = collectJobs([docaide, asu]);
