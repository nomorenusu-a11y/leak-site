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
  let ctaInserted = false;
  return splitPostContentByImages(content, images).map((part, index) => {
    if (part.type === "markdown") return part.value.trim() ? <PostBody key={index} content={part.value} /> : null;
    const image = part.image;
    const showCta = Boolean(inlineCta && !ctaInserted);
    ctaInserted ||= showCta;
    return (
      <div key={image.id}>
        <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative w-full">
            <Image src={image.url} alt={image.alt_text ?? ""} width={1600} height={1200} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full object-contain" />
          </div>
          {(image.caption || image.alt_text) && <figcaption className="px-4 py-3 text-sm leading-6 text-slate-600">{image.caption ?? image.alt_text}</figcaption>}
        </figure>
        {showCta && inlineCta}
      </div>
    );
  });
}
