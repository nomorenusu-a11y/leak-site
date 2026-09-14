import assert from "node:assert/strict";
import test from "node:test";
import { formatDateYMD } from "../src/lib/time";

test("published dates are displayed in Korea Standard Time", () => {
  assert.equal(formatDateYMD("2026-09-13T23:37:00.000Z"), "2026.09.14");
  assert.equal(formatDateYMD("2026-09-14T15:01:00.000Z"), "2026.09.15");
});
