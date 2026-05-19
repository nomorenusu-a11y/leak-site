import { getContactInfo } from "@/lib/contact";
import { PhoneButton, KakaoButton, QuoteFallbackButton } from "./CtaButtons";

/**
 * 모바일 하단 sticky CTA. 환경변수 상태에 따라 1~2개 버튼 노출.
 * 둘 다 null이면 견적 폼 fallback.
 */
export function StickyCTA() {
  const { phone, kakao } = getContactInfo();
  const both = !!phone && !!kakao;
  const single = !!phone !== !!kakao;

  return (
    <div
      role="region"
      aria-label="빠른 상담"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className={`grid gap-2 p-3 ${both ? "grid-cols-2" : "grid-cols-1"}`}>
        {both ? (
          <>
            <PhoneButton block />
            <KakaoButton block />
          </>
        ) : single ? (
          <>
            {phone && <PhoneButton block />}
            {kakao && <KakaoButton block />}
          </>
        ) : (
          <QuoteFallbackButton block label="빠른 견적 신청" />
        )}
      </div>
    </div>
  );
}
