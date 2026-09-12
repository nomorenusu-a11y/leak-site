import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRight, Bath, Camera, Crosshair, Droplets, MapPin,
  MessageCircle, Phone, ShieldCheck, Thermometer,
} from "@/components/icons";
import { BUSINESS } from "@/lib/business";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

const SYMPTOMS: Array<{
  no: string; title: string; description: string; check: string; Icon: IconType;
}> = [
  { no: "01", title: "천장에 번지는 물자국", description: "아랫집 천장이나 벽지가 젖어요.", check: "배관·방수 확인", Icon: Droplets },
  { no: "02", title: "멈추지 않는 수도계량기", description: "물을 안 써도 별침이 돌아가요.", check: "매립배관 확인", Icon: Crosshair },
  { no: "03", title: "계속 떨어지는 보일러 압력", description: "물을 보충해도 압력이 낮아져요.", check: "난방배관 확인", Icon: Thermometer },
  { no: "04", title: "젖어드는 욕실·싱크대", description: "바닥이나 하부장이 자꾸 젖어요.", check: "급수·배수 확인", Icon: Bath },
];

export async function TimeEmphasis() {
  const phone = BUSINESS.contact.phone;

  return (
    <section className="brand-grid overflow-hidden bg-[#061b35] text-white md:py-24">
      <Container className="max-w-6xl px-0 sm:px-6">
        <div className="grid overflow-hidden border-y border-white/10 bg-white/[0.06] shadow-[0_28px_90px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:border lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal variant="left" className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 px-6 py-12 sm:px-9 sm:py-10 lg:border-b-0 lg:border-r lg:px-11 lg:py-12">
            <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2.5 text-sm font-black tracking-[0.14em] text-cyan-300">
                  <Droplets aria-hidden className="size-5" strokeWidth={2.25} />
                  NO MORE NUSU
                </div>
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-cyan-300/40 to-transparent" />
              </div>

              <p className="mt-11 text-sm font-extrabold text-cyan-300">상담 전 증상 확인</p>
              <h2 className="mt-3 text-[2.65rem] font-black leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-[3.4rem]">
                누수는
                <span className="block">보이는 흔적부터</span>
                <span className="block text-cyan-300">확인합니다.</span>
              </h2>
              <p className="mt-7 text-[1.05rem] leading-8 text-blue-100 sm:text-lg">
                사진과 증상을 보내주세요.
                <strong className="block font-extrabold text-white">현장 방문 전, 확인할 범위를 안내합니다.</strong>
              </p>
            </div>

            <div className="relative mt-10 grid gap-3 border-t border-white/10 pt-6 text-[15px] font-bold text-blue-50 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2.5">
                <Camera aria-hidden className="size-5 text-cyan-300" />사진 한 장으로 사전 확인
              </span>
              <span className="inline-flex items-center gap-2.5">
                <MapPin aria-hidden className="size-5 text-cyan-300" />서울·경기·인천 전지역
              </span>
            </div>
          </Reveal>

          <div className="bg-white px-5 py-9 text-slate-950 sm:px-7 sm:py-8 lg:px-9 lg:py-10">
            <p className="text-sm font-extrabold text-brand-600">빠른 증상 확인</p>
            <h3 className="mt-1.5 text-[1.65rem] font-black leading-tight tracking-[-0.035em] sm:text-2xl">
              지금 어떤 흔적이 보이나요?
            </h3>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {SYMPTOMS.map(({ no, title, description, check, Icon }) => (
                <a
                  key={no}
                  href="#quote-form"
                  className="group grid min-h-[116px] grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_28px_rgba(15,45,85,0.06)] transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg md:min-h-[172px] md:grid-cols-[48px_1fr] md:items-start md:p-5"
                  aria-label={`${title}, 상담 신청으로 이동`}
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-600 ring-1 ring-brand-100 md:size-11">
                    <Icon aria-hidden className="size-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-[0.12em] text-brand-500">{no}</span>
                      <span aria-hidden className="h-px flex-1 bg-slate-200" />
                    </div>
                    <h4 className="mt-1.5 text-[17px] font-black leading-snug tracking-tight text-[#061b35] md:text-lg">{title}</h4>
                    <p className="mt-1 text-[13px] leading-5 text-slate-600 md:text-sm">{description}</p>
                    <span className="mt-2 hidden items-center gap-1 text-sm font-extrabold text-brand-600 md:inline-flex">
                      {check}<ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-brand-600 md:hidden">
                    <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-blue-50 px-4 py-4 text-[15px] leading-6 text-slate-700">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-600" strokeWidth={2} />
              <p>
                <strong className="block font-extrabold text-slate-950">증상만 보고 원인을 단정하지 않습니다.</strong>
                필요한 점검 순서부터 이해하기 쉽게 설명합니다.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a href={BUSINESS.kakaoChatUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#fee500] px-5 text-base font-black text-[#3c1e1e] transition hover:bg-[#f5dc00]">
                <MessageCircle aria-hidden className="size-5 fill-current" strokeWidth={2} />카카오톡 사진 상담
              </a>
              {phone && (
                <a href={`tel:${phone.tel}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#061b35] px-5 text-base font-black text-white transition hover:bg-brand-950">
                  <Phone aria-hidden className="size-5 text-cyan-300" strokeWidth={2.25} />바로 전화하기
                </a>
              )}
            </div>
            <p className="mt-3 text-center text-sm font-medium text-slate-500">상담 후 출동 여부를 결정하셔도 됩니다.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
