import type { CaseStudyDraft } from "@/types/case-study";
import { gangnamFloorPipeStructuredDraft } from "./gangnam-floor-pipe-structured";

/**
 * Published case layouts are opted in one post at a time.
 * A missing entry keeps the existing /posts renderer intact.
 */
const caseStudyDrafts = new Map<string, CaseStudyDraft>([
  [gangnamFloorPipeStructuredDraft.sourceSlug, gangnamFloorPipeStructuredDraft],
]);

export function getCaseStudyDraft(slug: string): CaseStudyDraft | undefined {
  return caseStudyDrafts.get(slug);
}
