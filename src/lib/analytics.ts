/**
 * GA4 이벤트 추적 통합 헬퍼.
 *
 * - 자체 통계는 GA 설정과 무관하게 수집
 * - GA가 연결된 경우 같은 이벤트를 GA에도 전달
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
  CLICK_POST_CTA: "click_post_cta",
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
  void import("@/lib/traffic-analytics").then(({ recordTrafficEvent }) =>
    recordTrafficEvent(name, params ?? {}),
  );
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", name, params ?? {});
}
