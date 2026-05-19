"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * 페이지 스크롤 50%/90% 도달을 한 번씩 발사.
 * 경로 바뀌면 상태 리셋.
 */
export function ScrollTracker() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let fired50 = false;
    let fired90 = false;

    function compute(): number {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return 100; // 짧은 페이지
      return Math.min(100, Math.round((scrollTop / docHeight) * 100));
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const pct = compute();
        if (!fired50 && pct >= 50) {
          fired50 = true;
          trackEvent(EVENTS.SCROLL_50, { pathname });
        }
        if (!fired90 && pct >= 90) {
          fired90 = true;
          trackEvent(EVENTS.SCROLL_90, { pathname });
          // 둘 다 발사 끝 → 리스너 해제
          window.removeEventListener("scroll", onScroll);
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
