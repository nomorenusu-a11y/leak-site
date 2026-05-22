import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PostList } from "@/components/posts/PostList";
import { RegionChips } from "@/components/posts/RegionChips";
import {
  ALL_CITY_CODES,
  CITY_REGION_TAGS,
  cityCodeToSlug,
  parseCitySlug,
} from "@/lib/city";
import { getPostsByRegionTag, POSTS_PER_PAGE } from "@/lib/posts";
import { regionCollectionJsonLd } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/env";

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_CITY_CODES.map((code) => ({ region: cityCodeToSlug(code) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const code = parseCitySlug(region);
  if (!code) return { title: "찾을 수 없음" };
  const tag = CITY_REGION_TAGS[code];
  const title = `${tag} 누수 시공 사례`;
  const description = `${tag} 지역의 누수 탐지·시공 사례 모음. 비파괴 정밀 진단, 1년 무상 A/S.`;
  const url = `${siteConfig.url}/posts/region/${region}`;
  return {
    title,
    description,
    alternates: { canonical: `/posts/region/${region}` },
    openGraph: {
      type: "website",
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
    },
    twitter: {
      card: "summary",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function PostsRegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const code = parseCitySlug(region);
  if (!code) notFound();

  const tag = CITY_REGION_TAGS[code];
  const { posts, totalPages } = await getPostsByRegionTag(tag, {
    page: 1,
    perPage: POSTS_PER_PAGE,
  });

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            regionCollectionJsonLd({ regionTag: tag, slug: region, posts }),
          ),
        }}
      />
      <Header showBack />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
          <Container>
            <p className="text-sm font-semibold text-brand-700">시공 사례</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {tag} 누수 시공 사례
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              {tag} 지역에서 진행한 누수 탐지·시공 사례입니다.
            </p>
            <div className="mt-6">
              <RegionChips activeCode={code} allHref="/posts" />
            </div>
          </Container>
        </section>
        <Container className="py-10">
          <PostList
            posts={posts}
            page={1}
            totalPages={totalPages}
            basePath={`/posts/region/${region}`}
            emptyMessage={`${tag} 누수 시공 사례가 곧 업데이트됩니다.`}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
