/**
 * LiveBoard 더미 생애주기 — 각 더미 행의 birth_time / status를 시드로 결정.
 *
 * 모델:
 *   - 풀의 각 행에 (dailySeed + row.id) 기반 birth_offset_minutes 부여
 *   - now - birth_offset_minutes = birth_time
 *   - birth_offset 으로 현재 status 결정 (pending → quote → active → done → 제외)
 *
 * 전이 시점은 행마다 약간씩 다름 — 같은 행이라도 시간이 흐르면 자연스럽게 진행.
 * 시드 + 행 ID로 결정적이라 같은 시점 = 같은 결과 (캐시 친화).
 */

import { cyrb53 } from "./live-board-rand";
import type { DemoRequest } from "@/data/live-board-demo";
import type { RequestStatus } from "@/types/database";

const LIFECYCLE_MIN = 5 * 24 * 60; // 5일 = 7200분

export type LiveRow = {
  id: string;
  masked_name: string;
  region: string;
  metro: DemoRequest["metro"];
  status: RequestStatus;
  birth_time: Date;
  updated_at: Date;
};

/**
 * 행 + 일자 시드에서 birth_offset_minutes 및 상태 전이 임계값 계산.
 * 결정적: 같은 (row, dailySeed) → 같은 결과.
 */
function computeOffsets(row: DemoRequest, dailySeed: string) {
  const h1 = cyrb53(`${dailySeed}|${row.id}|birth`);
  const h2 = cyrb53(`${dailySeed}|${row.id}|pending`);
  const h3 = cyrb53(`${dailySeed}|${row.id}|quote`);
  const h4 = cyrb53(`${dailySeed}|${row.id}|active`);

  // 0 ~ LIFECYCLE_MIN-1 사이 균등 분포. 풀 32건 × 균등 → 각 상태 구간에 자연 분포.
  const birth_offset_min = h1 % LIFECYCLE_MIN;

  // 전이 임계값 (행마다 약간씩 변동) — 단위 분
  // pending: 2~5h
  const pending_until = 120 + (h2 % 180);
  // quote: pending + 3~6h
  const quote_until = pending_until + 180 + (h3 % 180);
  // active: quote + 18~30h
  const active_until = quote_until + 1080 + (h4 % 720);
  // done: active_until ~ LIFECYCLE_MIN

  return { birth_offset_min, pending_until, quote_until, active_until };
}

/**
 * 행의 현재 상태와 birth_time을 계산. 생애주기 종료(> LIFECYCLE_MIN)면 null.
 *
 * @param row 풀 행
 * @param now 현재 시점
 * @param dailySeed KST 일자 키 ("2026-05-21")
 */
export function computeLiveRow(
  row: DemoRequest,
  now: Date,
  dailySeed: string,
): LiveRow | null {
  const { birth_offset_min, pending_until, quote_until, active_until } = computeOffsets(
    row,
    dailySeed,
  );

  if (birth_offset_min >= LIFECYCLE_MIN) return null;

  let status: RequestStatus;
  if (birth_offset_min < pending_until) status = "pending";
  else if (birth_offset_min < quote_until) status = "quote";
  else if (birth_offset_min < active_until) status = "active";
  else status = "done";

  const birth_time = new Date(now.getTime() - birth_offset_min * 60_000);

  // updated_at은 최종 상태 전이 시점으로 근사 — 진짜 데이터의 updated_at과 의미 일치
  let last_transition_min: number;
  if (status === "pending") last_transition_min = 0;
  else if (status === "quote") last_transition_min = pending_until;
  else if (status === "active") last_transition_min = quote_until;
  else last_transition_min = active_until;

  // updated_at = birth_time + 전이 시점까지 경과
  const updated_at = new Date(birth_time.getTime() + last_transition_min * 60_000);

  return {
    id: row.id,
    masked_name: row.masked_name,
    region: row.region,
    metro: row.metro,
    status,
    birth_time,
    updated_at,
  };
}

export { LIFECYCLE_MIN };
