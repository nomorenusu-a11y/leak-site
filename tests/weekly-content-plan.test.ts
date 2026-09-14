import assert from "node:assert/strict";
import test from "node:test";
import { buildGuideContent, DAILY_PUBLISH_COUNTS, DAILY_PUBLISH_TIMES, WEEKLY_GUIDES } from "../src/lib/weekly-content-plan";

test("weekly plan contains five to ten guides at varied times each day", () => {
  assert.equal(WEEKLY_GUIDES.length, 49);
  assert.equal(new Set(WEEKLY_GUIDES.map((guide) => guide.slugKey)).size, 49);
  assert.equal(DAILY_PUBLISH_COUNTS.reduce((sum, count) => sum + count, 0), 49);
  assert.ok(DAILY_PUBLISH_COUNTS.every((count) => count >= 5 && count <= 10));
  assert.ok(new Set(DAILY_PUBLISH_COUNTS).size > 1);
  assert.equal(new Set(DAILY_PUBLISH_TIMES.flat()).size, 49);
});

test("scheduled guides are useful, clearly framed advice rather than invented cases", () => {
  for (const guide of WEEKLY_GUIDES) {
    const content = buildGuideContent(guide);
    assert.ok(content.length > 1200, `${guide.slugKey} content is too short`);
    assert.match(content, /자주 묻는 질문/);
    assert.match(content, /서울·경기·인천 전 지역/);
    assert.doesNotMatch(content, /시공 사례|해결했습니다|방문했습니다/);
  }
});
