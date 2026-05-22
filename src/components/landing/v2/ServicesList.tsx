import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Droplets, Bath, Wrench, Thermometer, Snowflake, ArrowRight } from "@/components/icons";
import { siteConfig } from "@/lib/env";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type ServiceCard = {
  cat: "leak" | "toilet" | "sink" | "heating" | "frozen";
  ko: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
};

const SERVICES: ServiceCard[] = [
  {
    cat: "leak",
    ko: "누수탐지",
    desc: "비파괴 정밀 장비로 누수 위치를 찾아 최소 시공으로 해결",
    Icon: Droplets,
  },
  {
    cat: "toilet",
    ko: "변기 누수·교체",
    desc: "변기 바닥 누수·물탱크 누수·부품 교체까지",
    Icon: Bath,
  },
  {
    cat: "sink",
    ko: "싱크대 누수·막힘",
    desc: "하부장 누수와 배수 막힘 동시 해결",
    Icon: Wrench,
  },
  {
    cat: "heating",
    ko: "난방배관 청소",
    desc: "방마다 온도 차가 나면 슬러지 청소 시점",
    Icon: Thermometer,
  },
  {
    cat: "frozen",
    ko: "동파·해빙",
    desc: "겨울 한파로 얼고 파열된 배관 안전 복구",
    Icon: Snowflake,
  },
];

/**
 * 서비스 목록 (장인케어 IMG_5 톤).
 *
 * 각 카드는 카테고리별 대표 사진(첫 글의 cover) + 아이콘 + 설명 + 사례 보러가기 링크.
 * 사진은 시드된 region 글의 가장 최신 사례 cover_image_url를 사용 — 없으면 아이콘만.
 */
export async function ServicesList() {
  const supabase = createSupabaseAnonClient();
  // 각 카테고리별 최신 published cover_image 1장씩
  const covers: Partial<Record<ServiceCard["cat"], string>> = {};
  for (const s of SERVICES) {
    const { data } = await supabase
      .from("posts")
      .select("cover_image_url")
      .eq("published", true)
      .eq("category", s.cat)
      .not("cover_image_url", "is", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.cover_image_url) covers[s.cat] = data.cover_image_url;
  }

  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">SERVICES</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {siteConfig.name}의 서비스 목록
          </h2>
          <p className="mt-3 text-slate-600">
            다양한 상황의 누수·하수 서비스를 받아보실 수 있습니다
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((s) => (
            <RevealItem key={s.cat} variant="up">
              <article
                className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  {covers[s.cat] ? (
                    <Image
                      src={covers[s.cat]!}
                      alt={s.ko}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <s.Icon aria-hidden className="size-16 text-brand-300" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-brand-700 shadow-sm">
                    <s.Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
                    {s.ko}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{s.ko}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
                  <Link
                    href={`/posts?cat=${s.cat}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline"
                  >
                    자세히 보기
                    <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
                  </Link>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
