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

const REAL_WORK_FALLBACKS = [
  "/about/rescue.png",
  "/about/dispatch.png",
  "/about/estimate.png",
];

/**
 * Hero v2 — 신뢰감 중심 단정한 디자인 (전면 재설계).
 *
 * 디자인 원칙:
 *   1) 시각 노이즈 최소화 — 마키 띠·플로팅 배지·conic 링·말풍선·스탬프 모두 제거
 *   2) 컬러 단순화 — 딥 네이비 + 단일 accent(코랄/오렌지) + 흰색
 *   3) 카피 구체화 — "100% 해결" 같은 추상적 약속 대신 "벽 뒤에 숨은 누수, 30분 안에 찾아냅니다"
 *   4) CTA 단순화 — Primary(채움 accent) + Secondary(외곽선) 2개만
 *   5) 마이크로 신뢰 — 하단 한 줄 4종 stat (출동·시공·A/S·운영시간)
 */
export async function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const supabase = createSupabaseAnonClient();

  // 배경 사진 — 진짜 작업 사진 우선, fallback으로 자체 /about/* 자산
  const { data: covers } = await supabase
    .from("posts")
    .select("cover_image_url")
    .eq("published", true)
    .not("cover_image_url", "is", null)
    .order("published_at", { ascending: false })
    .limit(3);
  const bgImages = (covers ?? [])
    .map((c) => c.cover_image_url)
    .filter((u): u is string => !!u);
  const heroPhotos =
    bgImages.length >= 2 ? bgImages : REAL_WORK_FALLBACKS.slice(0, 2);

  // LIVE 띠 — 최근 접수 1건 (subtle 표시)
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
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      {/* 배경: 진짜 작업 사진 카루셀 */}
      <div aria-hidden className="absolute inset-0 -z-30">
        {heroPhotos.map((url, i) => (
          <div
            key={url}
            className="hero-bg-slide absolute inset-0"
            style={{
              animationDelay: `${i * 5}s`,
              animationDuration: `${heroPhotos.length * 5}s`,
            }}
          >
            <div className="hero-ken-burns absolute inset-0">
              <Image
                src={url}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                unoptimized={url.startsWith("/")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 다크 네이비 오버레이 — 좌측 더 진하게 (텍스트 가독성), 우측 photo 살림 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-r from-brand-950/95 via-brand-950/80 to-brand-900/55"
      />
      {/* 모바일/태블릿은 추가 다크 — 전체 어두운 톤 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-brand-950/40 lg:hidden"
      />

      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* LIVE 띠 — 줄인 사이즈 */}
          {liveItem && (
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
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

          {/* 메인 헤드라인 — 구체적 약속 */}
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
            <span className="block text-white/85">
              {headlineLead}벽 뒤에 숨은 누수,
            </span>
            <span className="mt-2 block">
              <span className="text-cyan-300">30분 안에</span>{" "}
              <span className="text-white">찾아냅니다.</span>
            </span>
          </h1>

          {/* 서브 헤드라인 */}
          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            비파괴 정밀 장비로 벽·바닥 손상 없이 정확한 위치만 진단합니다.
          </p>

          {/* 마이크로 카피 */}
          <p className="mt-3 text-sm font-semibold text-white/65">
            서울·경기·인천 365일 24시간 출동 · 누적{" "}
            <CountUp to={100} duration={1400} suffix="건+" /> 시공
          </p>

          {/* 듀얼 CTA — Primary 채움 / Secondary 외곽선 */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-3.5">
            {phone ? (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 무료 진단 상담`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-extrabold text-white shadow-xl shadow-accent-500/30 transition-all hover:bg-accent-600 hover:shadow-2xl hover:shadow-accent-500/40 sm:text-[17px]"
              >
                <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                <span>무료 진단 상담 받기</span>
              </a>
            ) : (
              <Link
                href="#quote-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-base font-extrabold text-white shadow-xl shadow-accent-500/30 transition hover:bg-accent-600"
              >
                <span>무료 진단 상담 받기</span>
              </Link>
            )}
            <a
              href={BUSINESS.kakaoChatUrl}
              target="_blank"
              rel="noopener"
              aria-label="카카오톡으로 사진 견적 받기"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/15 sm:text-[17px]"
            >
              <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
              <span>사진으로 견적 받기</span>
            </a>
          </div>
        </div>

        {/* 하단 마이크로 신뢰 스트립 — 4종 stat */}
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 sm:mt-16 sm:grid-cols-4 sm:pt-8">
          {trustStrip.map(({ Icon, k, v }) => (
            <li key={k} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-300 ring-1 ring-inset ring-white/15">
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
