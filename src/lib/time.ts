/**
 * 한국어 상대 시간 표시. 클라이언트·서버 양쪽에서 동일하게 동작해야
 * hydration 깜빡임이 없다.
 */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function formatRelative(input: Date | string | number, now: Date = new Date()): string {
  const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return "방금";
  if (diff < MIN) return "방금";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  return formatDateYMD(d);
}

export function formatDateYMD(input: Date | string | number): string {
  const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
