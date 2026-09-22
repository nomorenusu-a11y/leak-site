import { notFound } from "next/navigation";
import { parseListSearch, listPath, type ListSearch } from "@/lib/post-list-search";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PostList } from "@/components/posts/PostList";
import { RegionChips } from "@/components/posts/RegionChips";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { siteConfig } from "@/lib/env";
import { categoryLabel } from "@/lib/post-categories";
import { postsCollectionJsonLd } from "@/lib/seo/schema";
import { safeJsonLd } from "@/lib/seo/regions";

/**
 * 기존 URL에서 검색 파라미터를 읽어 페이지네이션과 분류를 처리한다.
 * searchParams 사용으로 요청 시 렌더링한다.
 */
export const revalidate = 3600;

type Props = { searchParams: Promise<ListSearch> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseListSearch(await searchParams);
  if (!filters) notFound();
  const canonical = listPath("/posts", filters.page, filters.category);
  const label = filters.category ? categoryLabel(filters.category) : "전체 누수";
  const pageSuffix = filters.page > 1 ? ` · ${filters.page}페이지` : "";
  const title = filters.category
    ? `${label} 시공 사례${pageSuffix}`
    : `누수 작업사례 모음${pageSuffix}`;
  const description = filters.category
    ? `${siteConfig.name}의 ${label} 점검·시공 사례입니다. 지역별 증상과 확인 과정을 살펴보세요.${filters.page > 1 ? ` ${filters.page}페이지.` : ""}`
    : `${siteConfig.name}의 누수 탐지·시공 사례 모음. 지역별 증상과 확인 과정을 살펴보세요.${filters.page > 1 ? ` ${filters.page}페이지.` : ""}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonical,
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ["/og-image.png"],
    },
    robots: { index: !filters.category, follow: true },
  };
}
export default async function PostsIndexPage({ searchParams }: Props) {
  const filters = parseListSearch(await searchParams);
  if (!filters) notFound();
  const { posts, totalPages } = await getPublishedPosts({ ...filters, perPage: POSTS_PER_PAGE });
  if (filters.page > totalPages) notFound();
  const label = filters.category ? categoryLabel(filters.category) : "전체 누수";
  const title = filters.category
    ? `${label} 시공 사례${filters.page > 1 ? ` · ${filters.page}페이지` : ""}`
    : `누수 작업사례 모음${filters.page > 1 ? ` · ${filters.page}페이지` : ""}`;
  const description = `${siteConfig.name}의 ${label} 점검·시공 사례입니다. 지역별 증상과 확인 과정을 살펴보세요.`;
  const path = listPath("/posts", filters.page, filters.category);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(postsCollectionJsonLd({ title, description, path, posts })),
        }}
      />
      <Header showBack />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
          <Container>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {label} 시공 사례
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              실제 진행한 누수 탐지·시공 사례입니다. 관심 있는 지역으로 바로 이동할 수 있어요.
            </p>
            <div className="mt-6">
              <RegionChips allHref="/posts" />
            </div>
          </Container>
        </section>
        <Container className="py-10">
          <PostList
            posts={posts}
            page={filters.page}
            totalPages={totalPages}
            basePath={listPath("/posts", 1, filters.category)}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
