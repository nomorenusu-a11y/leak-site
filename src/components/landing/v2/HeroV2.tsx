import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Phone, ShieldCheck, Wrench } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { QuoteFallbackButton } from "../CtaButtons";

/**
 * Hero v2 — 장인케어 톤 + 시선 끄는 애니메이션.
 *
 * 시선 끄는 장치:
 *   1) 4장 카테고리 대표 사진이 4초 간격으로 자동 페이드 (Ken Burns 슬로우 줌)
 *   2) 떨어지는 물방울 8개 (CSS keyframes, GPU 가속)
 *   3) 전화 아이콘 흔들림(ring) 애니메이션 + 외곽 ping ring
 *   4) 진한 파랑 그라데이션 오버레이로 텍스트 가독성 유지
 *
 * prefers-reduced-motion 환경에선 globals.css 패치가 모두 0.001ms로 정지시킴.
 */
export async function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const headline = cityLabel ? `${cityLabel} 누수 · 시공 빠르게 해결` : "누수 · 시공 빠르게 해결";

  // 카테고리 대표 사진 4장을 fetch — 슬라이드 카루셀용
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

  // 물방울 위치/지연 패턴 (deterministic — hydration mismatch 방지)
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
      {/* 브랜드 파랑 그라데이션 오버레이 — 텍스트 가독성 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-700/92 via-brand-600/88 to-brand-800/92"
      />
      {/* 우상단 light 블롭 */}
      <div
        aria-hidden
        className="absolute -right-32 -top-24 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl"
      />
      {/* 떨어지는 물방울 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {drops.map((d, i) => (
          <span
            key={i}
            className="hero-drop"
            style={{
              left: d.left,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
      </div>

      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr] md:gap-10">
          {/* 좌측 — 카피 */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-inset ring-white/30 backdrop-blur-sm">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-300" />
              {BUSINESS.serviceArea} · {BUSINESS.responseTime}
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.15] tracking-tight drop-shadow-md sm:text-5xl lg:text-[3.5rem]">
              {headline}
            </h1>
            <p className="mt-4 text-base font-semibold text-white/95 drop-shadow sm:text-lg">
              최신 장비와 전문 마스터 보유
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-white/90 sm:text-base">
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-4 text-accent-300" strokeWidth={2.5} />
                비파괴 정밀 진단 · 최소 시공
              </li>
              <li className="flex items-center gap-2">
                <Wrench aria-hidden className="size-4 text-accent-300" strokeWidth={2.5} />
                {BUSINESS.warranty} · {BUSINESS.pricing}
              </li>
            </ul>
          </div>

          {/* 우측 — 큰 전화 아이콘 (애니메이션) */}
          <div className="flex flex-col items-center justify-center md:items-end">
            {phone ? (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 상담`}
                className="group flex flex-col items-center gap-3 rounded-3xl bg-white/15 px-7 py-6 ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/25"
              >
                <span className="relative">
                  {/* ping ring */}
                  <span
                    aria-hidden
                    className="absolute inset-0 -m-1 rounded-full bg-white/60 opacity-75 [animation:ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]"
                  />
                  <span className="relative flex size-24 items-center justify-center rounded-full bg-white text-brand-700 shadow-xl shadow-brand-950/40 sm:size-28">
                    <Phone className="phone-ring size-12 sm:size-14" strokeWidth={2.25} aria-hidden />
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
      </Container>
    </section>
  );
}
