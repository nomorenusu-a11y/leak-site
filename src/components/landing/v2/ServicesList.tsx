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
import { getServicesLeak, getServicesPipe } from "@/lib/site-content";
import type { ServiceData } from "@/types/database";

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  Droplets, Bath, Wrench, Thermometer, Snowflake,
};

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
  s: ServiceData;
  cover?: string;
}) {
  const href = s.cat ? `/posts?cat=${s.cat}` : (s.href ?? "/posts");
  const imgSrc = cover ?? s.image;
  const Icon = ICON_MAP[s.icon] ?? Wrench;
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
            <Icon aria-hidden className="size-16 text-brand-400" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-brand-700 shadow-sm">
          <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
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
  const [leakServices, pipeServices, covers] = await Promise.all([
    getServicesLeak(),
    getServicesPipe(),
    loadCovers(),
  ]);

  return (
    <section id="services" className="scroll-mt-20 py-8 md:py-12">
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

        <div className="mt-12">
          <Reveal variant="up" className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Group 1</p>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                누수 관련 서비스
              </h3>
              <p className="mt-1 text-sm text-slate-600">아파트·빌라·주택 등 모든 건물 대응</p>
            </div>
          </Reveal>
          <RevealGroup stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {leakServices.map((s) => (
              <RevealItem key={s.ko} variant="up">
                <Card s={s} cover={s.cat ? covers[s.cat as Cat] : undefined} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="mt-9">
          <Reveal variant="up" className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Group 2</p>
              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                배관·고압세척 서비스
              </h3>
              <p className="mt-1 text-sm text-slate-600">하수구·배관·배수구 막힘 및 기타 고압세척 현장 해결</p>
            </div>
          </Reveal>
          <RevealGroup stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipeServices.map((s) => (
              <RevealItem key={s.ko} variant="up">
                <Card s={s} cover={s.cat ? covers[s.cat as Cat] : undefined} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
