import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGuideContent,
  buildGuideExcerpt,
  buildGuideTitle,
  CAMPAIGN_GUIDES,
  DAILY_PUBLISH_COUNTS,
  DAILY_PUBLISH_TIMES,
  getPublishSlot,
  getOctoberPilotPublishSlot,
  getScheduledContentType,
  OCTOBER_PILOT_DAILY_TIMES,
  OCTOBER_PILOT_GUIDES,
  SCHEDULED_CONTENT_TYPE_LABELS,
  validateGuideDraft,
} from "../src/lib/weekly-content-plan";

test("September campaign preserves existing slots and fills September 19–30 to ten daily", () => {
  assert.equal(CAMPAIGN_GUIDES.length, 153);
  assert.equal(new Set(CAMPAIGN_GUIDES.map((guide) => guide.slugKey)).size, 153);
  assert.equal(
    DAILY_PUBLISH_COUNTS.reduce((sum, count) => sum + count, 0),
    153,
  );
  assert.deepEqual(DAILY_PUBLISH_COUNTS.slice(0, 5), [7, 6, 8, 5, 7]);
  assert.ok(DAILY_PUBLISH_COUNTS.slice(5).every((count) => count === 10));
  assert.ok(DAILY_PUBLISH_TIMES.every((times) => new Set(times).size === times.length));
  const slots = CAMPAIGN_GUIDES.map((_, index) => getPublishSlot(index));
  assert.deepEqual(getPublishSlot(0), { dayIndex: 0, time: "08:37" });
  assert.deepEqual(getPublishSlot(110), { dayIndex: 16, time: "22:59" });
  for (const [dayIndex, count] of DAILY_PUBLISH_COUNTS.entries()) {
    const times = slots.filter((slot) => slot.dayIndex === dayIndex).map((slot) => slot.time);
    assert.equal(times.length, count);
    assert.equal(new Set(times).size, count);
  }
});

test("scheduled guides are useful, clearly framed advice rather than invented cases", () => {
  const seenTypes = new Set<string>();
  for (const [index, guide] of CAMPAIGN_GUIDES.entries()) {
    const type = getScheduledContentType(index);
    const title = buildGuideTitle(guide, type);
    const excerpt = buildGuideExcerpt(guide, type);
    const content = buildGuideContent(guide, type);
    seenTypes.add(type);
    assert.deepEqual(
      validateGuideDraft({ guide, type, title, excerpt, content }),
      [],
      `${guide.slugKey} failed quality validation`,
    );
    assert.match(content, /자주 묻는 질문/);
    assert.match(content, /이 증상은 확인을 미루지 마세요/);
    assert.match(content, /전화 전에 30초만 준비해 주세요/);
    assert.match(content, /서울·경기·인천 전 지역/);
    assert.ok(content.includes(guide.location));
    assert.ok(content.includes(guide.check));
    assert.ok(content.includes(guide.repair));
    assert.doesNotMatch(content, /시공 사례|해결했습니다|방문했습니다/);
  }
  assert.deepEqual([...seenTypes].sort(), Object.keys(SCHEDULED_CONTENT_TYPE_LABELS).sort());
});

test("October 1–15 campaign schedules 10–12 distinct guides per day", () => {
  assert.equal(OCTOBER_PILOT_GUIDES.length, 165);
  assert.deepEqual(
    OCTOBER_PILOT_DAILY_TIMES.map((times) => times.length),
    [10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 11, 12],
  );
  assert.equal(new Set(OCTOBER_PILOT_GUIDES.map((guide) => guide.slugKey)).size, 165);
  assert.equal(
    new Set(
      OCTOBER_PILOT_GUIDES.map(
        (guide) => `${guide.district}|${guide.dong}|${guide.leak}|${guide.symptom}`,
      ),
    ).size,
    165,
  );

  const septemberKeys = new Set(
    CAMPAIGN_GUIDES.map(
      (guide) => `${guide.district}|${guide.dong}|${guide.leak}|${guide.symptom}`,
    ),
  );
  for (const guide of OCTOBER_PILOT_GUIDES) {
    assert.equal(
      septemberKeys.has(`${guide.district}|${guide.dong}|${guide.leak}|${guide.symptom}`),
      false,
      `${guide.slugKey} duplicates a September region and symptom combination`,
    );
  }

  const slots = OCTOBER_PILOT_GUIDES.map((guide, index) => {
    const slot = getOctoberPilotPublishSlot(index);
    const type = getScheduledContentType(index + CAMPAIGN_GUIDES.length);
    const title = buildGuideTitle(guide, type);
    const excerpt = buildGuideExcerpt(guide, type);
    const content = buildGuideContent(guide, type);
    assert.deepEqual(
      validateGuideDraft({ guide, type, title, excerpt, content }),
      [],
      `${guide.slugKey} failed quality validation`,
    );
    return slot;
  });

  for (const [dayIndex, times] of OCTOBER_PILOT_DAILY_TIMES.entries()) {
    const scheduled = slots.filter((slot) => slot.dayIndex === dayIndex).map((slot) => slot.time);
    assert.equal(scheduled.length, times.length);
    assert.equal(new Set(scheduled).size, times.length);
  }
});
