import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getPublishedPosts } from "@/lib/posts";
import { formatDateYMD } from "@/lib/time";
import { siteConfig } from "@/lib/env";
import { ChevronRight } from "@/components/icons";
import type { Post } from "@/types/database";

const PLACEHOLDER = "/placeholder-post.svg";

function categoryLabel(cat: string | null): string {
  switch (cat) {
    case "leak":
      return "누수";
    case "toilet":
      return "변기";
    case "sink":
      return "싱크대";
    case "heating":
      return "난방";
    case "frozen":
      return "동파";
    default:
      return "기타";
  }
}

function regionPrefix(post: Post): string {
  // region_tags 첫 항목을 prefix로 — 없으면 빈 문자열
  if (post.region_tags && post.region_tags.length > 0) {
    return post.region_tags[0];
  }
  return "";
}

function formattedTitle(post: Post): string {
  // 운영자 입력 제목이 이미 풍부하면 그대로, 짧으면 prefix를 붙여 풍성하게.
  const region = regionPrefix(post);
  if (!region) return post.title;
  // 제목에 이미 지역명이 들어 있으면 중복 prefix 회피
  if (post.title.includes(region)) return post.title;
  return `${region} ${post.title}`;
}

/**
 * 작업사례 블로그식 카드 — 2열 그리드, 최대 8건.
 *
 * 각 카드:
 *   - 카테고리·"▶ 작업사례" 배지 + 지역 태그
 *   - "[{브랜드}] {지역} {제목}" 형태 굵은 제목
 *   - excerpt 2~3줄 미리보기
 *   - 날짜 + "자세히 보기 →" 링크 (/posts/[slug])
 *
 * 게시글 0건이면 섹션 자체 미렌더.
 */
export async function WorksCardsSection() {
  const { posts } = await getPublishedPosts({ page: 1, perPage: 8 });
  if (posts.length === 0) return null;

  return (
    <section
      id="works-cards"
      className="scroll-mt-20 bg-slate-50 py-10 md:py-14"
    >
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">WORKS</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            최근 작업사례 후기
          </h2>
          <p className="mt-3 text-slate-600">
            지역과 현장 유형별로 실제 진행한 작업 후기를 확인해보세요
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.08}
          className="mt-6 grid gap-5 sm:grid-cols-2"
        >
          {posts.map((p) => {
            const cover = p.cover_image_url ?? PLACEHOLDER;
            const isPlaceholder = !p.cover_image_url;
            const title = formattedTitle(p);
            return (
              <RevealItem key={p.id} variant="up">
                <Link
                  href={`/posts/${p.slug}`}
                  className="group flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* 좌측 썸네일 */}
                  <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-slate-100 sm:w-40">
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 10rem, 8rem"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={isPlaceholder}
                    />
                  </div>
                  {/* 우측 텍스트 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-extrabold text-brand-700">
                        ▶ 작업사례
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {categoryLabel(p.category)}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-extrabold text-slate-900 group-hover:text-brand-700 sm:text-base">
                      <span className="text-brand-700">[{siteConfig.name}]</span>{" "}
                      {title}
                    </h3>
                    {p.excerpt && (
                      <p className="line-clamp-2 text-xs text-slate-600 sm:text-sm">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                      <span>{formatDateYMD(p.published_at)}</span>
                      <span className="inline-flex items-center gap-0.5 font-bold text-brand-700">
                        자세히 보기
                        <ChevronRight
                          aria-hidden
                          className="size-3.5"
                          strokeWidth={2.5}
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <div className="mt-10 flex justify-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 bg-white px-6 py-3 text-sm font-extrabold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white sm:text-base"
          >
            더보기
            <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
