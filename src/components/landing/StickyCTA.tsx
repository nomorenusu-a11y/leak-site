import { PhoneButton, KakaoButton } from "./CtaButtons";

/**
 * 모바일 화면 하단 고정 CTA. md 이상에서는 숨김.
 * pb-[env(safe-area-inset-bottom)]로 iOS 홈 인디케이터 영역 보호.
 */
export function StickyCTA() {
  return (
    <div
      role="region"
      aria-label="빠른 상담"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        <PhoneButton block />
        <KakaoButton block />
      </div>
    </div>
  );
}
