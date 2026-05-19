import Link from "next/link";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePost } from "./actions";
import { formatDateYMD } from "@/lib/time";

export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };

function firstString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await assertAdmin();
  const sp = await searchParams;
  const status = firstString(sp.status); // 'published' | 'draft' | undefined

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("posts")
    .select("id, title, slug, region_tags, published, view_count, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (status === "published") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  const { data: rows } = await query;
  const items = rows ?? [];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">시공 사례</h1>
          <p className="mt-1 text-sm text-slate-600">발행된 글과 임시저장된 글을 관리합니다.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
        >
          + 새 글 작성
        </Link>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip href="/admin/posts" label="전체" active={!status} />
        <FilterChip href="/admin/posts?status=published" label="발행" active={status === "published"} />
        <FilterChip href="/admin/posts?status=draft" label="임시저장" active={status === "draft"} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">제목</th>
              <th className="hidden px-4 py-3 sm:table-cell">지역</th>
              <th className="px-4 py-3">상태</th>
              <th className="hidden px-4 py-3 sm:table-cell">조회</th>
              <th className="hidden px-4 py-3 md:table-cell">발행일</th>
              <th className="px-4 py-3 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  조건에 맞는 글이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <PostRow
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  slug={p.slug}
                  regionTags={p.region_tags}
                  published={p.published}
                  viewCount={p.view_count}
                  publishedAt={p.published_at}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

function PostRow({
  id,
  title,
  slug,
  regionTags,
  published,
  viewCount,
  publishedAt,
}: {
  id: string;
  title: string;
  slug: string;
  regionTags: string[];
  published: boolean;
  viewCount: number;
  publishedAt: string;
}) {
  async function handleDelete() {
    "use server";
    return await deletePost(id);
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link
          href={`/admin/posts/${id}/edit`}
          className="font-semibold text-slate-900 hover:text-brand-700 hover:underline"
        >
          {title}
        </Link>
        <p className="text-xs text-slate-500">/{slug}</p>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className="text-xs text-slate-600">{regionTags.join(", ") || "-"}</span>
      </td>
      <td className="px-4 py-3">
        {published ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            발행
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            <span aria-hidden className="size-1.5 rounded-full bg-slate-400" />
            임시저장
          </span>
        )}
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-700 sm:table-cell">{viewCount}</td>
      <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
        {formatDateYMD(publishedAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/posts/${slug}`}
            target="_blank"
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            보기
          </Link>
          <Link
            href={`/admin/posts/${id}/edit`}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            편집
          </Link>
          <ConfirmButton
            label="삭제"
            confirmMessage={`"${title}"을 삭제하시겠습니까? 첨부 이미지도 함께 삭제됩니다.`}
            onAction={handleDelete}
          />
        </div>
      </td>
    </tr>
  );
}
