import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PostBody } from "@/components/posts/PostBody";
import { PostGallery } from "@/components/posts/PostGallery";
import { RelatedPosts } from "@/components/posts/RelatedPosts";
import {
  getAllPublishedSlugs,
  getPostBySlug,
  getPostImages,
  getRelatedPosts,
} from "@/lib/posts";
import { markdownToPlainText } from "@/lib/markdown";
import { articleJsonLd } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/env";
import { formatDateYMD } from "@/lib/time";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getAllPublishedSlugs();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "찾을 수 없음" };
  const description = post.excerpt || markdownToPlainText(post.content, 160);
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const images = post.cover_image_url ? [post.cover_image_url] : undefined;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      images,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [images, related] = await Promise.all([
    getPostImages(post.id),
    getRelatedPosts(post, 3),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }}
      />
      <Header />
      <main className="flex-1 pb-20">
        <article>
          <header className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
            <Container>
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                {post.region_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-brand-100 px-2 py-0.5 font-semibold text-brand-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                {formatDateYMD(post.published_at)}
                {post.category && <span className="ml-2 text-slate-400">·</span>}
                {post.category && <span className="ml-2">{post.category}</span>}
              </p>
            </Container>
          </header>
          <Container className="py-10 max-w-3xl">
            <PostBody content={post.content} />
            <PostGallery images={images} />
          </Container>
        </article>
        <Container className="max-w-3xl">
          <RelatedPosts posts={related} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
