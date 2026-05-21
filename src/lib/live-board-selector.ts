/**
 * LiveBoard 더미 selector — 풀에서 노출할 6~8건을 시드로 결정.
 *
 * 입력: now (현재 시점), count (채울 슬롯 수 = 8 - 진짜 건수)
 * 출력: LeakRequestBoardItem[]  (진짜 데이터 타입과 호환)
 *
 * 알고리즘:
 *   1. KST 일자 시드 생성
 *   2. 풀 전체에 대해 lifecycle 계산 → 살아있는 후보만 추림
 *   3. 후보를 상태별로 그룹화
 *   4. 시드 셔플 후 분포 목표대로 뽑기 (pending 1, quote 1~2, active 1~2, done 3~4)
 *   5. 지역 중복 회피 (같은 시군구 1건 max, 같은 광역 3건 max)
 *   6. birth_time 내림차순 정렬
 *   7. LeakRequestBoardItem 형태로 매핑
 */

import { DEMO_POOL } from "@/data/live-board-demo";
import { computeLiveRow, type LiveRow } from "./live-board-lifecycle";
import { cyrb53, kstDateKey, mulberry32, shuffleSeeded } from "./live-board-rand";
import type { LeakRequestBoardItem, RequestStatus } from "@/types/database";

/** 분포 목표 (합 = 최대 8) */
const QUOTAS: Record<RequestStatus, { min: number; max: number }> = {
  pending: { min: 1, max: 1 },
  quote: { min: 1, max: 2 },
  active: { min: 1, max: 2 },
  done: { min: 3, max: 4 },
};

const MAX_PER_METRO = 3;

/**
 * 더미 6~8건 선택. count로 슬롯 수 제한 (8 - 진짜 건수).
 *
 * count <= 0 이면 빈 배열 반환.
 */
export function selectDemoItems(now: Date, count: number): LeakRequestBoardItem[] {
  if (count <= 0) return [];

  const seed = kstDateKey(now);
  const rand = mulberry32(cyrb53(seed) >>> 0);

  // 1. 살아있는 후보만 추림
  const alive: LiveRow[] = [];
  for (const row of DEMO_POOL) {
    const live = computeLiveRow(row, now, seed);
    if (live) alive.push(live);
  }

  // 2. 상태별 그룹화 + 시드 셔플
  const byStatus: Record<RequestStatus, LiveRow[]> = {
    pending: [],
    quote: [],
    active: [],
    done: [],
  };
  for (const r of alive) byStatus[r.status].push(r);
  for (const s of ["pending", "quote", "active", "done"] as RequestStatus[]) {
    byStatus[s] = shuffleSeeded(byStatus[s], rand);
  }

  // 3. 1차: 분포 목표 min 만큼 채움 (지역 중복 회피)
  const picked: LiveRow[] = [];
  const usedRegions = new Set<string>();
  const metroCounts = new Map<string, number>();

  function tryPick(row: LiveRow): boolean {
    if (usedRegions.has(row.region)) return false;
    const mc = metroCounts.get(row.metro) ?? 0;
    if (mc >= MAX_PER_METRO) return false;
    picked.push(row);
    usedRegions.add(row.region);
    metroCounts.set(row.metro, mc + 1);
    return true;
  }

  // pass 1: 각 상태 min 채우기
  for (const s of ["done", "active", "quote", "pending"] as RequestStatus[]) {
    let need = QUOTAS[s].min;
    for (const row of byStatus[s]) {
      if (picked.length >= count) break;
      if (need <= 0) break;
      if (tryPick(row)) need--;
    }
  }

  // pass 2: max까지 추가 (count 도달까지)
  for (const s of ["done", "active", "quote", "pending"] as RequestStatus[]) {
    if (picked.length >= count) break;
    const already = picked.filter((p) => p.status === s).length;
    let need = QUOTAS[s].max - already;
    for (const row of byStatus[s]) {
      if (picked.length >= count) break;
      if (need <= 0) break;
      if (picked.some((p) => p.id === row.id)) continue;
      if (tryPick(row)) need--;
    }
  }

  // pass 3: 분포 목표 무시하고 count 강제 채움 (지역 중복은 여전히 회피)
  if (picked.length < count) {
    const remaining = shuffleSeeded(
      alive.filter((r) => !picked.some((p) => p.id === r.id)),
      rand,
    );
    for (const row of remaining) {
      if (picked.length >= count) break;
      tryPick(row);
    }
  }

  // 4. birth_time 내림차순 정렬 (최근이 위로)
  picked.sort((a, b) => b.birth_time.getTime() - a.birth_time.getTime());

  // 5. LeakRequestBoardItem 형태로 매핑
  return picked.map((r) => ({
    id: r.id,
    masked_name: r.masked_name,
    region: r.region,
    status: r.status,
    created_at: r.birth_time.toISOString(),
    updated_at: r.updated_at.toISOString(),
  }));
}
