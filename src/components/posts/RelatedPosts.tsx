import type { Post } from "@/types/database";
import { PostCard } from "./PostCard";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">관련 시공 사례</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
