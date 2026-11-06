/** Read public pages only; --apply persists checkpoints for the admin table. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import {
  POST_TRACKING_KEY,
  emptyPostTracking,
  isPublicPost,
  searchMatchesPost,
  mergeTrackingState,
  type TrackedPost,
  type PostTrackingState,
} from "../src/lib/post-tracking";
const keys = JSON.parse(
  execFileSync(
    "npx",
    [
      "supabase",
      "projects",
      "api-keys",
      "--project-ref",
      fs.readFileSync("supabase/.temp/project-ref", "utf8").trim(),
      "--output",
      "json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  keys.find((x: { name: string }) => x.name === "service_role").api_key,
  { auth: { persistSession: false } },
);
const apply = process.argv.includes("--apply");
const rows: TrackedPost[] = [];
for (let offset = 0; ; ) {
  const r = await db
    .from("posts")
    .select("id,slug,title,published,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("id")
    .range(offset, offset + 499);
  if (r.error) throw r.error;
  if (!r.data?.length) break;
  rows.push(...r.data);
  offset += r.data.length;
}
const now = new Date();
const publicPosts = rows.filter((p) => isPublicPost(p, now));
const s = await db.from("site_content").select("value").eq("key", POST_TRACKING_KEY).maybeSingle();
if (s.error) throw s.error;
let state: PostTrackingState = (s.data?.value as PostTrackingState) || emptyPostTracking();
async function saveCheckpoint() {
  const current = await db
    .from("site_content")
    .select("value")
    .eq("key", POST_TRACKING_KEY)
    .maybeSingle();
  if (current.error) throw current.error;
  if (current.data?.value)
    state = mergeTrackingState(current.data.value as PostTrackingState, state);
  const result = await db
    .from("site_content")
    .upsert({ key: POST_TRACKING_KEY, value: state }, { onConflict: "key" });
  if (result.error) throw result.error;
}
const before = JSON.parse(JSON.stringify(state));
const concurrency = Math.min(
  5,
  Math.max(1, Number(process.argv.find((x) => x.startsWith("--concurrency="))?.slice(14) || 3)),
);
const candidates = process.argv.includes("--resume")
  ? publicPosts.filter(
      (p) =>
        !state.checks[p.slug]?.checkedAt ||
        state.checks[p.slug]?.error ||
        state.checks[p.slug]?.status !== 200 ||
        state.checks[p.slug]?.canonicalInHead === false ||
        state.checks[p.slug]?.sitemap === false ||
        Date.parse(state.checks[p.slug].checkedAt!) < Date.now() - 86400000,
    )
  : publicPosts;
const limit = process.argv.includes("--all")
  ? candidates.length
  : Math.min(
      20,
      Math.max(1, Number(process.argv.find((x) => x.startsWith("--limit="))?.slice(8) || 20)),
    );
const queue = candidates.slice(0, limit);
console.log(
  `Candidates ${candidates.length}; checking ${queue.length}; use --all only for an intentional full audit`,
);
const sitemap = await fetch("https://nomorenusu.com/sitemap.xml", {
  signal: AbortSignal.timeout(20000),
});
if (!sitemap.ok) throw new Error("Sitemap unavailable");
const xml = await sitemap.text();
for (let offset = 0; offset < queue.length; offset += concurrency) {
  const batch = await Promise.all(
    queue.slice(offset, offset + concurrency).map(async (p) => {
      const prior = state.checks[p.slug] || { slug: p.slug };
      if (!isPublicPost(p, new Date())) throw new Error("Future URL refused");
      try {
        const r = await fetch("https://nomorenusu.com/posts/" + encodeURIComponent(p.slug), {
          headers: { "user-agent": "Nomorenusu-Public-Page-Check/1.0" },
          signal: AbortSignal.timeout(18000),
        });
        const h = await r.text();
        const index = h.search(/<link\b[^>]*rel=["']canonical["']/i);
        return {
          ...prior,
          checkedAt: new Date().toISOString(),
          status: r.status,
          sitemap: xml.includes(`/posts/${p.slug}</loc>`),
          canonicalInHead: index >= 0 && index < h.indexOf("</head>"),
          error: r.ok ? null : `HTTP ${r.status}`,
        };
      } catch (e) {
        return {
          ...prior,
          checkedAt: new Date().toISOString(),
          error: e instanceof Error ? e.message : "Page check failed",
        };
      }
    }),
  );
  for (const check of batch) {
    state.checks[check.slug] = check;
    state.history.push({
      at: check.checkedAt,
      slug: check.slug,
      kind: "page",
      result: check.error || `HTTP ${check.status} · 사이트맵 ${check.sitemap ? "포함" : "미포함"}`,
    });
  }
  if ((offset + concurrency) % 30 < concurrency || offset + concurrency >= queue.length) {
    state.updatedAt = new Date().toISOString();
    state.history = state.history.slice(-200);
    if (apply) {
      await saveCheckpoint();
    }
    console.log(
      `Checked ${publicPosts.length - queue.length + Math.min(offset + concurrency, queue.length)}/${publicPosts.length} public posts`,
    );
  }
}
const saved = await db
  .from("site_content")
  .select("value")
  .eq("key", "naver_search_visibility_v1")
  .maybeSingle();
const searches = saved.data?.value?.publicSearch;
if (searches?.checkedAt)
  for (const p of publicPosts) {
    const match = searches.checks.find(
      (c: any) => !c.error && searchMatchesPost(p.slug, c.matchedUrls),
    );
    if (match && !state.checks[p.slug]?.search)
      state.checks[p.slug] = {
        ...state.checks[p.slug],
        search: {
          keyword: match.keyword,
          checkedAt: searches.checkedAt,
          found: true,
          matchedUrls: match.matchedUrls,
          error: null,
        },
      };
  }
state.history = state.history.slice(-200);
state.updatedAt = new Date().toISOString();
if (apply) {
  await saveCheckpoint();
}
const report = {
  checkedAt: state.updatedAt,
  publicPosts: publicPosts.length,
  futureNotOpened: rows.length - publicPosts.length,
  normal: publicPosts.filter(
    (p) => state.checks[p.slug]?.status === 200 && !state.checks[p.slug]?.error,
  ).length,
  issues: publicPosts
    .filter(
      (p) =>
        state.checks[p.slug]?.error ||
        !state.checks[p.slug]?.sitemap ||
        !state.checks[p.slug]?.canonicalInHead,
    )
    .map((p) => ({ ...state.checks[p.slug] })),
};
fs.writeFileSync("/tmp/nomorenusu-full-post-tracking-before.json", JSON.stringify(before, null, 2));
fs.writeFileSync("/tmp/nomorenusu-full-post-tracking-result.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
