export const POST_TRACKING_KEY = "post_search_tracking_v1";
export type TrackedPost = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  published_at: string;
};
export type PostCheck = {
  slug: string;
  checkedAt?: string;
  status?: number;
  sitemap?: boolean;
  canonicalInHead?: boolean;
  error?: string | null;
  search?: {
    keyword: string;
    checkedAt: string;
    found: boolean;
    matchedUrls: string[];
    error: string | null;
  };
};
export type PostTrackingState = {
  updatedAt: string | null;
  lastAdminRefreshAt?: string;
  cooldownUntil?: string;
  checks: Record<string, PostCheck>;
  history: { at: string; slug: string; kind: "page" | "search"; result: string }[];
};
export const emptyPostTracking = (): PostTrackingState => ({
  updatedAt: null,
  checks: {},
  history: [],
});
/** Merge a bulk checkpoint and a manual refresh without losing newer checks. */
export function mergeTrackingState(a: PostTrackingState, b: PostTrackingState): PostTrackingState {
  const checks = { ...a.checks };
  for (const [slug, check] of Object.entries(b.checks)) {
    const prior = checks[slug];
    const page =
      !prior ||
      Date.parse(check.checkedAt || "1970-01-01") >= Date.parse(prior.checkedAt || "1970-01-01")
        ? check
        : prior;
    const search =
      !prior?.search ||
      Date.parse(check.search?.checkedAt || "1970-01-01") >= Date.parse(prior.search.checkedAt)
        ? check.search
        : prior.search;
    checks[slug] = { ...page, ...(search ? { search } : {}) };
  }
  const history = [
    ...new Map(
      [...a.history, ...b.history].map((x) => [`${x.at}:${x.slug}:${x.kind}`, x]),
    ).values(),
  ]
    .sort((x, y) => x.at.localeCompare(y.at))
    .slice(-200);
  return {
    updatedAt: [a.updatedAt, b.updatedAt].filter(Boolean).sort().at(-1) || null,
    lastAdminRefreshAt: [a.lastAdminRefreshAt, b.lastAdminRefreshAt].filter(Boolean).sort().at(-1),
    cooldownUntil: [a.cooldownUntil, b.cooldownUntil].filter(Boolean).sort().at(-1),
    checks,
    history,
  };
}
export function isPublicPost(post: TrackedPost, now = new Date()) {
  return (
    post.published &&
    Number.isFinite(Date.parse(post.published_at)) &&
    Date.parse(post.published_at) <= +now
  );
}
export function normalizePostPath(value: string) {
  try {
    return decodeURIComponent(new URL(value, "https://nomorenusu.com").pathname).replace(/\/$/, "");
  } catch {
    return "";
  }
}
export function searchMatchesPost(slug: string, urls: string[]) {
  return urls.some((url) => {
    try {
      const parsed = new URL(url);
      return (
        ["nomorenusu.com", "www.nomorenusu.com"].includes(parsed.hostname) &&
        normalizePostPath(url) === `/posts/${slug}`
      );
    } catch {
      return false;
    }
  });
}
export function postSearchKeyword(title: string) {
  return title
    .split(/[|｜]/)[0]
    .replace(/자가점검|긴급대응|비용·보험/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
export function selectCheckBatch(
  posts: TrackedPost[],
  state: PostTrackingState,
  kind: "page" | "search",
  limit: number,
  now = new Date(),
) {
  return posts
    .filter((p) => isPublicPost(p, now))
    .sort((a, b) => {
      const ca = state.checks[a.slug],
        cb = state.checks[b.slug];
      const ta = kind === "page" ? ca?.checkedAt : ca?.search?.checkedAt;
      const tb = kind === "page" ? cb?.checkedAt : cb?.search?.checkedAt;
      return (
        (ta ? Date.parse(ta) : 0) - (tb ? Date.parse(tb) : 0) ||
        Date.parse(b.published_at) - Date.parse(a.published_at) ||
        a.slug.localeCompare(b.slug)
      );
    })
    .slice(0, limit);
}
export type TrafficEvent = {
  created_at: string;
  session_id: string;
  event_name: string;
  path: string;
  source: string;
  is_search: boolean;
  metadata?: Record<string, unknown>;
};
export function isExcludedTraffic(row: Pick<TrafficEvent, "metadata" | "path">) {
  return (
    row.path.startsWith("/admin") || row.metadata?.test === true || row.metadata?.internal === true
  );
}
export function contactAction(
  row: Pick<TrafficEvent, "event_name" | "metadata">,
): "phone" | "kakao" | "quote" | "post" | null {
  if (row.event_name === "click_call") return "phone";
  if (row.event_name === "click_kakao") return "kakao";
  if (row.event_name === "submit_quote") return "quote";
  if (row.event_name === "click_post_cta")
    return row.metadata?.button_type === "phone"
      ? "phone"
      : row.metadata?.button_type === "kakao"
        ? "kakao"
        : "post";
  return null;
}
export type PostMetric = {
  views: number;
  searchViews: number;
  naverViews: number;
  sessions: number;
  phone: number;
  kakao: number;
  quote: number;
  other: number;
};
export function aggregatePostTraffic(rows: TrafficEvent[]) {
  const result: Record<string, PostMetric> = {};
  const sessions = new Map<string, Set<string>>();
  for (const row of rows) {
    if (isExcludedTraffic(row)) continue;
    const path = normalizePostPath(row.path);
    const slug =
      path.match(/^\/posts\/([^/]+)$/)?.[1] ||
      (typeof row.metadata?.slug === "string" ? row.metadata.slug : undefined);
    if (!slug) continue;
    const metric = (result[slug] ??= {
      views: 0,
      searchViews: 0,
      naverViews: 0,
      sessions: 0,
      phone: 0,
      kakao: 0,
      quote: 0,
      other: 0,
    });
    if (row.event_name === "page_view") {
      metric.views++;
      if (row.is_search) metric.searchViews++;
      if (row.source === "naver") metric.naverViews++;
      const ids = sessions.get(slug) || new Set<string>();
      ids.add(row.session_id);
      sessions.set(slug, ids);
      metric.sessions = ids.size;
    }
    const action = contactAction(row);
    if (action === "phone") metric.phone++;
    else if (action === "kakao") metric.kakao++;
    else if (action === "quote") metric.quote++;
    else if (action === "post") metric.other++;
  }
  return result;
}
