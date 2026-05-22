"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "up" | "fade" | "scale" | "left" | "right";

type Props = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  /** intersection 진입 margin (px). 음수면 viewport 더 깊이 들어와야 트리거 */
  threshold?: number;
  className?: string;
};

const VARIANTS: Record<Variant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0 },
  },
};

/**
 * 스크롤 진입 시 한 번 트리거되는 모션 wrapper.
 *
 * - prefers-reduced-motion 자동 비활성
 * - viewport once: true (한 번만 재생)
 * - server component 안에서 wrap 가능 (children은 RSC OK)
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.55,
  threshold = -80,
  className,
}: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: `0px 0px ${threshold}px 0px` }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger 그룹용 — 자식들이 순차 등장.
 * 자식은 `<RevealItem>`이어야 함.
 */
export function RevealGroup({
  children,
  stagger = 0.08,
  threshold = -60,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  threshold?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: `0px 0px ${threshold}px 0px` }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  variant = "up",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={VARIANTS[variant]}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
