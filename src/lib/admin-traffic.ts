import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Row = {
  created_at: string;
  session_id: string;
  event_name: string;
  path: string;
  source: string;
  search_query: string | null;
  is_search: boolean;
  device_category: string;
};

type Bucket = { sessions: Set<string>; views: number };

function add(map: Map<string, Bucket>, key: string, session: string) {
  const bucket = map.get(key) ?? { sessions: new Set<string>(), views: 0 };
  bucket.sessions.add(session);
  bucket.views += 1;
  map.set(key, bucket);
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    direct: "직접 방문",
    naver: "네이버",
    google: "구글",
    daum: "다음",
    bing: "빙",
    youtube: "유튜브",
    instagram: "인스타그램",
  };
  return labels[source] ?? source;
}

export async function loadTrafficAnalytics(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const db = createSupabaseAdminClient();
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("analytics_events")
      .select("created_at,session_id,event_name,path,source,search_query,is_search,device_category")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (error) {
      if (error.code === "42P01") return emptyTraffic(days);
      throw error;
    }
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000 || rows.length >= 20_000) break;
  }

  const pageViews = rows.filter((row) => row.event_name === "page_view");
  const sessions = new Set(pageViews.map((row) => row.session_id));
  const searchSessions = new Set(
    pageViews.filter((row) => row.is_search).map((row) => row.session_id),
  );
  const sourceMap = new Map<string, Bucket>();
  const queryMap = new Map<string, Bucket>();
  const pageMap = new Map<string, Bucket>();
  const deviceMap = new Map<string, Bucket>();
  for (const row of pageViews) {
    add(sourceMap, row.source, row.session_id);
    add(pageMap, row.path.split("?")[0], row.session_id);
    add(deviceMap, row.device_category, row.session_id);
    if (row.is_search) add(queryMap, row.search_query || "(검색어 비공개)", row.session_id);
  }
  const toRows = (map: Map<string, Bucket>, label = (key: string) => key) =>
    [...map.entries()]
      .map(([key, value]) => ({
        key,
        label: label(key),
        sessions: value.sessions.size,
        views: value.views,
      }))
      .sort(
        (a, b) =>
          b.sessions - a.sessions || b.views - a.views || a.label.localeCompare(b.label, "ko"),
      );

  const conversionNames = ["click_call", "click_kakao", "submit_quote", "click_post_cta"];
  const conversions = conversionNames.map((eventName) => ({
    eventName,
    count: rows.filter((row) => row.event_name === eventName).length,
  }));
  return {
    available: true,
    days,
    since,
    sessions: sessions.size,
    pageViews: pageViews.length,
    searchSessions: searchSessions.size,
    searchShare: sessions.size
      ? Number(((searchSessions.size / sessions.size) * 100).toFixed(1))
      : 0,
    contactClicks: conversions.reduce((sum, item) => sum + item.count, 0),
    sources: toRows(sourceMap, sourceLabel).slice(0, 12),
    queries: toRows(queryMap).slice(0, 20),
    pages: toRows(pageMap).slice(0, 20),
    devices: toRows(deviceMap).slice(0, 5),
    conversions,
  };
}

function emptyTraffic(days: number) {
  return {
    available: false,
    days,
    since: new Date().toISOString(),
    sessions: 0,
    pageViews: 0,
    searchSessions: 0,
    searchShare: 0,
    contactClicks: 0,
    sources: [],
    queries: [],
    pages: [],
    devices: [],
    conversions: [],
  };
}
