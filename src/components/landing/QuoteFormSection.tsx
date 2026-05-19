import { Container } from "@/components/ui/Container";
import { QuoteForm } from "./QuoteForm";

type Props = {
  utmSource?: string;
  utmCampaign?: string;
  cityCode?: string;
};

/**
 * 서버 측에서 searchParams를 받아 QuoteForm에 props로 흘려보내는 래퍼.
 * 폼은 ‘use client’지만 hidden 초기값은 SSR로 미리 채워지므로 hydration 깜빡임 없음.
 */
export function QuoteFormSection({ utmSource, utmCampaign, cityCode }: Props) {
  return (
    <section
      id="quote-form"
      aria-labelledby="quote-form-title"
      className="scroll-mt-20 bg-slate-50 py-12 sm:py-16"
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2 id="quote-form-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            무료 견적 신청
          </h2>
          <p className="mt-2 text-slate-600">
            증상과 사진을 보내주시면 가장 빠른 시간 안에 상담드립니다.
          </p>
          <div className="mt-6">
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
