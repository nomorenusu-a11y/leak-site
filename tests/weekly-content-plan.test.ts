import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGuideContent,
  CAMPAIGN_GUIDES,
  DAILY_PUBLISH_COUNTS,
  DAILY_PUBLISH_TIMES,
  getPublishSlot,
} from "../src/lib/weekly-content-plan";

test("September campaign contains five to ten guides at varied times each day", () => {
  assert.equal(CAMPAIGN_GUIDES.length, 111);
  assert.equal(new Set(CAMPAIGN_GUIDES.map((guide) => guide.slugKey)).size, 111);
  assert.equal(
    DAILY_PUBLISH_COUNTS.reduce((sum, count) => sum + count, 0),
    111,
  );
  assert.ok(DAILY_PUBLISH_COUNTS.every((count) => count >= 5 && count <= 10));
  assert.ok(new Set(DAILY_PUBLISH_COUNTS).size > 1);
  assert.ok(DAILY_PUBLISH_TIMES.every((times) => new Set(times).size === times.length));
  const slots = CAMPAIGN_GUIDES.map((_, index) => getPublishSlot(index));
  assert.deepEqual(
    slots.map((slot) => slot.dayIndex),
    DAILY_PUBLISH_COUNTS.flatMap((count, day) => Array.from({ length: count }, () => day)),
  );
  assert.equal(slots[0].time, "08:37");
  assert.equal(slots.at(-1)?.time, "22:59");
});

test("scheduled guides are useful, clearly framed advice rather than invented cases", () => {
  for (const guide of CAMPAIGN_GUIDES) {
    const content = buildGuideContent(guide);
    assert.ok(content.length > 1450, `${guide.slugKey} content is too short`);
    assert.match(content, /자주 묻는 질문/);
    assert.match(content, /이 증상은 확인을 미루지 마세요/);
    assert.match(content, /전화 전에 30초만 준비해 주세요/);
    assert.match(content, /서울·경기·인천 전 지역/);
    assert.ok(content.includes(guide.location));
    assert.ok(content.includes(guide.check));
    assert.ok(content.includes(guide.repair));
    assert.doesNotMatch(content, /시공 사례|해결했습니다|방문했습니다/);
  }
});
