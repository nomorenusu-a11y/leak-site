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

type DailyBucket = {
  sessions: Set<string>;
  searchSessions: Set<string>;
  views: number;
  contacts: number;
};

const CONTACT_EVENTS = new Set(["click_call", "click_kakao", "submit_quote", "click_post_cta"]);

function kstDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

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
  const now = Date.now();
  const since = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  const previousSince = new Date(now - days * 2 * 24 * 60 * 60 * 1000).toISOString();
  const db = createSupabaseAdminClient();
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("analytics_events")
      .select("created_at,session_id,event_name,path,source,search_query,is_search,device_category")
      .gte("created_at", previousSince)
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (error) {
      if (error.code === "42P01") return emptyTraffic(days);
      throw error;
    }
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000 || rows.length >= 20_000) break;
  }

  const currentRows = rows.filter((row) => row.created_at >= since);
  const previousRows = rows.filter(
    (row) => row.created_at >= previousSince && row.created_at < since,
  );
  const pageViews = currentRows.filter((row) => row.event_name === "page_view");
  const previousPageViews = previousRows.filter((row) => row.event_name === "page_view");
  const sessions = new Set(pageViews.map((row) => row.session_id));
  const searchSessions = new Set(
    pageViews.filter((row) => row.is_search).map((row) => row.session_id),
  );
  const sourceMap = new Map<string, Bucket>();
  const queryMap = new Map<string, Bucket>();
  const pageMap = new Map<string, Bucket>();
  const deviceMap = new Map<string, Bucket>();
  const dailyMap = new Map<string, DailyBucket>();
  for (const row of pageViews) {
    add(sourceMap, row.source, row.session_id);
    add(pageMap, row.path.split("?")[0], row.session_id);
    add(deviceMap, row.device_category, row.session_id);
    if (row.is_search) add(queryMap, row.search_query || "(검색어 비공개)", row.session_id);

    const key = kstDateKey(row.created_at);
    const daily = dailyMap.get(key) ?? {
      sessions: new Set<string>(),
      searchSessions: new Set<string>(),
      views: 0,
      contacts: 0,
    };
    daily.sessions.add(row.session_id);
    if (row.is_search) daily.searchSessions.add(row.session_id);
    daily.views += 1;
    dailyMap.set(key, daily);
  }

  for (const row of currentRows) {
    if (!CONTACT_EVENTS.has(row.event_name)) continue;
    const key = kstDateKey(row.created_at);
    const daily = dailyMap.get(key) ?? {
      sessions: new Set<string>(),
      searchSessions: new Set<string>(),
      views: 0,
      contacts: 0,
    };
    daily.contacts += 1;
    dailyMap.set(key, daily);
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

  const conversionNames = [...CONTACT_EVENTS];
  const conversions = conversionNames.map((eventName) => ({
    eventName,
    count: currentRows.filter((row) => row.event_name === eventName).length,
  }));
  const daily = Array.from({ length: days }, (_, index) => {
    const date = new Date(now - (days - index - 1) * 24 * 60 * 60 * 1000);
    const key = kstDateKey(date);
    const bucket = dailyMap.get(key);
    return {
      date: key,
      sessions: bucket?.sessions.size ?? 0,
      views: bucket?.views ?? 0,
      searchSessions: bucket?.searchSessions.size ?? 0,
      contacts: bucket?.contacts ?? 0,
    };
  });
  const previousSessions = new Set(previousPageViews.map((row) => row.session_id)).size;
  const previousSearchSessions = new Set(
    previousPageViews.filter((row) => row.is_search).map((row) => row.session_id),
  ).size;
  const previousContacts = previousRows.filter((row) => CONTACT_EVENTS.has(row.event_name)).length;
  const today = daily.at(-1) ?? {
    date: kstDateKey(new Date()),
    sessions: 0,
    views: 0,
    searchSessions: 0,
    contacts: 0,
  };
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
    changes: {
      sessions: percentChange(sessions.size, previousSessions),
      pageViews: percentChange(pageViews.length, previousPageViews.length),
      searchSessions: percentChange(searchSessions.size, previousSearchSessions),
      contactClicks: percentChange(
        conversions.reduce((sum, item) => sum + item.count, 0),
        previousContacts,
      ),
    },
    today,
    daily,
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
    changes: { sessions: 0, pageViews: 0, searchSessions: 0, contactClicks: 0 },
    today: {
      date: kstDateKey(new Date()),
      sessions: 0,
      views: 0,
      searchSessions: 0,
      contacts: 0,
    },
    daily: Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000);
      return {
        date: kstDateKey(date),
        sessions: 0,
        views: 0,
        searchSessions: 0,
        contacts: 0,
      };
    }),
    sources: [],
    queries: [],
    pages: [],
    devices: [],
    conversions: [],
  };
}
