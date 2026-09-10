import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { MediaLibraryUploader } from "@/components/admin/MediaLibraryUploader";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { count } = await db
    .from("media_assets")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  return (
    <>
      <header>
        <p className="text-brand-700 text-sm font-bold">자동 사진 선택용</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">사진 라이브러리</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          폴더를 한 번 등록하면 이후 자동 글쓰기에서 지역과 누수 유형만 골라 사진을 무작위로
          배치합니다.
        </p>
      </header>
      <div className="mt-6">
        <MediaLibraryUploader assetCount={count ?? 0} />
      </div>
    </>
  );
}
