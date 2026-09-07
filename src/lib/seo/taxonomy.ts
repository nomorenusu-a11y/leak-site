import data from "@/data/seo/terms.json";
import type { SeoTerm, TermAxis } from "@/types/seo";
export const SEO_TERMS = data as SeoTerm[];
export const AXIS_LABELS: Record<TermAxis, string> = {
  building_type: "건물유형",
  leak_type: "누수·설비 유형",
  symptom: "관찰된 증상",
  detection_method: "실제로 사용한 탐지방법",
  work_type: "실제로 수행한 작업",
};
export function validTermIds(ids: string[]): boolean {
  return (
    ids.length <= 50 &&
    new Set(ids).size === ids.length &&
    ids.every((id) => SEO_TERMS.some((t) => t.id === id))
  );
}
