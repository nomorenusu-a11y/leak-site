import { getPostLocation } from "@/lib/region-posts";
import { regionById, regionAncestors, resolvePostBreadcrumbRegion } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { RegionBreadcrumbs } from "@/components/regions/RegionBreadcrumbs";
import { breadcrumbJsonLd, postCollectionBreadcrumbJsonLd, safeJsonLd } from "@/lib/seo/regions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PostContent } from "@/components/posts/PostContent";
import { CaseStudyArticle } from "@/components/posts/CaseStudyArticle";
import { PostGallery } from "@/components/posts/PostGallery";
import { RelatedPosts } from "@/components/posts/RelatedPosts";
import { PostViewTracker } from "@/components/posts/PostViewTracker";
import { PostCTABlock } from "@/components/posts/PostCTABlock";
import { SharePost } from "@/components/posts/SharePost";
import { PostNav } from "@/components/posts/PostNav";
import {
  getAdjacentPosts,
  getAllPublishedSlugs,
  getPostBySlug,
  getPostImages,
  getRelatedPosts,
} from "@/lib/posts";
import { markdownToPlainText } from "@/lib/markdown";
import { articleJsonLd, postImageCarouselJsonLd } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/env";
import { formatDateYMD } from "@/lib/time";
import { splitPostContentByImages } from "@/lib/post-inline-images";
import { getCaseStudyDraft } from "@/data/case-drafts";

export const revalidate = 3600;

function compactSearchTitle(value: string) {
  const firstClause = value
    .replace(/^\[\s*노모어누수\s*\]\s*/, "")
    .split(/\s*(?:[|｜]|—|–)\s*/, 1)[0]
    .trim();
  if (firstClause.length <= 28) return firstClause;
  const candidate = firstClause.slice(0, 28);
  const boundary = candidate.lastIndexOf(" ");
  return (boundary >= 18 ? candidate.slice(0, boundary) : candidate).trim();
}

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
  const caseDraft = getCaseStudyDraft(slug);
  const postImages = await getPostImages(post.id);
  const title = caseDraft?.title ?? post.title;
  const searchTitle = compactSearchTitle(title);
  const description = caseDraft?.excerpt ?? post.excerpt ?? markdownToPlainText(post.content, 160);
  const url = `${siteConfig.url}/posts/${post.slug}`;
  // broken placeholder URL 방어 — placehold.co는 OG/twitter image에서 제외
  const isValidCover = post.cover_image_url && !/placehold\.co/i.test(post.cover_image_url);
  const imageUrls = [
    ...(isValidCover ? [post.cover_image_url as string] : []),
    ...postImages.filter((image) => image.image_variant !== "annotated").map((image) => image.url),
  ].filter((value, index, all) => all.indexOf(value) === index);
  const images = imageUrls.length
    ? imageUrls.slice(0, 5).map((imageUrl, index) => ({
        url: imageUrl,
        alt:
          postImages.find((image) => image.url === imageUrl)?.alt_text ??
          `${title} 현장 사진 ${index + 1}`,
      }))
    : undefined;
  return {
    title: { absolute: `${searchTitle} | ${siteConfig.name}` },
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const caseDraft = getCaseStudyDraft(slug);

  const [images, related, adjacent] = await Promise.all([
    getPostImages(post.id),
    getRelatedPosts(post, 5),
    getAdjacentPosts(post.slug),
  ]);
  const location = await getPostLocation(post.id);
  const candidate = location ? regionById(location.region_id) : resolvePostBreadcrumbRegion(post);
  const region = candidate && (await getPublicRegionContent(candidate)) ? candidate : undefined;
  const shareUrl = `${siteConfig.url}/posts/${post.slug}`;
  const inlineImages = splitPostContentByImages(post.content, images)
    .filter((part) => part.type === "image")
    .map((part) => part.image);
  const hasInlineImages = inlineImages.length > 0;
  const isStructuredCaseStudy = Boolean(
    caseDraft && caseDraft.steps.every((step) => images.some((image) => image.id === step.imageId)),
  );
  const embeddedImageIds = new Set(
    isStructuredCaseStudy && caseDraft
      ? caseDraft.steps.map((step) => step.imageId)
      : inlineImages.map((image) => image.id),
  );
  const supplementalImages = images.filter((image) => !embeddedImageIds.has(image.id));
  const displayPost = caseDraft
    ? { ...post, title: caseDraft.title, excerpt: caseDraft.excerpt }
    : post;
  const imageCarousel = postImageCarouselJsonLd(displayPost, images, related);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            articleJsonLd(
              displayPost,
              region
                ? regionAncestors(region)
                    .map((r) => r.name)
                    .join(" ")
                : undefined,
              images,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            region ? breadcrumbJsonLd(region, post) : postCollectionBreadcrumbJsonLd(post),
          ),
        }}
      />
      {imageCarousel && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: safeJsonLd(imageCarousel) }}
        />
      )}
      <PostViewTracker slug={post.slug} regionTags={post.region_tags} />
      <Header showBack />
      <main className="flex-1 pb-20">
        <article>
          <header className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
            <Container>
              {region && (
                <div className="mb-5">
                  <RegionBreadcrumbs region={region} postTitle={displayPost.title} />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                {post.region_tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-100 text-brand-800 rounded-md px-2 py-0.5 font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 text-3xl leading-tight font-extrabold text-slate-900 sm:text-4xl">
                {displayPost.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {formatDateYMD(post.published_at)}
                  {post.category && <span className="ml-2 text-slate-400">·</span>}
                  {post.category && <span className="ml-2">{post.category}</span>}
                </p>
                <SharePost url={shareUrl} title={displayPost.title} />
              </div>
            </Container>
          </header>
          <Container className="max-w-3xl py-10">
            {caseDraft && isStructuredCaseStudy ? (
              <>
                <CaseStudyArticle
                  draft={caseDraft}
                  images={images}
                  inlineCta={<PostCTABlock slug={post.slug} region={region?.name} />}
                  endCta={<PostCTABlock slug={post.slug} region={region?.name} />}
                />
                <PostGallery images={supplementalImages} startIndex={embeddedImageIds.size} />
              </>
            ) : (
              <>
                <PostContent
                  content={post.content}
                  images={images}
                  inlineCta={
                    hasInlineImages ? (
                      <PostCTABlock slug={post.slug} region={region?.name} />
                    ) : undefined
                  }
                />
                <PostGallery images={supplementalImages} startIndex={embeddedImageIds.size} />
                {!hasInlineImages && <PostCTABlock slug={post.slug} region={region?.name} />}
              </>
            )}
            <PostNav prev={adjacent.prev} next={adjacent.next} />
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
