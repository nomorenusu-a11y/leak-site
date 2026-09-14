import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildGuideContent, getPublishSlot, WEEKLY_GUIDES, type ScheduledGuide } from "@/lib/weekly-content-plan";

type Asset = { id: string; url: string; file_name: string };
type Analysis = {
  asset_id: string;
  analysis_status: string;
  work_stage: string | null;
  visible_subject_tags: string[] | null;
  leak_type_tags: string[] | null;
  confidence: number | null;
};

function kstDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00+09:00`);
  value.setUTCDate(value.getUTCDate() + days);
  return kstDate(value);
}

function weekMonday() {
  const today = kstDate(new Date());
  const noon = new Date(`${today}T12:00:00+09:00`);
  const weekday = noon.getUTCDay();
  return addDays(today, -(weekday === 0 ? 6 : weekday - 1));
}

function scoreAsset(asset: Asset, analysis: Analysis | undefined, guide: ScheduledGuide, offset: number) {
  if (!analysis || analysis.analysis_status !== "tagged") return -1;
  const tags = [...(analysis.visible_subject_tags ?? []), ...(analysis.leak_type_tags ?? [])];
  const matches = guide.keywords.reduce((sum, keyword) => sum + (tags.some((tag) => tag.includes(keyword)) ? 8 : 0), 0);
  const stageBonus = analysis.work_stage && analysis.work_stage !== "unknown" ? 2 : 0;
  const rotation = ((asset.id.charCodeAt(0) + offset) % 11) / 20;
  return matches + stageBonus + (analysis.confidence ?? 0) / 25 + rotation;
}

export async function POST() {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const [{ data: assets }, { data: analyses }] = await Promise.all([
    db.from("media_assets").select("id, url, file_name").eq("active", true).limit(2000),
    db.from("media_asset_analysis").select("asset_id, analysis_status, work_stage, visible_subject_tags, leak_type_tags, confidence").eq("analysis_status", "tagged").limit(2000),
  ]);
  const analysisByAsset = new Map((analyses ?? []).map((row) => [row.asset_id, row as Analysis]));
  const media = (assets ?? []) as Asset[];
  const monday = weekMonday();
  const created: Array<{ slug: string; title: string; publishedAt: string; images: number }> = [];
  const usedAssetIds = new Set<string>();
  for (const [index, guide] of WEEKLY_GUIDES.entries()) {
    const { dayIndex, time } = getPublishSlot(index);
    const date = addDays(monday, dayIndex);
    const publishedAt = new Date(`${date}T${time}:00+09:00`).toISOString();
    const slug = `${date.replaceAll("-", "")}-${guide.slugKey}`;
    const title = `${guide.dong} ${guide.leak} | ${guide.symptom} 점검 안내`;
    const excerpt = `${guide.district} ${guide.dong} ${guide.building}에서 ${guide.symptom}이 보일 때 ${guide.leak} 가능성을 구분하는 점검 순서와 상담 준비사항입니다.`;

    const ranked = media
      .map((asset) => ({ asset, score: scoreAsset(asset, analysisByAsset.get(asset.id), guide, index) }))
      .filter((item) => item.score >= 8)
      .sort((a, b) => Number(usedAssetIds.has(a.asset.id)) - Number(usedAssetIds.has(b.asset.id)) || b.score - a.score || a.asset.file_name.localeCompare(b.asset.file_name));
    const selected = ranked.slice(0, 4).map((item) => item.asset);
    selected.forEach((asset) => usedAssetIds.add(asset.id));

    const { data: post, error: postError } = await db.from("posts").upsert({
      title,
      slug,
      content: buildGuideContent(guide).replace(/\[\[AUTO_IMAGE_\d+\]\]/g, ""),
      excerpt,
      cover_image_url: selected[0]?.url ?? null,
      category: "leak",
      region_tags: [guide.district],
      published: true,
      published_at: publishedAt,
    }, { onConflict: "slug" }).select("id, slug, title").single();
    if (postError || !post) return NextResponse.json({ ok: false, error: `${guide.dong} 예약 저장에 실패했습니다.` }, { status: 500 });

    await db.from("post_images").delete().eq("post_id", post.id);
    const imageIds: string[] = [];
    for (const [imageIndex, asset] of selected.entries()) {
      const stage = ["증상 범위 확인", "원인 점검", "누수 탐지", "보수 범위 안내"][imageIndex];
      const { data: image } = await db.from("post_images").insert({
        post_id: post.id,
        url: asset.url,
        sort_order: imageIndex,
        alt_text: `${guide.district} ${guide.dong} ${guide.leak} ${stage} 참고 사진`,
        caption: `${guide.dong} ${guide.leak} 점검 과정의 참고 사진입니다. 실제 원인과 작업 범위는 현장 확인 결과에 따라 달라집니다.`,
        work_stage: stage,
      }).select("id").single();
      if (image) imageIds.push(image.id);
    }
    const content = buildGuideContent(guide).replace(/\[\[AUTO_IMAGE_(\d+)\]\]/g, (_, raw) => imageIds[Number(raw)] ? `[[post-image:${imageIds[Number(raw)]}]]` : "");
    await db.from("posts").update({ content, cover_image_url: selected[0]?.url ?? null }).eq("id", post.id);
    created.push({ slug: post.slug, title: post.title, publishedAt, images: imageIds.length });
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/posts/region/[region]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/posts");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true, monday, created });
}
