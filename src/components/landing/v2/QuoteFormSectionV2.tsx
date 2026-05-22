import { Container } from "@/components/ui/Container";
import { Phone } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { QuoteForm } from "../QuoteForm";

type Props = {
  utmSource?: string;
  utmCampaign?: string;
  cityCode?: string;
};

/**
 * 무료 견적 폼 (장인케어 IMG_1 톤).
 *
 * 헤더에 큰 전화 아이콘 + 번호 + 카피 → 그 아래 폼.
 * 전화 없으면 헤더의 전화 블록 미렌더 (폼만).
 */
export function QuoteFormSectionV2({ utmSource, utmCampaign, cityCode }: Props) {
  const phone = BUSINESS.contact.phone;
  return (
    <section
      id="quote-form"
      aria-labelledby="quote-form-title"
      className="scroll-mt-20 bg-slate-50 py-16 md:py-24"
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-wide text-brand-600">CONTACT</p>
            <h2
              id="quote-form-title"
              className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              상세 견적문의
            </h2>
            <p className="mt-3 text-slate-700">
              지금 바로 전문가와 무료 상담해보세요! 깔끔하고 확실하게 해결해드립니다.
            </p>

            {phone && (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 상담`}
                className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand-700">
                  <Phone className="size-6" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="text-left">
                  <span className="block text-xs font-bold uppercase tracking-wide text-white/80">
                    무료 전화상담
                  </span>
                  <span className="block text-xl font-black tracking-tight sm:text-2xl">
                    {phone.display}
                  </span>
                </span>
              </a>
            )}
          </div>

          <div className="mt-8">
            <QuoteForm
              utmSource={utmSource}
              utmCampaign={utmCampaign}
              cityCode={cityCode}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
