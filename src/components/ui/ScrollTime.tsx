"use client";

import { useSyncExternalStore } from "react";
import { formatScrollTime } from "@/lib/time";

/**
 * 무한 스크롤 LiveBoard용 시간 표시 — 1분 단위 자동 갱신.
 * RelativeTime과 유사하지만 variant 옵션이 있어 행마다 다른 형식 가능.
 */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

function nowSnapshot() {
  return Date.now();
}

export function ScrollTime({
  date,
  variant,
}: {
  date: string | Date;
  variant: "relative" | "absolute";
}) {
  const now = useSyncExternalStore(subscribe, nowSnapshot, nowSnapshot);
  const dt = typeof date === "string" ? date : date.toISOString();
  const display = formatScrollTime(date, new Date(now), variant);
  return (
    <time dateTime={dt} suppressHydrationWarning>
      {display}
    </time>
  );
}
