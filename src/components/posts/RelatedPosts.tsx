import type { Post } from "@/types/database";
import { PostCard } from "./PostCard";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <p className="text-brand-700 text-sm font-bold">이 지역에서 같이 확인할 내용</p>
      <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
        관련 지역·증상 안내
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        같은 지역에서 함께 검색하는 증상과 점검 기준을 이어서 확인할 수 있습니다.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
