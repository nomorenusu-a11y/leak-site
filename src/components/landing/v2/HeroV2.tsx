import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ChevronDown,
  Clock,
  ShieldCheck,
  MessageCircle,
  Star,
} from "@/components/icons";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { buildScrollPool } from "@/lib/live-board-scroll";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollTime } from "@/components/ui/ScrollTime";
import { HeroCarouselClient } from "./HeroCarouselClient";
import { HeroQuickForm } from "./HeroQuickForm";

const HERO_SLIDES = [
  {
    src: "/hero/01-greet.png",
    alt: "전문가의 손길로 완벽하게 해결하는 유레카설비 & 누수탐지",
  },
  {
    src: "/hero/02-detect.png",
    alt: "집요하게 찾아내는 보이지 않는 문제, 진정한 전문가의 기술",
  },
  {
    src: "/hero/03-precise.png",
    alt: "작은 균열까지 타협 없는 정밀 탐지 — 지하 배관 작업 현장",
  },
  {
    src: "/hero/04-tech.png",
    alt: "첨단 기술로 실시간 시각화하는 정밀 누수 탐지",
  },
  {
    src: "/hero/05-scene.png",
    alt: "전문 장비와 디지털 모니터링으로 정확한 누수 진단",
  },
];

/**
 * Hero v2 — 8:2 풀블리드 캐러셀 + 좁은 사이드 빠른 문의폼.
 *
 * PC:  좌 80% 캐러셀(풀블리드) / 우 20% 빠른 문의폼 — 둘 다 hero를 꽉채움
 * 모바일: 캐러셀 위(자연 aspect-[15/7]) → 빠른 문의폼 아래 (full width)
 *
 * 캐러셀: 3.5s 크로스페이드 자동 슬라이드, 풀블리드(rounded/shadow 없음)
 * 폼: 좁은 column에 맞춘 컴팩트 — 이름·연락처·동의 3요소, hidden symptom 자동
 */
export async function HeroV2(_props: { cityLabel?: string }) {
  const supabase = createSupabaseAnonClient();

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
    <section className="relative isolate overflow-hidden bg-slate-900 text-white">
      {/* 슬라이딩 그라데이션 배경 — 하단 trust strip 영역만 보임 */}
      <div aria-hidden className="hero-sliding-bg absolute inset-0 -z-30" />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-b from-brand-950/30 via-transparent to-brand-950/55"
      />

      {/* LIVE 띠 — 캐러셀 위 */}
      <Container className="relative pt-6 sm:pt-8">
        {liveItem && (
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
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
      </Container>

      {/* 메인 그리드 — full bleed, 8:2 PC */}
      <div className="relative mt-4 grid grid-cols-1 items-stretch lg:mt-6 lg:grid-cols-[4fr_1fr]">
        <HeroCarouselClient slides={HERO_SLIDES} intervalMs={3500} />
        <HeroQuickForm />
      </div>

      {/* 하단 마이크로 trust strip */}
      <Container className="relative pb-10 pt-6 sm:pt-8">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-4 sm:pt-8">
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

        <Link
          href="#live-board"
          aria-label="실시간 작업현황으로 스크롤"
          className="mt-8 hidden flex-col items-center gap-0.5 text-white/60 hover:text-white sm:flex"
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
