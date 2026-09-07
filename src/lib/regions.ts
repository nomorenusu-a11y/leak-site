import data from "@/data/seo/pilot-regions.json";
import type { Region, RegionPageContent } from "@/types/seo";

// Deployment allowlist: adding DB rows NEVER creates additional public routes.
// Expansion beyond these six URLs requires a separately approved code change.
export const PILOT_REGIONS: readonly Region[] = data.map((r) => ({
  id: r.id,
  parent_id: r.parent_id,
  level: r.level as Region["level"],
  slug: r.slug,
  name: r.name,
  active: true,
  source_url: r.source_url,
  source_checked_on: r.source_checked_on,
}));
export const SEOUL = PILOT_REGIONS[0];
export const DOBONG = PILOT_REGIONS[1];
export const PILOT_DONGS = PILOT_REGIONS.filter((r) => r.level === "dong");
export function regionById(id: string) {
  return PILOT_REGIONS.find((r) => r.id === id);
}
export function resolvePilotRegion(district?: string, dong?: string) {
  if (!district) return dong ? undefined : SEOUL;
  if (district !== DOBONG.slug) return undefined;
  return dong ? PILOT_DONGS.find((r) => r.slug === dong && r.parent_id === DOBONG.id) : DOBONG;
}
export function regionPath(region: Region): string {
  if (region.level === "city") return "/seoul";
  if (region.level === "district") return `/seoul/${region.slug}`;
  const parent = regionById(region.parent_id ?? "");
  if (!parent) throw new Error("Region outside approved pilot");
  return `${regionPath(parent)}/${region.slug}`;
}
export function regionAncestors(region: Region): Region[] {
  const parent = region.parent_id ? regionById(region.parent_id) : undefined;
  return [...(parent ? regionAncestors(parent) : []), region];
}
export function defaultRegionContent(id: string): RegionPageContent {
  const row = data.find((r) => r.id === id);
  if (!row) throw new Error("Unknown pilot region");
  return {
    region_id: row.id,
    title: row.title,
    description: row.description,
    intro: row.intro,
    faq: row.faq,
    published: row.published,
    indexable: row.indexable,
    updated_at: row.updated_at,
  };
}
