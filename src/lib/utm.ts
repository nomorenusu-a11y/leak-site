/**
 * UTM 파라미터 보존 — sessionStorage 기반, 1시간 TTL.
 *
 * 광고 클릭으로 들어온 utm_*을 페이지 이동을 거쳐도 폼 제출 시까지 보존.
 */

const STORAGE_KEY = "leak-site:utm";
const TTL_MS = 60 * 60 * 1000; // 1h

type StoredUtm = {
  utm_source?: string;
  utm_campaign?: string;
  city_code?: string;
  expiresAt: number;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** 페이지 로딩 시 호출 — URL에 utm이 있으면 저장. */
export function captureUtmFromUrl(): void {
  const s = safeStorage();
  if (!s) return;
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") ?? undefined;
  const utm_campaign = params.get("utm_campaign") ?? undefined;
  const city_code = params.get("city") ?? undefined;
  if (!utm_source && !utm_campaign && !city_code) return;
  const payload: StoredUtm = {
    utm_source,
    utm_campaign,
    city_code,
    expiresAt: Date.now() + TTL_MS,
  };
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

/** 저장된 utm 읽기. 만료됐으면 null. */
export function readStoredUtm(): {
  utm_source?: string;
  utm_campaign?: string;
  city_code?: string;
} | null {
  const s = safeStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUtm;
    if (Date.now() > parsed.expiresAt) {
      s.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      utm_source: parsed.utm_source,
      utm_campaign: parsed.utm_campaign,
      city_code: parsed.city_code,
    };
  } catch {
    return null;
  }
}
