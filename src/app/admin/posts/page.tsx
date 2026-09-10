import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
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
  const keyword = (firstString(sp.q) ?? "").trim().slice(0, 80);

  const supabase = createSupabaseAdminClient();
  const [publishedCount, draftCount, rowsResult] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", false),
    loadPosts(supabase, status, keyword),
  ]);
  const items = rowsResult.data ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Content library</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">게시글 관리</h1>
          <p className="mt-2 text-sm text-slate-400">공개 상태, 초안, 지역별 글을 한 화면에서 찾고 관리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/auto-post" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/[0.08]"><Sparkles size={16} /> 자동 글쓰기</Link>
          <Link href="/admin/posts/new" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-400">+ 새 글 작성</Link>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusCard href="/admin/posts" label="전체 콘텐츠" value={(publishedCount.count ?? 0) + (draftCount.count ?? 0)} description="공개와 검토 대기 글" tone="blue" />
        <StatusCard href="/admin/posts?status=published" label="공개 글" value={publishedCount.count ?? 0} description="검색 유입을 받을 수 있는 글" tone="emerald" />
        <StatusCard href="/admin/posts?status=draft" label="발행 대기" value={draftCount.count ?? 0} description="사진·문구를 확인할 글" tone="amber" />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip href="/admin/posts" label={`전체 ${(publishedCount.count ?? 0) + (draftCount.count ?? 0)}`} active={!status} />
            <FilterChip href="/admin/posts?status=published" label={`공개 ${publishedCount.count ?? 0}`} active={status === "published"} />
            <FilterChip href="/admin/posts?status=draft" label={`발행 대기 ${draftCount.count ?? 0}`} active={status === "draft"} />
          </div>
          <form className="flex w-full gap-2 lg:w-auto" action="/admin/posts" method="get">
            {status && <input type="hidden" name="status" value={status} />}
            <label className="sr-only" htmlFor="post-search">게시글 검색</label>
            <div className="relative min-w-0 flex-1 lg:w-72"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input id="post-search" name="q" defaultValue={keyword} placeholder="지역, 누수 유형, 제목 검색" className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500" /></div>
            <button type="submit" className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.06]">검색</button>
          </form>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500"><span>{keyword ? `“${keyword}” 검색 결과` : "최근 수정 순"}</span><span>{items.length.toLocaleString("ko-KR")}개 표시</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-y border-white/[0.08] bg-white/[0.025] text-left text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">제목</th><th className="px-4 py-3">지역</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">조회</th><th className="px-4 py-3">발행일</th><th className="px-5 py-3 text-right">관리</th></tr></thead>
            <tbody className="divide-y divide-white/[0.07]">
              {items.length === 0 ? <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">조건에 맞는 글이 없습니다.</td></tr> : items.map((p) => <PostRow key={p.id} id={p.id} title={p.title} slug={p.slug} regionTags={p.region_tags} published={p.published} viewCount={p.view_count} publishedAt={p.published_at} />)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

async function loadPosts(supabase: ReturnType<typeof createSupabaseAdminClient>, status: string | undefined, keyword: string) {
  let query = supabase
    .from("posts")
    .select("id, title, slug, region_tags, published, view_count, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (status === "published") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  if (keyword) query = query.ilike("title", `%${keyword.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`);
  return query;
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-blue-400/50 bg-blue-500 text-white"
          : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.08]"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusCard({ href, label, value, description, tone }: { href: string; label: string; value: number; description: string; tone: "blue" | "emerald" | "amber" }) {
  const toneClass = { blue: "bg-blue-400", emerald: "bg-emerald-400", amber: "bg-amber-400" }[tone];
  return <Link href={href} className="rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5 transition hover:border-white/20 hover:bg-white/[0.035]"><span className={`block h-1 w-10 rounded-full ${toneClass}`} /><p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-white">{value.toLocaleString("ko-KR")}</p><p className="mt-2 text-xs text-slate-500">{description}</p></Link>;
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
    <tr className="transition-colors hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <Link
          href={`/admin/posts/${id}/edit`}
          className="font-bold leading-5 text-slate-100 hover:text-blue-300 hover:underline"
        >
          {title}
        </Link>
        <p className="mt-1 text-xs text-slate-500">/{slug}</p>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs text-slate-400">{regionTags.join(", ") || "-"}</span>
      </td>
      <td className="px-4 py-4">
        {published ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            발행
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-200">
            <span aria-hidden className="size-1.5 rounded-full bg-amber-400" />
            발행 대기
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-sm font-medium text-slate-300">{viewCount}</td>
      <td className="px-4 py-4 text-xs text-slate-500">
        {formatDateYMD(publishedAt)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/posts/${slug}`}
            target="_blank"
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/[0.08]"
          >
            보기
          </Link>
          <Link
            href={`/admin/posts/${id}/edit`}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/[0.08]"
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
