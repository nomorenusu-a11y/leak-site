import Image from "next/image";
import type { PostImage } from "@/types/database";

export function PostGallery({
  images,
  startIndex = 0,
}: {
  images: PostImage[];
  startIndex?: number;
}) {
  if (images.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-extrabold text-slate-900">현장 사진</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, index) => (
          <figure
            key={img.id}
            id={`field-photo-${startIndex + index + 1}`}
            className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={img.url}
                alt={img.alt_text?.trim() || "누수 점검 현장 사진"}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            {img.alt_text && (
              <figcaption className="px-3 py-2 text-xs text-slate-600">{img.alt_text}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
