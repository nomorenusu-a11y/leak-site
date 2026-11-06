import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNovemberPlan,
  validateNovemberPlan,
  NOVEMBER_TOPICS,
} from "../src/lib/november-content-plan";

test("November reservations are future-only, daily 10–12, unique and framed as advice", () => {
  const now = new Date("2026-11-06T02:30:00Z");
  const plan = buildNovemberPlan({ startDate: "2026-11-06", endDate: "2026-11-30", now });
  assert.deepEqual(validateNovemberPlan(plan, now), []);
  const days = new Map<string, typeof plan>();
  for (const post of plan) days.set(post.date, [...(days.get(post.date) || []), post]);
  assert.equal(days.size, 25);
  for (const [date, posts] of days) {
    assert.ok(posts.length >= 10 && posts.length <= 12, date);
    for (const p of posts) {
      assert.equal(
        new Date(+new Date(p.published_at) + 9 * 3600000).toISOString().slice(0, 10),
        date,
      );
      assert.ok(+new Date(p.published_at) > +now);
      assert.match(p.content, /점검/);
      assert.match(p.content, /서울·경기·인천 전 지역/);
      assert.doesNotMatch(p.title, /생김 때|반복됨 확인/);
    }
  }
  assert.equal(new Set(plan.map((p) => p.topicKey)).size, NOVEMBER_TOPICS.length);
  assert.equal(new Set(plan.map((p) => p.title)).size, plan.length);
});

test("Existing calendar counts are preserved and no past day is backfilled", () => {
  const now = new Date("2026-11-06T02:30:00Z");
  const existing = Array.from({ length: 10 }, (_, i) => ({
    slug: `kept-${i}`,
    title: `기존 글 ${i}`,
    published_at: `2026-11-06T${String(i + 3).padStart(2, "0")}:00:00Z`,
  }));
  const plan = buildNovemberPlan({ startDate: "2026-11-06", endDate: "2026-11-30", now, existing });
  assert.ok(plan.every((p) => p.date !== "2026-11-06"));
  assert.ok(plan.every((p) => p.slug.startsWith("202611")));
  assert.throws(
    () =>
      buildNovemberPlan({
        startDate: "2026-11-06",
        endDate: "2026-11-30",
        now: new Date("2026-11-06T14:00:00Z"),
      }),
    /No future publishing window/,
  );
});
