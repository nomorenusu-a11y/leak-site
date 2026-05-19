/**
 * GA4 이벤트 추적 통합 헬퍼.
 *
 * - `NEXT_PUBLIC_GA_ID`가 없거나 `/admin/*` 경로에서는 silent no-op
 * - 모든 GA 호출은 `trackEvent`만 사용해 한 곳에서 관리
 */

export const EVENTS = {
  CLICK_CALL: "click_call",
  CLICK_KAKAO: "click_kakao",
  CTA_CLICK: "cta_click",
  SUBMIT_QUOTE: "submit_quote",
  VIEW_POST: "view_post",
  FILTER_REGION: "filter_region",
  SCROLL_50: "scroll_50",
  SCROLL_90: "scroll_90",
  OUTBOUND_CLICK: "outbound_click",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function isAdminPath(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

export function trackEvent(name: EventName | string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", name, params ?? {});
}
