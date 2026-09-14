import assert from "node:assert/strict";
import test from "node:test";
import { buildGuideContent, WEEKLY_GUIDES } from "../src/lib/weekly-content-plan";

test("weekly plan contains five distinct guides per day", () => {
  assert.equal(WEEKLY_GUIDES.length, 35);
  assert.equal(new Set(WEEKLY_GUIDES.map((guide) => guide.slugKey)).size, 35);
  for (let day = 0; day < 7; day += 1) {
    const guides = WEEKLY_GUIDES.slice(day * 5, day * 5 + 5);
    assert.equal(guides.length, 5);
    assert.equal(new Set(guides.map((guide) => `${guide.district}-${guide.dong}-${guide.leak}`)).size, 5);
  }
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
