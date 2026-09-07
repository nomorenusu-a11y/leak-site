import Image from "next/image";
import type { ReactNode } from "react";
import { splitPostContentByImages } from "@/lib/post-inline-images";
import type { PostImage } from "@/types/database";
import { PostBody } from "./PostBody";

export function PostContent({
  content,
  images,
  inlineCta,
}: {
  content: string;
  images: PostImage[];
  inlineCta?: ReactNode;
}) {
  const parts = splitPostContentByImages(content, images);
  const imageCount = parts.filter((part) => part.type === "image").length;
  // 첫 문단을 읽자마자 끊지 않고, 현장 근거를 본 중간 지점에 CTA를 둔다.
  const ctaAfterImage = Math.max(1, Math.ceil(imageCount / 2));
  let ctaInserted = false;
  let imageIndex = 0;

  return parts.map((part, index) => {
    if (part.type === "markdown") return part.value.trim() ? <PostBody key={index} content={part.value} /> : null;
    const image = part.image;
    imageIndex += 1;
    const stage = image.work_stage?.trim() || "현장 확인";
    const explanation = image.caption?.trim() || image.alt_text?.trim();
    const showCta = Boolean(inlineCta && !ctaInserted && imageIndex >= ctaAfterImage);
    ctaInserted ||= showCta;
    return (
      <section key={image.id} className="my-9" aria-label={`현장 진행 ${imageIndex}: ${stage}`}>
        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand-700 text-xs font-extrabold text-white">
                {imageIndex}
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-[0.08em] text-brand-700">현장 진행</p>
                <p className="text-sm font-extrabold text-slate-900">{stage}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">사진 {imageIndex}</span>
          </div>
          <div className="relative w-full">
            <Image
              src={image.url}
              alt={image.alt_text ?? ""}
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full object-contain"
            />
          </div>
          {explanation && (
            <figcaption className="border-t border-slate-100 px-4 py-3.5 text-sm leading-6 text-slate-700">
              <span className="mr-2 font-bold text-slate-900">사진에서 확인한 내용</span>
              {explanation}
            </figcaption>
          )}
        </figure>
        {showCta && inlineCta}
      </section>
    );
  });
}
