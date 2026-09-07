import allRegionData from "@/data/seo/seoul-regions.json";
import pilotData from "@/data/seo/pilot-regions.json";
import type { Region, RegionPageContent } from "@/types/seo";

type RegionSeed = Omit<Region, "active"> & Partial<RegionPageContent>;

const pilotById = new Map((pilotData as RegionSeed[]).map((region) => [region.id, region]));

/** Official hierarchy: Seoul → 25 districts → 467 legal dongs. */
export const SEOUL_REGIONS: readonly Region[] = (allRegionData as RegionSeed[]).map((region) => {
  const pilot = pilotById.get(region.id);
  return {
    id: region.id,
    parent_id: region.parent_id,
    level: region.level,
    slug: pilot?.slug ?? region.slug,
    name: region.name,
    active: true,
    source_url: region.source_url,
    source_checked_on: region.source_checked_on,
  };
});

export const SEOUL = SEOUL_REGIONS.find((region) => region.level === "city")!;
export const SEOUL_DISTRICTS = SEOUL_REGIONS.filter((region) => region.level === "district");
export const SEOUL_DONGS = SEOUL_REGIONS.filter((region) => region.level === "dong");

/** Reviewed Dobong content remains the initial indexed pilot. */
export const PILOT_REGIONS = SEOUL_REGIONS.filter((region) => pilotById.has(region.id));
export const DOBONG = SEOUL_REGIONS.find((region) => region.id === "1132000000")!;
export const PILOT_DONGS = PILOT_REGIONS.filter((region) => region.level === "dong");

export function regionById(id: string) {
  return SEOUL_REGIONS.find((region) => region.id === id);
}

export function regionChildren(region: Region) {
  return SEOUL_REGIONS.filter((candidate) => candidate.parent_id === region.id);
}

export function resolveRegion(district?: string, dong?: string) {
  if (!district) return dong ? undefined : SEOUL;
  const districtRegion = SEOUL_DISTRICTS.find((region) => region.slug === district);
  if (!districtRegion) return undefined;
  if (!dong) return districtRegion;
  return SEOUL_DONGS.find(
    (region) => region.parent_id === districtRegion.id && region.slug === dong,
  );
}

export const resolvePilotRegion = resolveRegion;

export function regionPath(region: Region): string {
  if (region.level === "city") return "/seoul";
  if (region.level === "district") return `/seoul/${region.slug}`;
  const parent = regionById(region.parent_id ?? "");
  if (!parent) throw new Error(`Unknown parent for region ${region.id}`);
  return `${regionPath(parent)}/${region.slug}`;
}

export function regionAncestors(region: Region): Region[] {
  const parent = region.parent_id ? regionById(region.parent_id) : undefined;
  return [...(parent ? regionAncestors(parent) : []), region];
}

function genericFaq(region: Region) {
  return [
    {
      question: `${region.name} 누수 상담 전 무엇을 알려야 하나요?`,
      answer:
        "작업 주소, 건물 유형, 물이 보이는 위치와 처음 발견한 시점을 알려 주세요. 원인과 작업 범위는 현장 확인 전까지 단정하지 않습니다.",
    },
    {
      question: "사진만으로 누수 원인과 비용을 확정할 수 있나요?",
      answer:
        "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인, 탐지 방법, 보수 범위와 비용은 현장 상태를 확인한 뒤 안내합니다.",
    },
  ];
}

/** Local fallback and initial noindex copy. Production content can supersede it via region_pages. */
export function defaultRegionContent(id: string): RegionPageContent {
  const pilot = pilotById.get(id);
  if (pilot?.title && pilot.description && pilot.intro && pilot.faq && pilot.updated_at) {
    return {
      region_id: pilot.id,
      title: pilot.title,
      description: pilot.description,
      intro: pilot.intro,
      faq: pilot.faq,
      published: pilot.published ?? true,
      indexable: pilot.indexable ?? true,
      updated_at: pilot.updated_at,
    };
  }
  const region = regionById(id);
  if (!region) throw new Error(`Unknown Seoul region: ${id}`);
  const title = region.level === "city" ? "서울 누수탐지 지역 안내" : `${region.name} 누수탐지 지역 안내`;
  return {
    region_id: region.id,
    title,
    description: `서울 ${region.name} 누수 상담과 지역 안내입니다. 실제 시공사례는 작업 지역이 확인된 경우에만 연결합니다.`,
    intro: `${region.name}에서 누수 증상이 보이면 주소, 건물 유형, 물이 보이는 위치와 발견 시점을 전화 상담에서 알려 주세요.`,
    faq: genericFaq(region),
    published: true,
    // All legal-dong URLs exist, but only reviewed pages or pages with a verified case are indexed.
    indexable: false,
    updated_at: "2026-09-07T00:00:00.000Z",
  };
}
