/**
 * LiveBoard 더미 시드 유틸 — lifecycle / selector 양쪽에서 공유.
 * 외부 의존 0. 결정성 보장 (같은 입력 → 같은 출력).
 */

/**
 * cyrb53 — 빠르고 안정적인 53-bit 문자열 해시. SO answer 기반 검증된 구현.
 * 같은 string이면 항상 같은 number를 돌려줌. 충돌은 사실상 무시 가능.
 */
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * mulberry32 — 32-bit 시드 기반 PRNG. 셔플용. 결정성 보장.
 * 반환 함수는 [0, 1) 범위의 number를 매번 다르게 돌려줌.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 배열을 시드 기반으로 셔플 (in-place 아님, 새 배열 반환) */
export function shuffleSeeded<T>(arr: readonly T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * KST 자정 기준 일자 키 ("2026-05-21"). 서버 / 클라이언트 시간대 무관.
 * 같은 KST 일자 안에서는 같은 키 → 같은 더미 노출 (캐시 친화).
 */
export function kstDateKey(now: Date): string {
  const kstMs = now.getTime() + KST_OFFSET_MS;
  const d = new Date(kstMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
