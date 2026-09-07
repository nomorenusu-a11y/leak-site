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

/**
 * 기존 URL에서 검색 파라미터를 읽어 페이지네이션과 분류를 처리한다.
 * searchParams 사용으로 요청 시 렌더링한다.
 */
export const revalidate = 3600;

const baseMetadata: Metadata = {
  title: "시공 사례",
  description: `${siteConfig.name}의 누수 탐지·시공 사례 모음. 지역별로 진행 사례를 확인하세요.`,
  alternates: { canonical: "/posts" },
  openGraph: {
    type: "website",
    title: `시공 사례 | ${siteConfig.name}`,
    description: "지역별 누수 탐지·시공 사례 모음.",
    url: `${siteConfig.url}/posts`,
  },
};

type Props = { searchParams: Promise<ListSearch> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseListSearch(await searchParams);
  if (!filters) notFound();
  const canonical = listPath("/posts", filters.page, filters.category);
  return {
    ...baseMetadata,
    title: filters.page > 1 ? `시공 사례 · ${filters.page}페이지` : "시공 사례",
    alternates: { canonical },
    openGraph: { ...baseMetadata.openGraph, url: canonical },
    robots: { index: !filters.category, follow: true },
  };
}
export default async function PostsIndexPage({ searchParams }: Props) {
  const filters = parseListSearch(await searchParams);
  if (!filters) notFound();
  const { posts, totalPages } = await getPublishedPosts({ ...filters, perPage: POSTS_PER_PAGE });
  if (filters.page > totalPages) notFound();

  return (
    <>
      <Header showBack />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
          <Container>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              시공 사례
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
