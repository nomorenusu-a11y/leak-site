import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  Phone,
  ChevronDown,
  Clock,
  ShieldCheck,
  MessageCircle,
  Star,
} from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { buildScrollPool } from "@/lib/live-board-scroll";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollTime } from "@/components/ui/ScrollTime";

/**
 * Hero v2 — 좌 텍스트 / 우 컷아웃 인물 + 슬라이딩 그라데이션 배경.
 *
 * 레이아웃:
 *   PC: grid 2 columns — 좌측(텍스트·CTA) / 우측(컷아웃 인물 + 글로우)
 *   모바일: 단일 컬럼 — 텍스트 → CTA → 컷아웃 인물
 *
 * 배경: cyan↔navy 그라데이션이 좌측으로 무한 슬라이드 (hero-sliding-bg, 16s)
 * 키워드: hero-sliding-text 클래스로 텍스트 그라데이션 좌→우 흐름
 */
export async function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const supabase = createSupabaseAnonClient();

  // LIVE 띠 — 최근 접수 1건
  const { data: realRows } = await supabase
    .from("leak_requests")
    .select("masked_name, region, created_at")
    .order("created_at", { ascending: false })
    .limit(1);
  let liveItem: {
    masked_name: string;
    region: string | null;
    created_at: string;
  } | null = null;
  if (realRows && realRows.length > 0) {
    liveItem = realRows[0];
  } else {
    const pool = buildScrollPool(new Date());
    if (pool.length > 0) {
      liveItem = {
        masked_name: pool[0].masked_name,
        region: pool[0].region,
        created_at: pool[0].created_at,
      };
    }
  }

  const headlineLead = cityLabel ? `${cityLabel} ` : "";

  const trustStrip = [
    { Icon: Clock, k: "평균 출동", v: "30분 내" },
    { Icon: ShieldCheck, k: "보장", v: "1년 무상 A/S" },
    {
      Icon: Star,
      k: "누적 시공",
      v: <CountUp to={100} duration={1400} suffix="건+" />,
    },
    { Icon: MessageCircle, k: "상담", v: "365일 24시간" },
  ];

  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* 슬라이딩 그라데이션 배경 (cyan↔navy 좌측 흐름) */}
      <div aria-hidden className="hero-sliding-bg absolute inset-0 -z-30" />
      {/* 좌측 가독성 보강 — 좌측 더 진하게 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-r from-brand-950/55 via-brand-900/25 to-transparent"
      />
      {/* 데코 sparkle SVG (모서리) */}
      <Sparkle className="left-6 top-6 size-5 text-white/70" delay="0s" />
      <Sparkle className="right-[28%] top-12 size-4 text-cyan-200/80" delay="1.4s" />
      <Sparkle className="left-[38%] bottom-16 size-4 text-yellow-200/70" delay="0.7s" />

      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          {/* 좌측 — 카피·CTA */}
          <div>
            {/* 후킹 한 줄 */}
            <p className="text-sm font-bold text-cyan-200 sm:text-base">
              ✨ 수도권 전지역 어디라도 누수 문제는?
            </p>

            {/* LIVE 띠 — 작게 */}
            {liveItem && (
              <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                <span aria-hidden className="live-dot text-rose-400" />
                <span className="font-bold uppercase tracking-wider text-rose-200">
                  LIVE
                </span>
                <span aria-hidden className="text-white/30">·</span>
                <span className="truncate">
                  <ScrollTime date={liveItem.created_at} variant="relative" />
                  {liveItem.region ? ` · ${liveItem.region}` : ""}{" "}
                  <span className="font-semibold">
                    {liveItem.masked_name || "고객"}
                  </span>
                  님 접수
                </span>
              </div>
            )}

            {/* 메인 헤드라인 */}
            <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
              <span className="block text-white">
                {headlineLead}벽 뒤에 숨은 누수,
              </span>
              <span className="mt-2 block">
                <span className="hero-sliding-text font-black">
                  30분 안에 찾아냅니다.
                </span>
              </span>
            </h1>

            {/* 서브 헤드라인 */}
            <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg">
              비파괴 정밀 장비로 벽·바닥 손상 없이 정확한 위치만 진단합니다.
            </p>
            <p className="mt-2 text-sm font-semibold text-white/70">
              서울·경기·인천 365일 24시간 출동 · 누적{" "}
              <CountUp to={100} duration={1400} suffix="건+" /> 시공
            </p>

            {/* 듀얼 CTA — 강조 2개 */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3.5">
              {phone ? (
                <a
                  href={`tel:${phone.tel}`}
                  aria-label={`전화 ${phone.display}로 무료 진단 상담`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-accent-500/30 transition-all hover:bg-accent-600 hover:shadow-2xl hover:shadow-accent-500/40 sm:text-lg"
                >
                  <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                  <span>무료 진단 상담 받기</span>
                </a>
              ) : (
                <Link
                  href="#quote-form"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-accent-500/30 hover:bg-accent-600 sm:text-lg"
                >
                  <span>무료 진단 상담 받기</span>
                </Link>
              )}
              <a
                href={BUSINESS.kakaoChatUrl}
                target="_blank"
                rel="noopener"
                aria-label="카카오톡으로 사진 견적 받기"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-highlight-400 px-6 py-4 text-base font-extrabold text-brand-900 shadow-xl shadow-highlight-500/25 transition-all hover:bg-highlight-300 hover:shadow-2xl sm:text-lg"
              >
                <MessageCircle aria-hidden className="size-5" strokeWidth={2.5} />
                <span>사진으로 견적 받기</span>
              </a>
            </div>
          </div>

          {/* 우측 — 컷아웃 인물 + 라디얼 글로우 */}
          <div className="relative mx-auto h-72 w-full max-w-sm sm:h-96 sm:max-w-md lg:h-[30rem] lg:max-w-none">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 55%, rgba(253,224,71,0.4) 0%, rgba(103,232,249,0.25) 32%, rgba(0,0,0,0) 65%)",
                filter: "blur(10px)",
              }}
            />
            <div
              aria-hidden
              className="absolute bottom-3 left-1/2 h-5 w-3/4 -translate-x-1/2 rounded-full bg-black/30 blur-xl"
            />
            <Image
              src="/about/worker-cutout.png"
              alt="누수탐지 전문 상담사"
              width={620}
              height={620}
              priority
              className="relative mx-auto h-full w-auto object-contain drop-shadow-[0_22px_36px_rgba(8,32,80,0.5)]"
            />
          </div>
        </div>

        {/* 하단 마이크로 trust strip */}
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 sm:mt-14 sm:grid-cols-4 sm:pt-8">
          {trustStrip.map(({ Icon, k, v }) => (
            <li key={k} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-200 ring-1 ring-inset ring-white/15">
                <Icon aria-hidden className="size-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/55">
                  {k}
                </p>
                <p className="truncate text-sm font-extrabold text-white sm:text-base">
                  {v}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* 스크롤 유도 */}
        <Link
          href="#live-board"
          aria-label="실시간 작업현황으로 스크롤"
          className="mt-10 hidden flex-col items-center gap-0.5 text-white/60 hover:text-white sm:flex"
        >
          <span className="text-xs font-semibold tracking-wide">↓ 시공사례 보기</span>
          <ChevronDown
            className="scroll-bounce size-5"
            strokeWidth={2.25}
            aria-hidden
          />
        </Link>
      </Container>
    </section>
  );
}

/** 작은 8각형 별 SVG — sparkle 효과 */
function Sparkle({
  className,
  delay,
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`hero-sparkle pointer-events-none absolute -z-10 ${className ?? ""}`}
      style={delay ? { animationDelay: delay } : undefined}
      fill="currentColor"
    >
      <path d="M12 0 L13.5 9 L24 12 L13.5 15 L12 24 L10.5 15 L0 12 L10.5 9 Z" />
    </svg>
  );
}
