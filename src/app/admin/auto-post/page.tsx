import { assertAdmin } from "@/lib/auth";
import { AutoPostComposer } from "@/components/admin/AutoPostComposer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MediaAsset, MediaAssetAnalysis } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AutoPostPage() {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const [{ data: assets }, { data: analyses }] = await Promise.all([
    db
      .from("media_assets")
      .select("id, url, file_name, mime_type, source_sha256, source_relative_path, active, created_at")
      .eq("active", true)
      .limit(2000),
    db
      .from("media_asset_analysis")
      .select("asset_id, analysis_status, work_stage, visible_subject_tags, leak_type_tags, symptom_tags, confidence")
      .in("analysis_status", ["tagged", "needs_review"])
      .limit(2000),
  ]);
  type SelectionAnalysis = Pick<MediaAssetAnalysis, "analysis_status" | "work_stage" | "visible_subject_tags" | "leak_type_tags" | "symptom_tags" | "confidence">;
  const analysisByAssetId = new Map((analyses ?? []).map((analysis) => [analysis.asset_id, analysis as SelectionAnalysis]));
  const analyzedAssets = ((assets ?? []) as MediaAsset[]).map((asset) => ({ ...asset, analysis: analysisByAssetId.get(asset.id) ?? null }));
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
        <AutoPostComposer assets={analyzedAssets} />
      </div>
    </>
  );
}
