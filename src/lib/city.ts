/**
 * 도시 코드 ↔ 라벨/슬러그/region_tag 매핑.
 * - `code` (PascalCase): URL `?city=Gangnam`, 내부 키
 * - `label` (짧은 한글): 1단계 Hero("강남 누수 전문")
 * - `regionTag` (풀네임): DB `posts.region_tags` 매칭, 게시판 제목("강남구 누수 시공 사례")
 * - `slug` (소문자): 게시판 URL `/posts/region/gangnam`
 *
 * 외부 입력(searchParams/URL params)에서 직접 라벨을 렌더하면 스푸핑·XSS 위험이 있어
 * 반드시 이 모듈의 매핑을 거치도록 한다.
 */

export const CITY_LABELS = {
  // 서울 25구
  Gangnam: "강남",
  Seocho: "서초",
  Songpa: "송파",
  Gangdong: "강동",
  Dobong: "도봉",
  Nowon: "노원",
  Gangbuk: "강북",
  Seongbuk: "성북",
  Jongno: "종로",
  Jung: "중구",
  Yongsan: "용산",
  Mapo: "마포",
  Seodaemun: "서대문",
  Eunpyeong: "은평",
  Yangcheon: "양천",
  Gangseo: "강서",
  Guro: "구로",
  Geumcheon: "금천",
  Yeongdeungpo: "영등포",
  Dongjak: "동작",
  Gwanak: "관악",
  Gwangjin: "광진",
  Seongdong: "성동",
  Dongdaemun: "동대문",
  Jungnang: "중랑",
  // 신도시·경기권 (필요 시 점진 추가)
  Bundang: "분당",
} as const satisfies Record<string, string>;

export type CityCode = keyof typeof CITY_LABELS;

/**
 * DB `posts.region_tags` 값과 1:1 매칭. 25구는 "X구", 신도시는 그대로.
 * 추가 도시 도입 시 CITY_LABELS와 함께 업데이트 필요.
 */
export const CITY_REGION_TAGS = {
  Gangnam: "강남구",
  Seocho: "서초구",
  Songpa: "송파구",
  Gangdong: "강동구",
  Dobong: "도봉구",
  Nowon: "노원구",
  Gangbuk: "강북구",
  Seongbuk: "성북구",
  Jongno: "종로구",
  Jung: "중구",
  Yongsan: "용산구",
  Mapo: "마포구",
  Seodaemun: "서대문구",
  Eunpyeong: "은평구",
  Yangcheon: "양천구",
  Gangseo: "강서구",
  Guro: "구로구",
  Geumcheon: "금천구",
  Yeongdeungpo: "영등포구",
  Dongjak: "동작구",
  Gwanak: "관악구",
  Gwangjin: "광진구",
  Seongdong: "성동구",
  Dongdaemun: "동대문구",
  Jungnang: "중랑구",
  Bundang: "분당",
} as const satisfies Record<CityCode, string>;

const CITY_CODES = Object.keys(CITY_LABELS) as readonly CityCode[];

export const ALL_CITY_CODES: readonly CityCode[] = CITY_CODES;

function isCityCode(v: unknown): v is CityCode {
  return typeof v === "string" && (CITY_CODES as readonly string[]).includes(v);
}

/** PascalCase 코드 → 소문자 슬러그. `Gangnam` → `gangnam`. */
export function cityCodeToSlug(code: CityCode): string {
  return code.toLowerCase();
}

/** 소문자 슬러그 → PascalCase 코드. 미허용 슬러그면 null. */
export function parseCitySlug(slug: string): CityCode | null {
  const lower = slug.toLowerCase();
  for (const code of CITY_CODES) {
    if (code.toLowerCase() === lower) return code;
  }
  return null;
}

export type CityResolved = {
  code: CityCode | null;
  /** 짧은 라벨(예: "강남"). 광고 LP 헤드라인용. 기본값은 빈 문자열. */
  label: string;
  isDefault: boolean;
};

export function resolveCity(
  raw: string | string[] | undefined,
): CityResolved {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (isCityCode(value)) {
    return { code: value, label: CITY_LABELS[value], isDefault: false };
  }
  return { code: null, label: "", isDefault: true };
}
