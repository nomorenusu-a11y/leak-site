import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/database";
import { formatDateYMD } from "@/lib/time";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            이미지 없음
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.region_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-extrabold text-slate-900 group-hover:text-brand-700 sm:text-lg">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
        )}
        <p className="mt-3 text-xs text-slate-500">{formatDateYMD(post.published_at)}</p>
      </div>
    </Link>
  );
}
