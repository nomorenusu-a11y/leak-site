/**
 * URL `?city=Gangnam` 같은 영문 코드를 한글 라벨로 매핑.
 * 광고 LP 운영 시 허용 목록을 빠르게 늘리는 용도.
 *
 * 미허용 값은 기본값으로 폴백한다. 외부 입력(searchParams)에서 직접 라벨을
 * 렌더하면 스푸핑·XSS 위험이 있어, 반드시 이 모듈을 거치도록 한다.
 */
export const CITY_LABELS = {
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
} as const satisfies Record<string, string>;

export type CityCode = keyof typeof CITY_LABELS;

const CITY_CODES = Object.keys(CITY_LABELS) as readonly CityCode[];

function isCityCode(v: unknown): v is CityCode {
  return typeof v === "string" && (CITY_CODES as readonly string[]).includes(v);
}

export type CityResolved = {
  code: CityCode | null;
  /** 사람이 읽는 지역 라벨. 기본값은 빈 문자열 (Hero가 fallback 헤드라인을 쓰도록). */
  label: string;
  isDefault: boolean;
};

export function resolveCity(
  raw: string | string[] | undefined,
): CityResolved {
  // searchParams[key]가 배열일 수 있으니 첫 값만 사용
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (isCityCode(value)) {
    return { code: value, label: CITY_LABELS[value], isDefault: false };
  }
  return { code: null, label: "", isDefault: true };
}
