export const NAVER_SEARCH_VISIBILITY_KEY = "naver_search_visibility_v1";

export type NaverOfficialKeyword = {
  keyword: string;
  clicks: number;
  impressions: number;
};

export type NaverSearchCheck = {
  keyword: string;
  visible: boolean;
  matchedUrls: string[];
  error: string | null;
};

export type NaverSearchVisibilityState = {
  officialReport: {
    updatedAt: string;
    periodDays: number;
    clicks: number;
    impressions: number;
    ctr: number;
    keywords: NaverOfficialKeyword[];
  };
  trackedKeywords: string[];
  publicSearch: {
    checkedAt: string | null;
    checks: NaverSearchCheck[];
  };
};

export const DEFAULT_TRACKED_KEYWORDS = [
  "노모어누수",
  "노모어누수탐지",
  "문정동 온수배관 누수",
  "불광동 수도계량기 누수",
  "쌍문동 변기 누수",
  "전농동 누수",
  "광진구 난방배관청소",
  "서울 누수탐지",
  "인천 누수탐지",
  "경기도 누수탐지",
];

export const DEFAULT_NAVER_SEARCH_VISIBILITY: NaverSearchVisibilityState = {
  officialReport: {
    updatedAt: "2026-09-20",
    periodDays: 30,
    clicks: 2,
    impressions: 21,
    ctr: 9.5,
    keywords: [
      { keyword: "노모어누수", clicks: 1, impressions: 2 },
      { keyword: "유레카 누수", clicks: 1, impressions: 1 },
      { keyword: "최태환 누수", clicks: 0, impressions: 4 },
      { keyword: "노모어호스", clicks: 0, impressions: 2 },
      { keyword: "문정 노모어", clicks: 0, impressions: 2 },
      { keyword: "노모어누수탐지", clicks: 0, impressions: 2 },
      { keyword: "전농동누수", clicks: 0, impressions: 1 },
      { keyword: "유레카 누수탐지", clicks: 0, impressions: 1 },
      { keyword: "광진구 난방배관청소", clicks: 0, impressions: 1 },
      { keyword: "불광동수도계량기교체", clicks: 0, impressions: 1 },
    ],
  },
  trackedKeywords: DEFAULT_TRACKED_KEYWORDS,
  publicSearch: {
    checkedAt: null,
    checks: [],
  },
};

function decodeSearchUrl(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("\\u0026", "&")
    .replace(/[),.;]+$/, "");
}

/** 네이버 통합검색 HTML에서 노모어누수의 직접 결과 URL만 추린다. */
export function parseNaverSearchHtml(html: string): string[] {
  const directHref = /href=(?:"|')(https?:\/\/(?:www\.)?nomorenusu\.com(?:\/[^"'<>\s]*)?)(?:"|')/gi;
  const urls = new Set<string>();
  for (const match of html.matchAll(directHref)) {
    const url = decodeSearchUrl(match[1]);
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "nomorenusu.com" || parsed.hostname === "www.nomorenusu.com") {
        parsed.hash = "";
        urls.add(parsed.toString());
      }
    } catch {
      // 검색 HTML의 비정상 링크는 결과에서 제외한다.
    }
  }
  return [...urls];
}

export async function checkNaverSearchKeyword(keyword: string): Promise<NaverSearchCheck> {
  try {
    const url = new URL("https://search.naver.com/search.naver");
    url.searchParams.set("where", "nexearch");
    url.searchParams.set("sm", "top_hty");
    url.searchParams.set("query", keyword);

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`네이버 응답 ${response.status}`);

    const matchedUrls = parseNaverSearchHtml(await response.text());
    return {
      keyword,
      visible: matchedUrls.length > 0,
      matchedUrls: matchedUrls.slice(0, 5),
      error: null,
    };
  } catch (error) {
    return {
      keyword,
      visible: false,
      matchedUrls: [],
      error: error instanceof Error ? error.message : "검색 결과를 확인하지 못했습니다.",
    };
  }
}

export function mergeNaverSearchVisibility(
  saved: NaverSearchVisibilityState | null | undefined,
): NaverSearchVisibilityState {
  if (!saved) return DEFAULT_NAVER_SEARCH_VISIBILITY;
  return {
    officialReport: saved.officialReport ?? DEFAULT_NAVER_SEARCH_VISIBILITY.officialReport,
    trackedKeywords:
      Array.isArray(saved.trackedKeywords) && saved.trackedKeywords.length
        ? saved.trackedKeywords.slice(0, 20)
        : DEFAULT_TRACKED_KEYWORDS,
    publicSearch: saved.publicSearch ?? DEFAULT_NAVER_SEARCH_VISIBILITY.publicSearch,
  };
}
