import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { collectPages } from "@/lib/collect-pages";
import { checkNaverSearchKeyword } from "@/lib/naver-search-visibility";
import { setSiteContent } from "@/lib/site-content";
import {
  emptyPostTracking,
  mergeTrackingState,
  isPublicPost,
  POST_TRACKING_KEY,
  postSearchKeyword,
  searchMatchesPost,
  selectCheckBatch,
  type TrackedPost,
  type PostTrackingState,
  type PostCheck,
} from "@/lib/post-tracking";

export async function loadTrackedPosts() {
  const db = createSupabaseAdminClient();
  return collectPages<TrackedPost>(async (from, to) => {
    const { data, error } = await db
      .from("posts")
      .select("id,slug,title,published,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .order("id")
      .range(from, to);
    if (error) throw error;
    return data || [];
  });
}
export async function loadPostTracking() {
  const { data, error } = await createSupabaseAdminClient()
    .from("site_content")
    .select("value")
    .eq("key", POST_TRACKING_KEY)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as PostTrackingState | null) || emptyPostTracking();
}
export async function refreshPostTracking() {
  const [posts, state] = await Promise.all([loadTrackedPosts(), loadPostTracking()]);
  const now = new Date();
  if (state.lastAdminRefreshAt && +now - Date.parse(state.lastAdminRefreshAt) < 60000)
    return { ...state, cached: true, pagesChecked: 0, searchChecked: 0 };
  const sitemapResponse = await fetch("https://nomorenusu.com/sitemap.xml", {
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!sitemapResponse.ok) throw new Error(`사이트맵 응답 ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const next: PostTrackingState = {
    ...state,
    lastAdminRefreshAt: now.toISOString(),
    checks: { ...state.checks },
    history: [...state.history],
    updatedAt: now.toISOString(),
  };
  const pageBatch = selectCheckBatch(posts, state, "page", 6, now);
  for (let i = 0; i < pageBatch.length; i += 2) {
    const updates = await Promise.all(
      pageBatch.slice(i, i + 2).map(async (post): Promise<PostCheck> => {
        const current = next.checks[post.slug] || { slug: post.slug };
        // Re-check publication time here; callers cannot supply arbitrary or future URLs.
        if (!isPublicPost(post, new Date())) return current;
        try {
          const response = await fetch(
            `https://nomorenusu.com/posts/${encodeURIComponent(post.slug)}`,
            {
              headers: { "user-agent": "Nomorenusu-Public-Page-Check/1.0" },
              cache: "no-store",
              signal: AbortSignal.timeout(12000),
            },
          );
          const html = await response.text();
          const canonical = html.search(/<link\b[^>]*rel=["']canonical["']/i);
          const headEnd = html.indexOf("</head>");
          return {
            ...current,
            checkedAt: new Date().toISOString(),
            status: response.status,
            sitemap: sitemap.includes(`/posts/${post.slug}</loc>`),
            canonicalInHead: canonical >= 0 && canonical < headEnd,
            error: response.ok ? null : `HTTP ${response.status}`,
          };
        } catch (error) {
          return {
            ...current,
            checkedAt: new Date().toISOString(),
            error: error instanceof Error ? error.message : "접속 확인 실패",
          };
        }
      }),
    );
    for (const check of updates) {
      next.checks[check.slug] = check;
      next.history.push({
        at: check.checkedAt!,
        slug: check.slug,
        kind: "page",
        result:
          check.error || `HTTP ${check.status} · 사이트맵 ${check.sitemap ? "포함" : "미포함"}`,
      });
    }
  }
  let searchChecked = 0;
  if (!state.cooldownUntil || Date.parse(state.cooldownUntil) <= +now) {
    for (const post of selectCheckBatch(posts, state, "search", 3, now)) {
      const check = await checkNaverSearchKeyword(postSearchKeyword(post.title));
      const searchedAt = new Date().toISOString();
      next.checks[post.slug] = {
        ...(next.checks[post.slug] || { slug: post.slug }),
        search: {
          keyword: check.keyword,
          checkedAt: searchedAt,
          found: searchMatchesPost(post.slug, check.matchedUrls),
          matchedUrls: check.matchedUrls,
          error: check.error,
        },
      };
      next.history.push({
        at: searchedAt,
        slug: post.slug,
        kind: "search",
        result:
          check.error ||
          (searchMatchesPost(post.slug, check.matchedUrls)
            ? "해당 글 링크 확인"
            : "검사한 결과에서 해당 글 링크 미확인"),
      });
      searchChecked++;
      if (check.error?.includes("403") || check.error?.includes("429")) {
        next.cooldownUntil = new Date(+now + 6 * 3600000).toISOString();
        break;
      }
    }
  }
  next.history = next.history.slice(-200);
  const merged = mergeTrackingState(await loadPostTracking(), next);
  await setSiteContent(POST_TRACKING_KEY, merged);
  return { ...merged, cached: false, pagesChecked: pageBatch.length, searchChecked };
}
