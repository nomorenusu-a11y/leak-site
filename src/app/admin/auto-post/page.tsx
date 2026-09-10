import Link from "next/link";
import { ClipboardCheck, Images } from "lucide-react";
import { assertAdmin } from "@/lib/auth";
import { AutoPostComposer } from "@/components/admin/AutoPostComposer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MediaAsset, MediaAssetAnalysis } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AutoPostPage() {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const [{ data: assets }, { data: analyses }, { data: recentPosts }] = await Promise.all([
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
    db
      .from("posts")
      .select("title")
      .order("updated_at", { ascending: false })
      .limit(1000),
  ]);
  type SelectionAnalysis = Pick<MediaAssetAnalysis, "analysis_status" | "work_stage" | "visible_subject_tags" | "leak_type_tags" | "symptom_tags" | "confidence">;
  const analysisByAssetId = new Map((analyses ?? []).map((analysis) => [analysis.asset_id, analysis as SelectionAnalysis]));
  const analyzedAssets = ((assets ?? []) as MediaAsset[]).map((asset) => ({ ...asset, analysis: analysisByAssetId.get(asset.id) ?? null }));
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-brand-700 text-sm font-bold">서울 지역 SEO 초안</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">자동 글쓰기</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            지역·건물·증상·누수 유형을 고르면 모바일 자연검색에서 읽히는 제목, 글·사진 흐름, 지역 내부링크를 자동으로 만듭니다. 기존 제목과 유사하면 저장 전에 알려드립니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/posts?status=draft" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"><ClipboardCheck size={16} /> 발행 대기함</Link><Link href="/admin/media" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"><Images size={16} /> 사진 라이브러리</Link></div>
      </header>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <AutoPostComposer assets={analyzedAssets} existingTitles={(recentPosts ?? []).map((post) => post.title)} />
      </div>
    </>
  );
}
