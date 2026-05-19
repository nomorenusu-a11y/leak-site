import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PostList } from "@/components/posts/PostList";
import { RegionChips } from "@/components/posts/RegionChips";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { siteConfig } from "@/lib/env";

/**
 * 시공 사례 목록 (첫 페이지). searchParams를 받지 않아 SSG + ISR로 동작.
 * 글이 perPage(=12) 이상 쌓이면 path segment 페이지네이션으로 전환.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
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

export default async function PostsIndexPage() {
  const { posts, totalPages } = await getPublishedPosts({ page: 1, perPage: POSTS_PER_PAGE });

  return (
    <>
      <Header />
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
            page={1}
            totalPages={totalPages}
            basePath="/posts"
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
