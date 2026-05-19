"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Check, X, AlertCircle } from "@/components/icons";

type Variant = "success" | "error" | "info";

const VARIANT: Record<Variant, { bg: string; ring: string; icon: typeof Check }> = {
  success: { bg: "bg-emerald-600", ring: "ring-emerald-700/20", icon: Check },
  error: { bg: "bg-rose-600", ring: "ring-rose-700/20", icon: AlertCircle },
  info: { bg: "bg-brand-600", ring: "ring-brand-700/20", icon: AlertCircle },
};

type Props = {
  open: boolean;
  variant?: Variant;
  message: string;
  onClose?: () => void;
  /** 자동 닫힘 ms. 0 또는 음수면 자동 닫힘 없음. */
  autoCloseMs?: number;
};

/**
 * 단순 토스트 알림. framer-motion 슬라이드 + fade.
 * 자체 구현 (react-hot-toast 등 외부 의존성 없음).
 */
export function Toast({
  open,
  variant = "success",
  message,
  onClose,
  autoCloseMs = 4000,
}: Props) {
  const { bg, ring, icon: Icon } = VARIANT[variant];

  useEffect(() => {
    if (!open || autoCloseMs <= 0 || !onClose) return;
    const id = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(id);
  }, [open, autoCloseMs, onClose]);

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ${bg} ${ring}`}
          >
            <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2.5} />
            <span className="flex-1">{message}</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="-mr-1 rounded p-1 hover:bg-white/10"
              >
                <X aria-hidden className="size-4" strokeWidth={2.5} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
