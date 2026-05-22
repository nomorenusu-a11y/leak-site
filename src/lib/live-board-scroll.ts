/**
 * 무한 스크롤 LiveBoard용 풀 빌더.
 *
 * lifecycle.ts와 분리된 단순 모델:
 *   - DEMO_POOL 32건 전체를 노출 (lifecycle 필터링 없음)
 *   - 각 행에 시드 기반 birth_offset (10초 ~ 7일 사이) 부여 → 시간 표시 다양성
 *   - status는 birth_offset에 따라 자연스럽게 결정 (단순 transition)
 *   - timeVariant: 행마다 "relative" 또는 "absolute" 시드로 부여 → 시간 표시 섞임
 *
 * 결정성: 같은 (now KST 일자) → 같은 결과 (캐시 친화).
 * 다음 날: 다른 birth_offset → 다른 시간 표시.
 */

import { DEMO_POOL, type DemoCategory } from "@/data/live-board-demo";
import { cyrb53, kstDateKey } from "./live-board-rand";
import type { LeakRequestBoardItem, RequestStatus } from "@/types/database";

export type ScrollTimeVariant = "relative" | "absolute";

export type ScrollItem = LeakRequestBoardItem & {
  /** 더미 행에만 있음. 진짜 데이터는 undefined → "기타" 회색 배지. */
  category?: DemoCategory;
  /** 시간 표시 형식 — 행마다 다르게 (무한 스크롤 다양성) */
  time_variant: ScrollTimeVariant;
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// 시간 표시가 자연스럽게 분포되도록, birth_offset_ms 후보 구간 + 가중치
// 합 100. 각 구간은 [min_ms, max_ms].
const OFFSET_BUCKETS: Array<{ weight: number; min: number; max: number }> = [
  { weight: 8, min: 10_000, max: 50_000 },    // <1분  (방금/N초 전)
  { weight: 20, min: MIN, max: HOUR },         // <1시간 (N분 전)
  { weight: 25, min: HOUR, max: 12 * HOUR },   // <12시간 (N시간 전 / 오늘 HH:MM)
  { weight: 20, min: 12 * HOUR, max: DAY },    // 12~24h (오늘 HH:MM)
  { weight: 15, min: DAY, max: 2 * DAY },      // 24~48h (어제)
  { weight: 12, min: 2 * DAY, max: 7 * DAY },  // 2~7일 (M월 D일)
];

function pickBucket(hash: number) {
  const total = OFFSET_BUCKETS.reduce((a, b) => a + b.weight, 0);
  let pick = hash % total;
  for (const b of OFFSET_BUCKETS) {
    if (pick < b.weight) return b;
    pick -= b.weight;
  }
  return OFFSET_BUCKETS[OFFSET_BUCKETS.length - 1];
}

function statusForOffset(offsetMs: number): RequestStatus {
  // 시간이 흐를수록 done 비율 ↑. active(작업출동) 비중은 짧게 잡아 자연스러운 분포.
  // pending: <30분 / quote: <2시간 / active: <4시간 / done: 그 이상
  // → 대략 done 60% · pending 18% · quote 14% · active 7%
  if (offsetMs < 30 * MIN) return "pending";
  if (offsetMs < 2 * HOUR) return "quote";
  if (offsetMs < 4 * HOUR) return "active";
  return "done";
}

/**
 * DEMO_POOL 32건을 무한 스크롤용 ScrollItem[]로 변환.
 * 결정적: 같은 KST 일자 → 같은 결과.
 */
export function buildScrollPool(now: Date): ScrollItem[] {
  const seed = kstDateKey(now);
  const items: ScrollItem[] = [];

  for (const row of DEMO_POOL) {
    const h1 = cyrb53(`${seed}|${row.id}|offset`);
    const h2 = cyrb53(`${seed}|${row.id}|within`);
    const h3 = cyrb53(`${seed}|${row.id}|timev`);

    const bucket = pickBucket(h1);
    const range = bucket.max - bucket.min;
    const offsetMs = bucket.min + (h2 % range);

    const status = statusForOffset(offsetMs);
    const birth = new Date(now.getTime() - offsetMs);

    // updated_at은 birth와 같게 (단순 모델). 상태 전이 시각은 추적 X.
    items.push({
      id: row.id,
      masked_name: row.masked_name,
      region: row.region,
      status,
      created_at: birth.toISOString(),
      updated_at: birth.toISOString(),
      category: row.category,
      // 70% relative / 30% absolute
      time_variant: h3 % 10 < 7 ? "relative" : "absolute",
    });
  }

  // 최근(작은 offset)이 위로
  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return items;
}
