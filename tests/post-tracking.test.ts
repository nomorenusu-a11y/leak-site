import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregatePostTraffic,
  selectCheckBatch,
  searchMatchesPost,
  emptyPostTracking,
  mergeTrackingState,
  type TrackedPost,
  type TrafficEvent,
} from "../src/lib/post-tracking";
test("Bulk page checks preserve a newer search result and manual refresh time", () => {
  const older = emptyPostTracking();
  const newer = emptyPostTracking();
  older.checks.one = { slug: "one", checkedAt: "2026-11-06T00:00:00Z", status: 200 };
  newer.lastAdminRefreshAt = "2026-11-06T01:00:00Z";
  newer.cooldownUntil = "2026-11-06T07:00:00Z";
  newer.checks.one = {
    slug: "one",
    search: {
      keyword: "검색어",
      checkedAt: "2026-11-06T01:00:00Z",
      found: false,
      matchedUrls: [],
      error: "네이버 응답 403",
    },
  };
  const merged = mergeTrackingState(newer, older);
  assert.equal(merged.checks.one.status, 200);
  assert.equal(merged.checks.one.search?.error, "네이버 응답 403");
  assert.equal(merged.lastAdminRefreshAt, newer.lastAdminRefreshAt);
  assert.equal(merged.cooldownUntil, newer.cooldownUntil);
});

test("Tracking never selects future or unpublished posts and rotates through unchecked public posts", () => {
  const now = new Date("2026-11-06T03:00:00Z");
  const posts: TrackedPost[] = [
    { id: "1", slug: "old", title: "기존", published: true, published_at: "2026-10-01T00:00:00Z" },
    {
      id: "2",
      slug: "future",
      title: "예약",
      published: true,
      published_at: "2026-11-07T00:00:00Z",
    },
    {
      id: "3",
      slug: "draft",
      title: "초안",
      published: false,
      published_at: "2026-10-01T00:00:00Z",
    },
    { id: "4", slug: "new", title: "신규", published: true, published_at: "2026-11-05T00:00:00Z" },
  ];
  const state = emptyPostTracking();
  assert.deepEqual(
    selectCheckBatch(posts, state, "page", 10, now).map((x) => x.slug),
    ["new", "old"],
  );
  state.checks.new = { slug: "new", checkedAt: now.toISOString() };
  assert.equal(selectCheckBatch(posts, state, "page", 1, now)[0].slug, "old");
  assert.equal(selectCheckBatch(posts, state, "search", 1, now)[0].slug, "new");
});
test("A homepage match is not proof of the target article being found", () => {
  assert.equal(searchMatchesPost("test", ["https://nomorenusu.com/"]), false);
  assert.equal(searchMatchesPost("test", ["https://evil.example/posts/test"]), false);
  assert.equal(searchMatchesPost("test", ["https://nomorenusu.com/posts/testing"]), false);
  assert.equal(searchMatchesPost("test", ["https://nomorenusu.com/posts/test?photo=1"]), true);
});
test("Per-post metrics separate calls and Kakao, attribute quote actions and omit test traffic", () => {
  const base: TrafficEvent = {
    created_at: "2026-11-06T00:00:00Z",
    session_id: "session-1",
    event_name: "page_view",
    path: "/posts/test?photo=1",
    source: "naver",
    is_search: true,
    metadata: {},
  };
  const rows: TrafficEvent[] = [
    base,
    { ...base, event_name: "click_call" },
    { ...base, event_name: "click_post_cta", metadata: { button_type: "kakao" } },
    { ...base, path: "/", event_name: "submit_quote", metadata: { slug: "test" } },
    { ...base, session_id: "internal", metadata: { test: true } },
    { ...base, path: "/admin/posts" },
  ];
  assert.deepEqual(aggregatePostTraffic(rows).test, {
    views: 1,
    searchViews: 1,
    naverViews: 1,
    sessions: 1,
    phone: 1,
    kakao: 1,
    quote: 1,
    other: 0,
  });
});
