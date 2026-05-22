import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Phone, ChevronDown } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { buildScrollPool } from "@/lib/live-board-scroll";
import { CountUp } from "@/components/ui/CountUp";
import { ScrollTime } from "@/components/ui/ScrollTime";
import { QuoteFallbackButton } from "../CtaButtons";

/**
 * Hero v2 — 시선 끄는 다층 애니메이션.
 *
 * 시선 끄는 장치:
 *   1) 4장 카테고리 대표 사진 4초 페이드 카루셀 + Ken Burns 슬로우 줌(폭 ↑)
 *   2) 떨어지는 물방울 8개 + 바닥 ripple 파동 8개 (각 drop과 동기화)
 *   3) 헤드라인 위에 LIVE 띠 — 가장 최근 작업 1건 노출 (사회적 증거)
 *   4) 카피 2단 로테이트 ("천장에서 물이 떨어지고 계신가요?" ↔ "30분 안에 도착합니다")
 *   5) 시공사례 누적 카운트업 (실제 DB 값 — 측정 가능한 숫자만)
 *   6) 전화 아이콘 ring/ping/박스섀도 펄스 3중 + ring 흔들림
 *   7) 하단 스크롤 유도 화살표 통통 ("↓ 시공사례 보기")
 *
 * Hierarchy:
 *   배지 → LIVE 띠 → 카피 로테이터 → 메인 헤드라인 → 전화 카드 → 카운터/스크롤
 *   체크리스트·디스클레이머 제거 → 첫 화면 800px 안에 깔끔히.
 *
 * prefers-reduced-motion: globals.css 패치로 모두 0.001ms 정지.
 */
export async function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const headline = cityLabel ? `${cityLabel} 누수 · 시공 빠르게 해결` : "누수 · 시공 빠르게 해결";

  const supabase = createSupabaseAnonClient();

  // 배경 카루셀용 4장
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

  // 시공사례 카운트 (실제 published 개수)
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  const totalCases = postCount ?? 0;

  // LIVE 띠 — 가장 최근 보드 아이템 1건 (진짜 → 더미 fallback)
  const { data: realRows } = await supabase
    .from("leak_requests")
    .select("masked_name, region, created_at")
    .order("created_at", { ascending: false })
    .limit(1);
  let liveItem: { masked_name: string; region: string | null; created_at: string } | null = null;
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

  // 물방울 + ripple 위치 (deterministic — hydration mismatch 방지)
  const drops = [
    { left: "8%",  delay: "0s",   duration: "3.4s" },
    { left: "18%", delay: "1.2s", duration: "4.1s" },
    { left: "28%", delay: "0.6s", duration: "3.7s" },
    { left: "42%", delay: "2.2s", duration: "3.9s" },
    { left: "58%", delay: "0.9s", duration: "4.3s" },
    { left: "72%", delay: "1.8s", duration: "3.5s" },
    { left: "84%", delay: "0.3s", duration: "4.0s" },
    { left: "92%", delay: "2.6s", duration: "3.8s" },
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
      {/* 브랜드 파랑 그라데이션 오버레이 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-700/92 via-brand-600/88 to-brand-800/92"
      />
      {/* 우상단 light 블롭 */}
      <div
        aria-hidden
        className="absolute -right-32 -top-24 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl"
      />
      {/* 떨어지는 물방울 + 바닥 ripple */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {drops.map((d, i) => (
          <span
            key={`drop-${i}`}
            className="hero-drop"
            style={{ left: d.left, animationDelay: d.delay, animationDuration: d.duration }}
          />
        ))}
        {drops.map((d, i) => (
          <span
            key={`ripple-${i}`}
            className="hero-ripple"
            style={{ left: d.left, animationDelay: d.delay, animationDuration: d.duration }}
          />
        ))}
      </div>

      <Container className="relative py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-10">
          {/* 좌측 — 카피 */}
          <div>
            {/* 서비스 지역 배지 */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-inset ring-white/30 backdrop-blur-sm">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-300" />
              {BUSINESS.serviceArea} · {BUSINESS.responseTime}
            </span>

            {/* LIVE 띠 — 사회적 증거 */}
            {liveItem && (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-red-400/40 backdrop-blur-sm sm:text-sm">
                <span aria-hidden className="live-dot text-red-400" />
                <span className="font-extrabold uppercase tracking-wide text-red-200">LIVE</span>
                <span aria-hidden className="text-white/40">·</span>
                <span className="truncate">
                  <ScrollTime date={liveItem.created_at} variant="relative" />
                  {liveItem.region ? ` · ${liveItem.region}` : ""}
                  {" "}
                  <span className="font-bold">{liveItem.masked_name || "고객"}</span>
                  님 접수
                </span>
              </div>
            )}

            {/* 2단 카피 로테이터 — 감정 후킹 ↔ 약속 */}
            <div className="relative mt-4 h-6 sm:h-7">
              <p className="copy-rotate-a absolute inset-0 text-base font-bold text-white/95 sm:text-lg">
                지금도 천장에서 물이 떨어지고 계신가요?
              </p>
              <p className="copy-rotate-b absolute inset-0 text-base font-bold text-accent-200 sm:text-lg">
                {BUSINESS.responseTime} 안에 도착합니다.
              </p>
            </div>

            <h1 className="mt-3 text-4xl font-black leading-[1.15] tracking-tight drop-shadow-md sm:text-5xl lg:text-[3.25rem]">
              {headline}
            </h1>

            {/* 카운터 — 측정 가능한 실제 시공사례 수 */}
            {totalCases > 0 && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-white/12 px-4 py-3 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  누적 시공
                </span>
                <span className="text-2xl font-black tracking-tight text-accent-200 sm:text-3xl">
                  <CountUp to={totalCases} duration={1400} suffix="건+" />
                </span>
              </div>
            )}
          </div>

          {/* 우측 — 큰 전화 카드 (3중 펄스) */}
          <div className="flex flex-col items-center justify-center md:items-end">
            {phone ? (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 상담`}
                className="group flex flex-col items-center gap-3 rounded-3xl bg-white/15 px-7 py-5 ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/25"
              >
                <span className="relative">
                  <span
                    aria-hidden
                    className="absolute inset-0 -m-1 rounded-full bg-white/60 opacity-75 [animation:ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]"
                  />
                  <span className="phone-card-pulse relative flex size-24 items-center justify-center rounded-full bg-white text-brand-700 shadow-xl shadow-brand-950/40 sm:size-28">
                    <Phone
                      className="phone-ring size-12 sm:size-14"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </span>
                </span>
                <span className="text-center">
                  <span className="block text-2xl font-black tracking-tight drop-shadow sm:text-3xl">
                    {phone.display}
                  </span>
                  <span className="mt-1 block text-xs text-white/90">
                    터치 시 바로 전화로 연결됩니다
                  </span>
                </span>
              </a>
            ) : (
              <QuoteFallbackButton block label="1분 견적 받기" />
            )}
          </div>
        </div>

        {/* 스크롤 유도 */}
        <Link
          href="#live-board"
          aria-label="실시간 작업현황으로 스크롤"
          className="mt-8 hidden flex-col items-center gap-0.5 text-white/90 hover:text-white sm:flex"
        >
          <span className="text-xs font-semibold tracking-wide">↓ 시공사례 보기</span>
          <ChevronDown className="scroll-bounce size-5" strokeWidth={2.25} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
