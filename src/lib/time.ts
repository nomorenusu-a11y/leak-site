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

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 자정 0시의 epoch ms. 같은 KST 일자 판정용. */
function kstStartOfDay(t: number): number {
  const local = t + KST_OFFSET_MS;
  const dayStart = local - (local % DAY);
  return dayStart - KST_OFFSET_MS;
}

/** KST 기준 "MM:DD" 또는 "HH:MM" 등을 만들기 위한 KST 시각 부품. */
function kstParts(t: number): {
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const d = new Date(t + KST_OFFSET_MS);
  return {
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/**
 * 무한 스크롤 LiveBoard용 시간 포맷터.
 *
 * variant === "relative":
 *   <30s → "방금"
 *   <1min → "N초 전"
 *   <1h → "N분 전"
 *   <12h → "N시간 전"
 *   24~48h (KST 어제) → "어제"
 *   else → "M월 D일"
 *
 * variant === "absolute":
 *   같은 KST 일자 → "오늘 HH:MM"
 *   KST 어제 → "어제 HH:MM"
 *   else → "M월 D일"
 *
 * @param input 행의 created_at
 * @param now 현재 시각 (테스트용 주입 가능)
 * @param variant 시각 표현 형태
 */
export function formatScrollTime(
  input: Date | string | number,
  now: Date = new Date(),
  variant: "relative" | "absolute" = "relative",
): string {
  const d =
    typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  const diff = now.getTime() - d.getTime();
  const todayStart = kstStartOfDay(now.getTime());
  const yesterdayStart = todayStart - DAY;

  if (variant === "absolute") {
    const tMs = d.getTime();
    const parts = kstParts(tMs);
    const hh = String(parts.hour).padStart(2, "0");
    const mm = String(parts.minute).padStart(2, "0");
    if (tMs >= todayStart) return `오늘 ${hh}:${mm}`;
    if (tMs >= yesterdayStart) return `어제 ${hh}:${mm}`;
    return `${parts.month}월 ${parts.day}일`;
  }

  // relative
  if (diff < 30_000) return "방금";
  if (diff < MIN) return `${Math.floor(diff / 1_000)}초 전`;
  if (diff < HOUR) return `${Math.floor(diff / MIN)}분 전`;
  if (diff < 12 * HOUR) return `${Math.floor(diff / HOUR)}시간 전`;
  if (d.getTime() >= yesterdayStart && d.getTime() < todayStart) return "어제";
  const parts = kstParts(d.getTime());
  return `${parts.month}월 ${parts.day}일`;
}
