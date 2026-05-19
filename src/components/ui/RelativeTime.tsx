"use client";

import { useSyncExternalStore } from "react";
import { formatRelative } from "@/lib/time";

/**
 * 1분 단위로 자동 갱신되는 한국어 상대 시간 표시.
 *
 * `useSyncExternalStore`로 setInterval을 외부 store 처럼 다뤄
 * useEffect 안 setState 패턴(eslint react-hooks/set-state-in-effect) 회피.
 *
 * SSR snapshot은 서버 Date.now(), client snapshot은 client Date.now() — 둘이 다를 수
 * 있어 hydration mismatch가 날 수 있으므로 `suppressHydrationWarning` 사용.
 */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

function nowSnapshot() {
  return Date.now();
}

export function RelativeTime({ date }: { date: string | Date }) {
  const now = useSyncExternalStore(subscribe, nowSnapshot, nowSnapshot);
  const dt = typeof date === "string" ? date : date.toISOString();
  const display = formatRelative(date, new Date(now));
  return (
    <time dateTime={dt} suppressHydrationWarning>
      {display}
    </time>
  );
}
