export type Acquisition = {
  source: string;
  referrerHost: string | null;
  searchQuery: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  isSearch: boolean;
};

const SESSION_KEY = "nomorenusu_analytics_session";
const ACQUISITION_KEY = "nomorenusu_analytics_acquisition";
const LAST_PAGE_KEY = "nomorenusu_analytics_last_page";

function clean(value: string | null, limit: number) {
  const result = value?.trim().slice(0, limit);
  return result || null;
}

export function deriveAcquisition(referrerValue: string, currentValue: string): Acquisition {
  const current = new URL(currentValue, "https://nomorenusu.com");
  const utmSource = clean(current.searchParams.get("utm_source"), 100);
  const utmCampaign = clean(current.searchParams.get("utm_campaign"), 100);
  let referrer: URL | null = null;
  try {
    if (referrerValue) referrer = new URL(referrerValue);
  } catch {
    referrer = null;
  }
  const host = referrer?.hostname.replace(/^www\./, "") ?? null;
  const query = clean(
    referrer?.searchParams.get("query") ??
      referrer?.searchParams.get("q") ??
      referrer?.searchParams.get("keyword") ??
      referrer?.searchParams.get("wd") ??
      null,
    200,
  );
  const source = utmSource
    ? utmSource.toLowerCase()
    : host?.endsWith("naver.com")
      ? "naver"
      : host?.endsWith("google.com") || host?.startsWith("google.")
        ? "google"
        : host?.endsWith("daum.net") || host?.endsWith("kakao.com")
          ? "daum"
          : host?.endsWith("bing.com")
            ? "bing"
            : host?.includes("youtube.com") || host === "youtu.be"
              ? "youtube"
              : host?.includes("instagram.com")
                ? "instagram"
                : host && host !== current.hostname.replace(/^www\./, "")
                  ? host
                  : "direct";
  return {
    source: source.slice(0, 120),
    referrerHost: host,
    searchQuery: query,
    utmSource,
    utmCampaign,
    isSearch: ["naver", "google", "daum", "bing"].includes(source),
  };
}

function getSessionId() {
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

function getAcquisition() {
  const existing = sessionStorage.getItem(ACQUISITION_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as Acquisition;
    } catch {
      sessionStorage.removeItem(ACQUISITION_KEY);
    }
  }
  const value = deriveAcquisition(document.referrer, window.location.href);
  sessionStorage.setItem(ACQUISITION_KEY, JSON.stringify(value));
  return value;
}

function deviceCategory(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function cleanMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 12)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [
        key.slice(0, 60),
        typeof value === "string" ? value.slice(0, 300) : value,
      ]),
  );
}

export function recordTrafficEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
  const acquisition = getAcquisition();
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId: getSessionId(),
      eventName,
      path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
      acquisition,
      deviceCategory: deviceCategory(),
      metadata: cleanMetadata(metadata),
    }),
  }).catch(() => undefined);
}

export function recordPageView() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
  const key = `${window.location.pathname}${window.location.search}`;
  const previous = sessionStorage.getItem(LAST_PAGE_KEY);
  const now = Date.now();
  if (previous) {
    const [previousKey, previousAt] = previous.split("|");
    if (previousKey === key && now - Number(previousAt) < 1_500) return;
  }
  sessionStorage.setItem(LAST_PAGE_KEY, `${key}|${now}`);
  recordTrafficEvent("page_view");
}
