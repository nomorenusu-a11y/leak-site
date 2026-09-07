import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PostForm } from "@/components/admin/PostForm";
import type { Post } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPostEditPage({ params }: { params: Promise<{ id: string }> }) {
  await assertAdmin();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const [{ data: post }, { data: images }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("post_images")
      .select("id, url, sort_order, alt_text, caption, work_stage, image_variant, overlay_text")
      .eq("post_id", id)
      .order("sort_order", { ascending: true }),
  ]);
  if (!post) notFound();

  return (
    <>
      <header>
        <Link href="/admin/posts" className="text-brand-700 text-sm font-semibold hover:underline">
          ← 글 목록
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">글 편집</h1>
        <p className="mt-1 text-sm text-slate-500">
          /posts/{(post as Post).slug}{" "}
          <Link
            href={`/posts/${(post as Post).slug}`}
            target="_blank"
            className="text-brand-700 ml-2 hover:underline"
          >
            (새 탭에서 보기)
          </Link>
        </p>
      </header>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <Link
          href={`/admin/posts/${id}/seo`}
          className="border-brand-300 text-brand-700 mb-5 inline-flex rounded-lg border px-4 py-3 font-bold"
        >
          실제 시공 지역·SEO 분류 관리
        </Link>
        <PostForm mode="edit" post={post as Post} images={images ?? []} />
      </div>
    </>
  );
}
