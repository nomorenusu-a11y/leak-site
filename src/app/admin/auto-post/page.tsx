import { assertAdmin } from "@/lib/auth";
import { AutoPostComposer } from "@/components/admin/AutoPostComposer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AutoPostPage() {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { data: assets } = await db
    .from("media_assets")
    .select(
      "id, url, file_name, mime_type, source_sha256, source_relative_path, active, created_at",
    )
    .eq("active", true)
    .limit(2000);
  return (
    <>
      <header>
        <p className="text-brand-700 text-sm font-bold">서울 지역 SEO 초안</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">자동 글쓰기</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          지역과 누수 유형을 고르고 사진 폴더를 선택하면, 사진 순서와 글·사진 배치를 자동으로 만든
          뒤 임시저장합니다.
        </p>
      </header>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <AutoPostComposer assets={assets ?? []} />
      </div>
    </>
  );
}
