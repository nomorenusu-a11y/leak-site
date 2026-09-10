/**
 * 단순 메모리 rate limiter. 같은 Node 프로세스 내에서만 동작.
 *
 * production multi-instance(Vercel 등)에서는 Vercel KV / Upstash Redis 같은
 * 분산 store로 옮길 것. 로그인 시도 제한 정도는 메모리로도 실용적.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  /** allowed=false일 때만, 다음 요청까지 권장 대기 시간(초) */
  retryAfterSeconds: number;
};

/**
 * 현재 제한 상태만 확인한다. 성공한 로그인까지 실패 횟수로 기록하지 않기 위해
 * 인증 전에는 이 함수를 사용하고, 비밀번호가 틀린 경우에만 hit()을 호출한다.
 */
export function check(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (bucket) buckets.delete(key);
    return { allowed: true, remaining: limit, resetAt: now, retryAfterSeconds: 0 };
  }
  const allowed = bucket.count < limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/**
 * @param key      식별자 (IP 등)
 * @param limit    윈도우 내 최대 허용 횟수
 * @param windowMs 윈도우 길이 (ms)
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: fresh.resetAt,
      retryAfterSeconds: 0,
    };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
}

/** 테스트용 — 단일 키 또는 전체 버킷 초기화 */
export function reset(key?: string) {
  if (key === undefined) buckets.clear();
  else buckets.delete(key);
}
