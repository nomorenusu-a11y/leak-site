import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildGuideContent,
  buildGuideExcerpt,
  buildGuideTitle,
  CAMPAIGN_GUIDES,
  CAMPAIGN_START_DATE,
  getPublishSlot,
  getScheduledContentType,
  type ScheduledGuide,
  validateGuideDraft,
} from "@/lib/weekly-content-plan";

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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00+09:00`);
  value.setUTCDate(value.getUTCDate() + days);
  return kstDate(value);
}

function scoreAsset(
  asset: Asset,
  analysis: Analysis | undefined,
  guide: ScheduledGuide,
  offset: number,
) {
  if (!analysis || analysis.analysis_status !== "tagged") return -1;
  const tags = [...(analysis.visible_subject_tags ?? []), ...(analysis.leak_type_tags ?? [])];
  const matches = guide.keywords.reduce(
    (sum, keyword) => sum + (tags.some((tag) => tag.includes(keyword)) ? 8 : 0),
    0,
  );
  const stageBonus = analysis.work_stage && analysis.work_stage !== "unknown" ? 2 : 0;
  const rotation = ((asset.id.charCodeAt(0) + offset) % 11) / 20;
  return matches + stageBonus + (analysis.confidence ?? 0) / 25 + rotation;
}

export async function POST() {
  const session = await readAdminSession();
  if (!session.ok)
    return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const [{ data: assets }, { data: analyses }] = await Promise.all([
    db.from("media_assets").select("id, url, file_name").eq("active", true).limit(2000),
    db
      .from("media_asset_analysis")
      .select(
        "asset_id, analysis_status, work_stage, visible_subject_tags, leak_type_tags, confidence",
      )
      .eq("analysis_status", "tagged")
      .limit(2000),
  ]);
  const analysisByAsset = new Map((analyses ?? []).map((row) => [row.asset_id, row as Analysis]));
  const media = (assets ?? []) as Asset[];
  const usedAssetIds = new Set<string>();
  const prepared = CAMPAIGN_GUIDES.map((guide, index) => {
    const { dayIndex, time } = getPublishSlot(index);
    const date = addDays(CAMPAIGN_START_DATE, dayIndex);
    const publishedAt = new Date(`${date}T${time}:00+09:00`).toISOString();
    const slug = `${date.replaceAll("-", "")}-${guide.slugKey}`;
    const contentType = getScheduledContentType(index);
    const title = buildGuideTitle(guide, contentType);
    const excerpt = buildGuideExcerpt(guide, contentType);
    const content = buildGuideContent(guide, contentType);

    const ranked = media
      .map((asset) => ({
        asset,
        score: scoreAsset(asset, analysisByAsset.get(asset.id), guide, index),
      }))
      .filter((item) => item.score >= 8)
      .sort(
        (a, b) =>
          Number(usedAssetIds.has(a.asset.id)) - Number(usedAssetIds.has(b.asset.id)) ||
          b.score - a.score ||
          a.asset.file_name.localeCompare(b.asset.file_name),
      );
    const selected = ranked.slice(0, 4).map((item) => item.asset);
    selected.forEach((asset) => usedAssetIds.add(asset.id));
    return { guide, selected, publishedAt, slug, title, excerpt, content, contentType };
  });

  const invalidDrafts = prepared
    .map((item) => ({
      title: item.title,
      errors: validateGuideDraft({
        guide: item.guide,
        type: item.contentType,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
      }),
    }))
    .filter((item) => item.errors.length > 0);
  const duplicateKeys = prepared
    .map(
      (item) =>
        `${item.guide.district}|${item.guide.dong}|${item.guide.leak}|${item.guide.symptom}`,
    )
    .filter((key, index, all) => all.indexOf(key) !== index);
  const duplicateTitles = prepared
    .map((item) => item.title.replace(/[^가-힣a-z0-9]/gi, "").toLowerCase())
    .filter((title, index, all) => all.indexOf(title) !== index);
  if (duplicateKeys.length || duplicateTitles.length) {
    return NextResponse.json(
      { ok: false, error: "같은 지역·증상 조합 또는 같은 제목이 있어 예약 저장을 중단했습니다." },
      { status: 422 },
    );
  }
  if (invalidDrafts.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `품질 기준을 통과하지 못한 예약 글이 ${invalidDrafts.length}개입니다.`,
        items: invalidDrafts.slice(0, 10),
      },
      { status: 422 },
    );
  }

  const insufficientImages = prepared.filter(({ selected }) => selected.length < 2);
  if (insufficientImages.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `관련 사진이 2장 미만인 글이 ${insufficientImages.length}개라 예약 저장을 중단했습니다. 사진 분석 결과를 보완한 뒤 다시 실행해 주세요.`,
        items: insufficientImages.slice(0, 10).map(({ guide, selected }) => ({
          title: `${guide.dong} ${guide.leak}`,
          images: selected.length,
        })),
      },
      { status: 422 },
    );
  }

  const desiredSlugs = new Set(prepared.map((item) => item.slug));
  const campaignKeys = new Set(CAMPAIGN_GUIDES.map((guide) => guide.slugKey));
  const { data: existingCampaign, error: existingError } = await db
    .from("posts")
    .select("id, slug")
    .like("slug", "202609%");
  if (existingError)
    return NextResponse.json(
      { ok: false, error: "기존 9월 예약 확인에 실패했습니다." },
      { status: 500 },
    );
  const staleIds = (existingCampaign ?? [])
    .filter(
      (post) =>
        !desiredSlugs.has(post.slug) &&
        [...campaignKeys].some((key) => post.slug.endsWith(`-${key}`)),
    )
    .map((post) => post.id);
  if (staleIds.length) {
    const { error: staleError } = await db.from("posts").delete().in("id", staleIds);
    if (staleError)
      return NextResponse.json(
        { ok: false, error: "잘못 배치된 기존 예약 정리에 실패했습니다." },
        { status: 500 },
      );
  }

  const baseRows = prepared.map(
    ({ guide, selected, publishedAt, slug, title, excerpt, content }) => ({
      title,
      slug,
      content: content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, ""),
      excerpt,
      cover_image_url: selected[0]?.url ?? null,
      category: "leak",
      region_tags: [guide.district],
      published: true,
      published_at: publishedAt,
    }),
  );
  const { data: posts, error: postsError } = await db
    .from("posts")
    .upsert(baseRows, { onConflict: "slug" })
    .select("id, slug, title");
  if (postsError || !posts || posts.length !== prepared.length) {
    return NextResponse.json(
      { ok: false, error: "9월 예약 게시물 묶음 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  const postBySlug = new Map(posts.map((post) => [post.slug, post]));
  const postIds = posts.map((post) => post.id);
  const { error: deleteError } = await db.from("post_images").delete().in("post_id", postIds);
  if (deleteError)
    return NextResponse.json(
      { ok: false, error: "기존 예약 사진 정리에 실패했습니다." },
      { status: 500 },
    );

  const stages = ["증상 범위 확인", "원인 점검", "누수 탐지", "보수 범위 안내"];
  const imageRows = prepared.flatMap(({ guide, selected, slug }) => {
    const post = postBySlug.get(slug);
    if (!post) return [];
    return selected.map((asset, imageIndex) => {
      const stage = stages[imageIndex];
      return {
        post_id: post.id,
        url: asset.url,
        sort_order: imageIndex,
        alt_text: `${guide.district} ${guide.dong} ${guide.leak} ${stage} 참고 사진`,
        caption: `${guide.dong} ${guide.leak} 점검 과정의 참고 사진입니다. 실제 원인과 작업 범위는 현장 확인 결과에 따라 달라집니다.`,
        work_stage: stage,
      };
    });
  });
  const { data: insertedImages, error: imagesError } = imageRows.length
    ? await db.from("post_images").insert(imageRows).select("id, post_id, sort_order")
    : { data: [], error: null };
  if (imagesError)
    return NextResponse.json(
      { ok: false, error: "예약 사진 묶음 저장에 실패했습니다." },
      { status: 500 },
    );

  const imageIdBySlot = new Map(
    (insertedImages ?? []).map((image) => [`${image.post_id}:${image.sort_order}`, image.id]),
  );
  const finalRows = prepared.map(
    ({ guide, selected, publishedAt, slug, title, excerpt, content }) => {
      const post = postBySlug.get(slug)!;
      const contentWithImages = content.replace(/\[\[AUTO_IMAGE_(\d+)\]\]/g, (_, raw) => {
        const id = imageIdBySlot.get(`${post.id}:${Number(raw)}`);
        return id ? `[[post-image:${id}]]` : "";
      });
      return {
        title,
        slug,
        content: contentWithImages,
        excerpt,
        cover_image_url: selected[0]?.url ?? null,
        category: "leak",
        region_tags: [guide.district],
        published: true,
        published_at: publishedAt,
      };
    },
  );
  const { error: finalError } = await db.from("posts").upsert(finalRows, { onConflict: "slug" });
  if (finalError)
    return NextResponse.json(
      { ok: false, error: "사진이 포함된 본문 저장에 실패했습니다." },
      { status: 500 },
    );

  const created = prepared.map(({ slug, title, publishedAt, selected, contentType }) => ({
    slug,
    title,
    publishedAt,
    images: selected.length,
    contentType,
  }));

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/posts/region/[region]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/posts");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({
    ok: true,
    startDate: CAMPAIGN_START_DATE,
    endDate: "2026-09-30",
    removed: staleIds.length,
    created,
  });
}
