import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PostSeoForm } from "@/components/admin/PostSeoForm";
import { regionById } from "@/lib/regions";
import { validTermIds } from "@/lib/seo/taxonomy";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await assertAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = createSupabaseAdminClient();
  const [post, location, terms] = await Promise.all([
    db.from("posts").select("id,title").eq("id", id).maybeSingle(),
    db.from("post_locations").select("*").eq("post_id", id).maybeSingle(),
    db.from("post_terms").select("*").eq("post_id", id),
  ]);
  if (!post.data) notFound();
  const ids = (terms.data ?? []).map((t) => t.term_id);
  const unavailable =
    !!(location.error || terms.error) ||
    (location.data && !regionById(location.data.region_id)) ||
    !validTermIds(ids);
  return (
    <>
      <Link
        href={`/admin/posts/${id}/edit`}
        className="text-brand-700 text-sm font-semibold underline"
      >
        게시글 편집으로
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">사례 지역·SEO 분류</h1>
      <p className="mt-2 mb-6 text-slate-600">{post.data.title}</p>
      {unavailable ? (
        <p role="alert" className="rounded-lg bg-amber-50 p-5">
          분류 데이터를 불러오지 못했거나 파일럿 범위 밖의 연결이 있습니다. 기존 연결을 보호하기
          위해 저장을 비활성화했습니다. SEO migration과 데이터를 확인해 주세요.
        </p>
      ) : (
        <PostSeoForm postId={id} regionId={location.data?.region_id ?? ""} termIds={ids} />
      )}
    </>
  );
}
