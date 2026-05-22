"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  to: number;
  duration?: number;
  className?: string;
  /** 접미사. 예: "건+". */
  suffix?: string;
};

/**
 * 진입 시 0 → to까지 카운트업 (easeOutCubic).
 *
 * 측정 가능한 실제 데이터에만 사용 (가짜 숫자 X).
 * - threshold 0.4로 viewport 진입 시 트리거
 * - prefers-reduced-motion: 즉시 to 값 표시 (애니메이션 생략)
 */
export function CountUp({ to, duration = 1500, className, suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  // 진입 감지 + reduced-motion fallback
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // 다음 마이크로태스크에서 한 번에 to로 세팅 (effect 안 set 회피)
      const id = window.setTimeout(() => {
        setValue(to);
        setStarted(true);
      }, 0);
      return () => clearTimeout(id);
    }
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setStarted(true);
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  // 카운트업
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("ko-KR")}
      {suffix}
    </span>
  );
}
