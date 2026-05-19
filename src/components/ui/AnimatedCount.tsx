"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * 숫자 카운트업 애니메이션. 뷰포트 진입 시 0 → value.
 * prefers-reduced-motion 활성이면 즉시 최종 값 표시.
 */
export function AnimatedCount({ value, suffix = "", duration = 1.2, className }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(reduce ? value : 0);
  const display = useTransform(mv, (v) => `${Math.round(v).toLocaleString("ko-KR")}${suffix}`);

  useEffect(() => {
    if (reduce) return;
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, mv, reduce, value, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
