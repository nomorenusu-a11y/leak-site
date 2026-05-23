import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Phone, ChevronDown, MapPin, Clock, ShieldCheck } from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { buildScrollPool } from "@/lib/live-board-scroll";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollTime } from "@/components/ui/ScrollTime";

/**
 * Hero v2 — 임팩트 강화판.
 *
 * 구조:
 *   1) 상단 신뢰 배지 (출동 지역·24시간·AS 보장)
 *   2) 좌측: LIVE 띠 → 거대 헤드라인(핵심어 yellow→cyan 그라데이션) → 이중 CTA(전화·카톡)
 *   3) 우측: 작업자 인물 사진(public/about/consult.png)
 *   4) 하단: 누적 시공 카운터 + 스크롤 유도
 *
 * 배경: 진짜 작업 사진 카루셀(있으면) + brand-700 그라데이션 + 떨어지는 물방울.
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

  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* 배경 */}
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
      <div
        aria-hidden
        className="absolute -right-32 -top-24 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl"
      />
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

        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* 좌측 — 카피 */}
          <div>
            {/* LIVE 띠 */}
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

            {/* 메인 헤드라인 */}
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight drop-shadow-md sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="block text-white/95">{headlineLead}</span>
              <span className="mt-1 block bg-gradient-to-r from-highlight-300 via-cyan-200 to-cyan-400 bg-clip-text pb-2 text-transparent">
                100% 해결
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
                  className="group flex items-center justify-center gap-2.5 rounded-2xl bg-highlight-400 px-6 py-4 text-base font-extrabold text-brand-900 shadow-xl shadow-highlight-500/30 transition hover:bg-highlight-300 sm:text-lg"
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
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/15 px-6 py-4 text-base font-extrabold text-white ring-1 ring-inset ring-white/30 backdrop-blur transition hover:bg-white/25 sm:text-lg"
              >
                <KakaoLogo aria-hidden className="size-6" />
                <span>카카오톡 상담</span>
              </a>
            </div>

            {/* 누적 카운터 */}
            <div className="mt-7 inline-flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                누적 시공
              </span>
              <span className="text-2xl font-black tracking-tight text-highlight-300 sm:text-3xl">
                <CountUp to={100} duration={1400} suffix="건+" />
              </span>
            </div>
          </div>

          {/* 우측 — 작업자 인물 */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-highlight-300/20 via-cyan-400/10 to-brand-400/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/20">
              <Image
                src="/about/consult.png"
                alt="작업복을 입고 전문 상담 중인 누수탐지 전문가"
                width={520}
                height={520}
                priority
                className="aspect-square w-full object-cover"
              />
            </div>
            {/* 사진 위 작은 신뢰 배지 */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                전문가 직접 출동
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                외주·신입 파견 없음
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
