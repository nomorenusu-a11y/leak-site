import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  Droplets,
  Bath,
  Wrench,
  Thermometer,
  Snowflake,
  ArrowRight,
} from "@/components/icons";
import { siteConfig } from "@/lib/env";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

type ServiceCard = {
  /** DB 카테고리 매핑이 있으면 그 키, 없으면 null (informational 카드) */
  cat: Cat | null;
  ko: string;
  desc: string;
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
  /** 외부 라우트 (cat이 있으면 /posts?cat=... 자동) */
  href?: string;
  /** cat이 null인 informational 카드용 고정 이미지 (public 경로) */
  image?: string;
};

const LEAK_SERVICES: ServiceCard[] = [
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
    cat: "frozen",
    ko: "동파·해빙",
    desc: "겨울 한파로 얼고 파열된 배관 안전 복구",
    Icon: Snowflake,
  },
];

const PIPE_SERVICES: ServiceCard[] = [
  {
    cat: "heating",
    ko: "난방배관 청소",
    desc: "방마다 온도 차가 나면 슬러지 청소 시점",
    Icon: Thermometer,
  },
  {
    cat: null,
    ko: "하수구 막힘",
    desc: "주방·욕실 하수구·배수관 막힘 해소 (고압세척)",
    Icon: Wrench,
    href: "/posts",
    image: "/about/rescue.png",
  },
  {
    cat: null,
    ko: "배관 고압세척",
    desc: "오래된 배관·배수구 누적 이물질 강력 세척",
    Icon: Droplets,
    href: "/posts",
    image: "/about/dispatch.png",
  },
];

const ALL_CATS: Cat[] = ["leak", "toilet", "sink", "heating", "frozen"];

async function loadCovers() {
  const supabase = createSupabaseAnonClient();
  const covers: Partial<Record<Cat, string>> = {};
  for (const c of ALL_CATS) {
    const { data } = await supabase
      .from("posts")
      .select("cover_image_url")
      .eq("published", true)
      .eq("category", c)
      .not("cover_image_url", "is", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.cover_image_url) covers[c] = data.cover_image_url;
  }
  return covers;
}

function Card({
  s,
  cover,
}: {
  s: ServiceCard;
  cover?: string;
}) {
  const href = s.cat ? `/posts?cat=${s.cat}` : (s.href ?? "/posts");
  const imgSrc = cover ?? s.image;
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative aspect-[16/10] bg-slate-100">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={s.ko}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
            <s.Icon
              aria-hidden
              className="size-16 text-brand-400"
              strokeWidth={1.5}
            />
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
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline"
        >
          자세히 보기
          <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
        </Link>
      </div>
    </article>
  );
}

/**
 * 서비스 목록 — 누수/배관 두 그룹으로 묶어 깊이감 부여.
 *
 * 각 그룹 헤더 + 카드 그리드. 카드 hover 시 살짝 떠오르는 효과.
 */
export async function ServicesList() {
  const covers = await loadCovers();

  return (
    <section id="services" className="scroll-mt-20 py-10 md:py-14">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">
            SERVICES
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {siteConfig.name}의 서비스 목록
          </h2>
          <p className="mt-3 text-slate-600">
            다양한 상황의 누수·배관 서비스를 받아보실 수 있습니다
          </p>
        </Reveal>

        {/* 그룹 1: 누수 관련 */}
        <div className="mt-12">
          <Reveal variant="up" className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Group 1
              </p>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                누수 관련 서비스
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                아파트·빌라·주택 등 모든 건물 대응
              </p>
            </div>
          </Reveal>
          <RevealGroup
            stagger={0.08}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {LEAK_SERVICES.map((s) => (
              <RevealItem key={s.ko} variant="up">
                <Card s={s} cover={s.cat ? covers[s.cat] : undefined} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* 그룹 2: 배관·세척 */}
        <div className="mt-9">
          <Reveal variant="up" className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                Group 2
              </p>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                배관·고압세척 서비스
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                하수구·배관·배수구 막힘 및 기타 고압세척 현장 해결
              </p>
            </div>
          </Reveal>
          <RevealGroup
            stagger={0.08}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {PIPE_SERVICES.map((s) => (
              <RevealItem key={s.ko} variant="up">
                <Card s={s} cover={s.cat ? covers[s.cat] : undefined} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
