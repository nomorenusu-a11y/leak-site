import { Container } from "@/components/ui/Container";
import { Phone } from "@/components/icons";
import { BUSINESS } from "@/lib/business";

/**
 * 긴급출동 큰 번호 배너 (장인케어 IMG_8 톤).
 *
 * 진한 브랜드 파랑 + 노란색 번호 + 전체 클릭 영역 tel: 링크.
 * 전화번호가 설정돼 있을 때만 노출 (없으면 미렌더).
 */
export function EmergencyBanner() {
  const phone = BUSINESS.contact.phone;
  if (!phone) return null;

  return (
    <section className="bg-brand-800">
      <Container className="py-10 sm:py-12">
        <a
          href={`tel:${phone.tel}`}
          aria-label={`긴급출동 요청 ${phone.display}로 전화`}
          className="group flex flex-col items-center gap-4 text-center text-white"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold tracking-wide text-white ring-1 ring-inset ring-white/30">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent-400" />
            긴급출동 요청
          </span>
          <span className="flex size-20 items-center justify-center rounded-full bg-white text-brand-700 shadow-lg shadow-black/20 transition-transform group-hover:scale-105 sm:size-24">
            <Phone className="size-10 sm:size-12" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="text-4xl font-black tracking-tight text-[#FFE600] sm:text-5xl lg:text-6xl">
            {phone.display}
          </span>
          <span className="text-sm font-semibold text-white/90 sm:text-base">
            터치 시 바로 전화로 연결됩니다
          </span>
        </a>
      </Container>
    </section>
  );
}
