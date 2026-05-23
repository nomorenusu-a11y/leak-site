import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  Phone,
  ChevronDown,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Zap,
  Check,
} from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { buildScrollPool } from "@/lib/live-board-scroll";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollTime } from "@/components/ui/ScrollTime";

/**
 * Hero v2 — 시선 강탈판.
 *
 * 시각 자극 레이어:
 *   - 배경 사진 카루셀 + brand 그라데이션 + 떨어지는 물방울 + 바닥 ripple
 *   - 가로 흐름 EMERGENCY 마키 띠 (상단 풀폭)
 *   - 신뢰 배지 3종 (브랜드 yellow 아이콘)
 *   - LIVE 빨강 깜빡임 (최근 접수 1건)
 *   - 거대 헤드라인 + "100% 해결" gradient + 노란 highlighter bar + glow
 *   - 이중 CTA: highlight CTA에 노란 펄스 ring 2중
 *   - 우측 인물 사진 conic gradient spin ring + 4 floating 배지 wobble
 *   - 누적 시공 카운터 (yellow gradient 박스 강조)
 *   - SVG sparkle 4종 (좌상/우상/좌하/우하)
 */
export async function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const headlineLead = cityLabel ? `${cityLabel} 누수,` : "누수,";

  const supabase = createSupabaseAnonClient();
  const { data: covers } = await supabase
    .from("posts")
    .select("cover_image_url")
    .eq("published", true)
    .not("cover_image_url", "is", null)
    .order("published_at", { ascending: false })
    .limit(4);
  const bgImages = (covers ?? [])
    .map((c) => c.cover_image_url)
    .filter((u): u is string => !!u);

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

  const drops = [
    { left: "8%", delay: "0s", duration: "3.4s" },
    { left: "18%", delay: "1.2s", duration: "4.1s" },
    { left: "28%", delay: "0.6s", duration: "3.7s" },
    { left: "42%", delay: "2.2s", duration: "3.9s" },
    { left: "58%", delay: "0.9s", duration: "4.3s" },
    { left: "72%", delay: "1.8s", duration: "3.5s" },
    { left: "84%", delay: "0.3s", duration: "4.0s" },
    { left: "92%", delay: "2.6s", duration: "3.8s" },
  ];

  const credentials = [
    { Icon: MapPin, label: "서울·경기·인천" },
    { Icon: Clock, label: "365일 24시간" },
    { Icon: ShieldCheck, label: "A/S 1년 보장" },
  ];

  // 마키에 반복할 문구 — 6개 → 2회 복제로 seamless loop
  const marqueeItems = [
    "🚨 긴급출동",
    "365일 24시간",
    "30분 이내 도착",
    "비용 0원 보장",
    "1년 무상 A/S",
    "외주·신입 파견 없음",
  ];

  // 우측 인물 floating 뱃지
  const floatingBadges = [
    {
      pos: "absolute -left-4 top-6",
      cls: "hero-wobble-l bg-white text-brand-700",
      content: (
        <>
          <Star
            aria-hidden
            className="size-4 fill-amber-400 text-amber-400"
            strokeWidth={1}
          />
          <span>
            <span className="block text-base font-black leading-none">4.9</span>
            <span className="block text-[10px] font-bold">고객 만족</span>
          </span>
        </>
      ),
    },
    {
      pos: "absolute -right-3 top-14",
      cls: "hero-wobble-r bg-highlight-400 text-brand-900",
      content: (
        <>
          <span className="text-lg font-black leading-none">100%</span>
          <span className="text-[10px] font-extrabold">해결 약속</span>
        </>
      ),
    },
    {
      pos: "absolute -left-2 bottom-10",
      cls: "hero-wobble-l bg-rose-500 text-white",
      content: (
        <>
          <Zap
            aria-hidden
            className="size-3.5"
            strokeWidth={2.5}
          />
          <span className="text-[11px] font-extrabold leading-tight">
            30분 내<br />
            현장 도착
          </span>
        </>
      ),
    },
    {
      pos: "absolute -right-4 bottom-2",
      cls: "hero-wobble-r bg-white text-brand-700",
      content: (
        <>
          <ShieldCheck
            aria-hidden
            className="size-4 text-brand-600"
            strokeWidth={2.5}
          />
          <span className="text-[11px] font-extrabold leading-tight">
            1년<br />
            무상 A/S
          </span>
        </>
      ),
    },
  ];

  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* 배경 카루셀 */}
      <div aria-hidden className="absolute inset-0 -z-30">
        {bgImages.length > 0 ? (
          bgImages.map((url, i) => (
            <div
              key={url}
              className="hero-bg-slide absolute inset-0"
              style={{
                animationDelay: `${i * 4}s`,
                animationDuration: `${bgImages.length * 4}s`,
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
                />
              </div>
            </div>
          ))
        ) : (
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-800/95 via-brand-700/92 to-brand-900/95"
      />
      {/* 우상단 light 블롭 */}
      <div
        aria-hidden
        className="absolute -right-32 -top-24 -z-10 size-[28rem] rounded-full bg-highlight-400/20 blur-3xl"
      />
      {/* 좌하단 cyan 블롭 */}
      <div
        aria-hidden
        className="absolute -left-32 bottom-0 -z-10 size-[24rem] rounded-full bg-cyan-400/15 blur-3xl"
      />
      {/* 떨어지는 물방울 + ripple */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {drops.map((d, i) => (
          <span
            key={`drop-${i}`}
            className="hero-drop"
            style={{
              left: d.left,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
        {drops.map((d, i) => (
          <span
            key={`ripple-${i}`}
            className="hero-ripple"
            style={{
              left: d.left,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
      </div>
      {/* Sparkle SVG 4종 */}
      <Sparkle className="left-[6%] top-[14%] size-6 text-highlight-300" delay="0s" />
      <Sparkle className="left-[42%] top-[8%] size-4 text-cyan-200" delay="1.4s" />
      <Sparkle className="right-[10%] top-[22%] size-5 text-highlight-300" delay="0.7s" />
      <Sparkle className="left-[14%] bottom-[18%] size-4 text-cyan-200" delay="2s" />

      {/* 상단 마키 띠 — EMERGENCY 흐름 */}
      <div
        aria-hidden
        className="border-y border-rose-500/40 bg-rose-600/80 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg backdrop-blur-sm sm:text-xs"
      >
        <div className="flex overflow-hidden">
          <ul className="hero-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
            {[...marqueeItems, ...marqueeItems].map((m, i) => (
              <li key={i} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-highlight-300" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Container className="relative py-10 sm:py-14 lg:py-20">
        {/* 상단 신뢰 배지 행 */}
        <ul className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8 sm:gap-3">
          {credentials.map(({ Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ring-white/25 backdrop-blur-sm sm:text-xs"
            >
              <Icon
                aria-hidden
                className="size-3.5 text-highlight-300"
                strokeWidth={2.5}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        {/* 모바일 전용 — 컷아웃 인물 + 라디얼 글로우 + floating 배지 (lg 미만 노출) */}
        <div className="relative mx-auto mb-7 h-72 w-full max-w-sm lg:hidden">
          {/* 라디얼 글로우 — 인물 뒤에서 빛이 퍼지는 듯한 효과 */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(253,224,71,0.55) 0%, rgba(103,232,249,0.3) 28%, rgba(0,0,0,0) 55%)",
              filter: "blur(8px)",
            }}
          />
          {/* 회전 그라데이션 원 */}
          <div
            aria-hidden
            className="hero-spin-ring absolute left-1/2 top-1/2 -z-10 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{
              background:
                "conic-gradient(from 0deg, #fde047, #67e8f9, #facc15, #fde047)",
              filter: "blur(12px)",
            }}
          />
          {/* 컷아웃 인물 — 프레임 없이 자연스럽게 떠 있는 형태 */}
          <Image
            src="/about/worker-cutout.png"
            alt="누수탐지 전문 상담사"
            width={520}
            height={520}
            priority
            className="relative mx-auto h-full w-auto object-contain drop-shadow-[0_18px_28px_rgba(8,32,80,0.45)]"
          />
          {/* 좌상단 ⭐4.9 */}
          <span className="hero-wobble-l absolute left-0 top-2 inline-flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-brand-700 shadow-xl ring-2 ring-white/60">
            <Star
              aria-hidden
              className="size-4 fill-amber-400 text-amber-400"
              strokeWidth={1}
            />
            <span>
              <span className="block text-base font-black leading-none">4.9</span>
              <span className="block text-[10px] font-bold">고객 만족</span>
            </span>
          </span>
          {/* 우상단 100% */}
          <span className="hero-wobble-r absolute right-0 top-2 inline-flex items-center gap-1.5 rounded-2xl bg-highlight-400 px-3 py-2 text-brand-900 shadow-xl ring-2 ring-white/60">
            <span className="text-lg font-black leading-none">100%</span>
            <span className="text-[10px] font-extrabold">해결 약속</span>
          </span>
          {/* 좌하단 30분 */}
          <span className="hero-wobble-l absolute bottom-2 left-0 inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 px-3 py-2 text-white shadow-xl ring-2 ring-white/60">
            <Zap aria-hidden className="size-3.5" strokeWidth={2.5} />
            <span className="text-[11px] font-extrabold leading-tight">
              30분 내
              <br />
              현장 도착
            </span>
          </span>
          {/* 우하단 1년 A/S */}
          <span className="hero-wobble-r absolute bottom-2 right-0 inline-flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-brand-700 shadow-xl ring-2 ring-white/60">
            <ShieldCheck
              aria-hidden
              className="size-4 text-brand-600"
              strokeWidth={2.5}
            />
            <span className="text-[11px] font-extrabold leading-tight">
              1년
              <br />
              무상 A/S
            </span>
          </span>
        </div>

        {/* 모바일 강조 stamp — 헤드라인 위, 빨강 rotated */}
        <div className="mb-3 inline-flex rotate-[-6deg] items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-black uppercase tracking-wide text-white shadow-lg ring-2 ring-white/40 sm:text-base lg:hidden">
          <Zap aria-hidden className="size-4" strokeWidth={2.75} />
          <span>긴급 출동 가능!</span>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* 좌측 — 카피 */}
          <div>
            {liveItem && (
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-rose-400/40 backdrop-blur-sm sm:text-sm">
                <span aria-hidden className="live-dot text-rose-300" />
                <span className="live-blink font-extrabold uppercase tracking-wide text-rose-100">
                  LIVE
                </span>
                <span aria-hidden className="text-white/40">·</span>
                <span className="truncate">
                  <ScrollTime date={liveItem.created_at} variant="relative" />
                  {liveItem.region ? ` · ${liveItem.region}` : ""}{" "}
                  <span className="font-bold">
                    {liveItem.masked_name || "고객"}
                  </span>
                  님 접수
                </span>
              </div>
            )}

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_24px_rgba(8,32,80,0.45)] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="block text-white/95">{headlineLead}</span>
              <span className="relative mt-1 inline-block">
                {/* 노란 highlighter bar — text 뒤에 깔리는 굵은 막대 */}
                <span
                  aria-hidden
                  className="hero-highlight-bar absolute inset-x-0 bottom-2 -z-10 block h-[0.45em] rounded-md bg-highlight-400/85 sm:bottom-3 sm:h-[0.4em]"
                />
                <span className="relative bg-gradient-to-r from-highlight-300 via-cyan-200 to-cyan-400 bg-clip-text pb-2 text-transparent drop-shadow-[0_2px_8px_rgba(252,211,77,0.4)]">
                  100% 해결
                </span>
              </span>
              <span className="mt-1 block text-3xl font-extrabold text-white/90 sm:text-4xl lg:text-5xl">
                해드립니다.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base font-semibold text-white/85 sm:text-lg">
              지금 전화 한 통이면 충분합니다. 사진과 함께 증상을 보내주시면,
              현장 도착 전부터 진단 방향을 잡아 빠르게 해결해드립니다.
            </p>

            {/* 이중 CTA */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
              {phone && (
                <a
                  href={`tel:${phone.tel}`}
                  aria-label={`전화 ${phone.display}로 상담`}
                  className="cta-pulse-ring group relative isolate flex items-center justify-center gap-2.5 rounded-2xl bg-highlight-400 px-6 py-4 text-base font-extrabold text-brand-900 shadow-xl shadow-highlight-500/40 ring-2 ring-white/30 transition hover:bg-highlight-300 hover:scale-[1.02] sm:text-lg"
                >
                  <Phone
                    aria-hidden
                    className="size-5 sm:size-6"
                    strokeWidth={2.5}
                  />
                  <span>{phone.display}</span>
                </a>
              )}
              <a
                href={BUSINESS.kakaoChatUrl}
                target="_blank"
                rel="noopener"
                aria-label="카카오톡 상담 새 창으로 열기"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/15 px-6 py-4 text-base font-extrabold text-white ring-1 ring-inset ring-white/30 backdrop-blur transition hover:bg-white/25 hover:scale-[1.02] sm:text-lg"
              >
                <KakaoLogo aria-hidden className="size-6" />
                <span>카카오톡 상담</span>
              </a>
            </div>

            {/* 누적 카운터 — 강조 박스 */}
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-highlight-400 to-amber-400 px-5 py-3 shadow-lg shadow-highlight-500/30">
              <Check
                aria-hidden
                className="size-5 text-brand-900"
                strokeWidth={3}
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
                누적 시공
              </span>
              <span className="text-2xl font-black tracking-tight text-brand-900 sm:text-3xl">
                <CountUp to={100} duration={1400} suffix="건+" />
              </span>
            </div>
          </div>

          {/* 우측 — 컷아웃 인물 + 라디얼 글로우 + 4 floating 배지 */}
          <div className="relative hidden h-[32rem] lg:block">
            {/* 라디얼 글로우 — 인물 뒤 빛의 후광 */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 55%, rgba(253,224,71,0.55) 0%, rgba(103,232,249,0.3) 30%, rgba(0,0,0,0) 60%)",
                filter: "blur(12px)",
              }}
            />
            {/* 회전 그라데이션 원 — 후광 강화 */}
            <div
              aria-hidden
              className="hero-spin-ring absolute left-1/2 top-1/2 -z-10 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
              style={{
                background:
                  "conic-gradient(from 0deg, #fde047, #67e8f9, #facc15, #fde047)",
                filter: "blur(16px)",
              }}
            />
            {/* 바닥 그림자 — 인물이 떠있지 않게 */}
            <div
              aria-hidden
              className="absolute bottom-4 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-full bg-black/30 blur-xl"
            />
            {/* 컷아웃 인물 */}
            <Image
              src="/about/worker-cutout.png"
              alt="누수탐지 전문 상담사"
              width={620}
              height={620}
              priority
              className="relative mx-auto h-full w-auto object-contain drop-shadow-[0_24px_36px_rgba(8,32,80,0.55)]"
            />
            {/* 4 floating 배지 */}
            {floatingBadges.map((b, i) => (
              <span
                key={i}
                className={`${b.pos} inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 shadow-xl ring-2 ring-white/40 ${b.cls}`}
              >
                {b.content}
              </span>
            ))}
            {/* 말풍선 — "지금 바로 전화하세요!" */}
            <div className="absolute right-6 top-1/2 -translate-y-12 rotate-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-2 ring-highlight-300/70">
              <p className="whitespace-nowrap text-xs font-black uppercase tracking-wider text-brand-600">
                지금 바로
              </p>
              <p className="whitespace-nowrap text-base font-black tracking-tight text-brand-900">
                전화하세요!
              </p>
              {/* 말풍선 꼬리 */}
              <span
                aria-hidden
                className="absolute -bottom-2 left-6 size-4 rotate-45 bg-white shadow-[2px_2px_0_rgba(253,224,71,0.7)]"
              />
            </div>
            {/* 하단 안내 칩 */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-900 px-4 py-2 text-center shadow-xl ring-2 ring-highlight-300/60">
              <p className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider text-highlight-300">
                전문가 직접 출동
              </p>
            </div>
          </div>
        </div>

        {/* 스크롤 유도 */}
        <Link
          href="#live-board"
          aria-label="실시간 작업현황으로 스크롤"
          className="mt-10 hidden flex-col items-center gap-0.5 text-white/90 hover:text-white sm:flex"
        >
          <span className="text-xs font-semibold tracking-wide">
            ↓ 시공사례 보기
          </span>
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
