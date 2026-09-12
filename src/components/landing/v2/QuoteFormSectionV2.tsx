import { Container } from "@/components/ui/Container";
import { Phone, Check } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { QuoteForm } from "../QuoteForm";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  utmSource?: string;
  utmCampaign?: string;
  cityCode?: string;
};

const PROMISES = [
  "30분 이내 회신",
  "현장 출동 전 사진 견적",
  "1년 무상 A/S",
];

/**
 * 상세 견적문의 폼 — 풋터 직전 강조 섹션.
 *
 * brand 그라데이션 배너 + 상단 약속 3종 + 전화 큰 카드 + 폼.
 * 안내문: "지금 바로 전문가와 무료 상담해보세요! / 깔끔하고 확실하게 해결해드립니다."
 */
export function QuoteFormSectionV2({
  utmSource,
  utmCampaign,
  cityCode,
}: Props) {
  const phone = BUSINESS.contact.phone;
  return (
    <section
      id="quote-form"
      aria-labelledby="quote-form-title"
      className="brand-grid scroll-mt-20 bg-[#04172e] py-16 text-white md:py-24"
    >
      <Container>
        <div className="mx-auto max-w-3xl">
          <Reveal variant="up" className="text-center">
            <p className="section-kicker section-kicker-dark">
              CONTACT
            </p>
            <h2
              id="quote-form-title"
              className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              지금 바로{" "}
              <span className="text-cyan-300">
                무료 상담
              </span>
              해보세요!
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
              사진과 증상을 보내주세요.<br className="sm:hidden" /> 확인할 범위부터 먼저 안내해드립니다.
            </p>

            {/* 약속 3종 */}
            <ul className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-slate-200">
              {PROMISES.map((p) => (
                <li key={p} className="inline-flex items-center gap-1">
                  <Check
                    aria-hidden
                    className="size-4 text-cyan-300"
                    strokeWidth={2.75}
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            {/* 큰 전화 카드 */}
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 상담`}
                className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 text-[#04172e] shadow-xl shadow-cyan-500/20 transition-colors hover:bg-cyan-300"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-[#04172e] text-cyan-300 sm:size-14">
                  <Phone className="size-6 sm:size-7" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-left">
                  <span className="block text-xs font-bold uppercase tracking-wide text-[#04172e]/70">
                    무료 전화상담
                  </span>
                  <span className="block text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
                    {phone.display}
                  </span>
                </span>
              </a>
            )}
          </Reveal>

          <Reveal variant="up" delay={0.1} className="mt-10">
            <div className="rounded-[1.75rem] bg-white p-1 shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <div className="rounded-[1.4rem] bg-white p-2 sm:p-4">
                <QuoteForm
                  utmSource={utmSource}
                  utmCampaign={utmCampaign}
                  cityCode={cityCode}
                />
              </div>
            </div>
          </Reveal>

          <p className="mt-5 text-center text-xs text-slate-400">
            * 접수 후 영업일 기준 30분 이내 전화 또는 카톡으로 회신드립니다.
          </p>
        </div>
      </Container>
    </section>
  );
}
