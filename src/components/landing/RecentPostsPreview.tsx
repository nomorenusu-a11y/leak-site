import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/posts/PostCard";
import { getPublishedPosts } from "@/lib/posts";

/**
 * 홈 페이지에 최신 시공 사례 3건 노출. /posts와 동일한 PostCard 시각 언어.
 * 글 0건이면 섹션 자체 미렌더 (스켈레톤 멈춤 방지).
 */
export async function RecentPostsPreview() {
  const { posts } = await getPublishedPosts({ page: 1, perPage: 3 });
  if (posts.length === 0) return null;

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">시공 사례</h2>
            <p className="mt-2 text-slate-600">실제 진행한 누수 시공 사례를 지역별로 확인하세요.</p>
          </div>
          <Link
            href="/posts"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            모든 시공 사례 보기 →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
