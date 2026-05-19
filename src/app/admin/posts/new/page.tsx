import Link from "next/link";
import { assertAdmin } from "@/lib/auth";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function AdminPostNewPage() {
  await assertAdmin();
  return (
    <>
      <header>
        <Link href="/admin/posts" className="text-sm font-semibold text-brand-700 hover:underline">
          ← 글 목록
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">새 글 작성</h1>
        <p className="mt-1 text-sm text-slate-600">
          글을 처음 만들면 슬러그가 생성됩니다. 추가 이미지는 글 저장 후 편집 화면에서 첨부할 수 있어요.
        </p>
      </header>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <PostForm mode="create" />
      </div>
    </>
  );
}
