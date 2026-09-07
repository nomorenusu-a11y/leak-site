import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { CaseStudyArticle } from "@/components/posts/CaseStudyArticle";
import { PostCTABlock } from "@/components/posts/PostCTABlock";
import { gangnamFloorPipeStructuredDraft } from "@/data/case-drafts/gangnam-floor-pipe-structured";
import { getPostBySlug, getPostImages } from "@/lib/posts";

export const metadata = { robots: { index: false, follow: false } };

/** This route exists only to approve an editorial layout before published data is changed. */
export default async function GangnamFloorPipePreviewPage() {
  if (process.env.VERCEL_ENV !== "preview") notFound();

  const post = await getPostBySlug(gangnamFloorPipeStructuredDraft.sourceSlug);
  if (!post) notFound();
  const sourceImages = await getPostImages(post.id);
  const images = sourceImages.filter((image) =>
    gangnamFloorPipeStructuredDraft.steps.some((step) => step.imageId === image.id),
  );

  return (
    <>
      <Header showBack />
      <main className="flex-1 pb-20">
        <article>
          <header className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14">
            <Container>
              <p className="text-sm font-bold text-brand-700">Preview · 실제 현장 사진 기반 시공사례</p>
              <h1 className="mt-3 text-3xl leading-tight font-extrabold text-slate-900 sm:text-4xl">
                {gangnamFloorPipeStructuredDraft.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">{gangnamFloorPipeStructuredDraft.excerpt}</p>
            </Container>
          </header>
          <Container className="max-w-3xl py-10">
            <CaseStudyArticle
              draft={gangnamFloorPipeStructuredDraft}
              images={images}
              inlineCta={<PostCTABlock slug={post.slug} />}
            />
          </Container>
        </article>
      </main>
      <Footer />
    </>
  );
}
