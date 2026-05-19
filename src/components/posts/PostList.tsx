import { Pagination } from "@/components/ui/Pagination";
import type { Post } from "@/types/database";
import { PostCard } from "./PostCard";

type Props = {
  posts: Post[];
  page: number;
  totalPages: number;
  basePath: string;
  emptyMessage?: string;
};

export function PostList({ posts, page, totalPages, basePath, emptyMessage }: Props) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-slate-500">
        {emptyMessage ?? "아직 시공 사례가 없습니다."}
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      <Pagination basePath={basePath} page={page} totalPages={totalPages} />
    </>
  );
}
