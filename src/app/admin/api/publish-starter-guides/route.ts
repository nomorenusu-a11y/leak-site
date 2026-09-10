import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Guide = {
  district: string;
  dong: string;
  districtSlug: string;
  dongSlug: string;
  building: string;
  leak: string;
  symptom: string;
  location: string;
  method: string;
  repair: string;
  slug: string;
  keywords: string[];
};

const GUIDES: Guide[] = [
  { district: "강남구", dong: "대치동", districtSlug: "gangnam-gu", dongSlug: "daechi-dong", building: "아파트", leak: "난방배관 누수", symptom: "보일러 압력이 계속 떨어짐", location: "거실·방 바닥", method: "압력 검사와 가스탐지", repair: "배관 상태를 확인한 뒤 필요한 범위만 부분 보수", slug: "daechi-apartment-heating-pipe-leak-guide", keywords: ["난방배관", "보일러", "바닥", "배관", "가스탐지"] },
  { district: "도봉구", dong: "쌍문동", districtSlug: "dobong-gu", dongSlug: "ssangmun-dong", building: "빌라", leak: "변기 누수", symptom: "변기 주변 바닥이 젖음", location: "욕실 바닥·벽체", method: "급수·배수 연결부와 사용 조건 점검", repair: "원인 부위를 구분한 뒤 연결부 또는 배수·방수 보수 범위 상담", slug: "ssangmun-villa-toilet-leak-guide", keywords: ["변기", "화장실", "욕실", "배수관", "바닥"] },
  { district: "마포구", dong: "연남동", districtSlug: "mapo-gu", dongSlug: "yeonnam-dong", building: "오피스텔", leak: "싱크대 누수", symptom: "주방 하부장과 벽면이 젖음", location: "주방 싱크대 주변", method: "급수 호스·배수관·싱크볼 연결부 점검", repair: "누수 위치 확인 후 밸브·연결부 또는 배수관 보수 여부 안내", slug: "yeonnam-officetel-kitchen-sink-leak-guide", keywords: ["싱크대", "주방", "배수관", "수전", "배관"] },
  { district: "송파구", dong: "문정동", districtSlug: "songpa-gu", dongSlug: "munjeong-dong", building: "아파트", leak: "온수배관 누수", symptom: "아랫집 천장에 물자국이 생김", location: "아랫집 천장", method: "온수 사용 조건 확인과 압력 검사", repair: "원인 범위를 좁힌 뒤 필요한 경우 부분 굴착·배관 보수 상담", slug: "munjeong-apartment-hot-water-pipe-leak-guide", keywords: ["온수배관", "천장", "아랫집", "배관", "압력"] },
  { district: "은평구", dong: "불광동", districtSlug: "eunpyeong-gu", dongSlug: "bulgwang-dong", building: "단독주택", leak: "수도계량기·직수관 누수", symptom: "물을 사용하지 않아도 계량기가 계속 돌아감", location: "계량기함·공용부", method: "계량기 변화와 밸브·직수관 상태 점검", repair: "계량기함과 배관 계통을 구분해 확인한 뒤 필요한 보수 범위 안내", slug: "bulgwang-house-water-meter-leak-guide", keywords: ["수도계량기", "계량기", "직수관", "밸브", "수도배관"] },
];

type Analysis = {
  asset_id: string;
  analysis_status: string;
  work_stage: string | null;
  visible_subject_tags: string[] | null;
  leak_type_tags: string[] | null;
  confidence: number | null;
};

type Asset = { id: string; url: string; file_name: string; active: boolean };

function pageContent(guide: Guide) {
  const place = `${guide.dong} ${guide.building}`;
  return `## ${guide.symptom}이 보일 때 먼저 확인할 점\n\n${place}에서 ${guide.symptom}이 보인다고 해서 바로 ${guide.leak}으로 단정할 수는 없습니다. 물이 보이는 ${guide.location}과 실제 원인 위치가 다를 수 있어, 물을 사용한 시간·보일러 작동 여부·비가 온 날처럼 증상이 달라지는 조건을 함께 확인합니다.\n\n[[AUTO_IMAGE_0]]\n\n## ${guide.dong} ${guide.leak} 점검 방향\n\n${guide.method}을 통해 급수·온수·난방·배수 계통 가운데 어디에서 변화가 생기는지 비교합니다. 한 가지 반응만 보고 공사 범위를 정하지 않고, 건물 구조와 주변 마감 상태를 함께 살펴 원인 범위를 좁혀 갑니다.\n\n[[AUTO_IMAGE_1]]\n\n## ${guide.location} 누수, 이렇게 구분합니다\n\n${guide.location}에 생긴 물기나 얼룩은 배관 문제 외에도 연결부, 배수, 방수 또는 외부 유입과 관련될 수 있습니다. ${guide.leak} 가능성이 의심될 때는 현장 점검에서 확인된 위치와 사용 조건을 바탕으로 설명드리며, 불필요하게 넓은 철거를 먼저 권하지 않습니다.\n\n[[AUTO_IMAGE_2]]\n\n## 보수와 복구 상담\n\n${guide.repair}합니다. 증상이 계속되거나 피해 범위가 넓어지는 경우에는 현재 상태가 보이는 사진과 함께 문의해 주세요. 상담은 **010-5700-4026**으로 가능합니다.\n\n## 자주 묻는 질문\n\n### ${guide.dong} ${guide.leak}, 당장 공사를 해야 하나요?\n\n증상만으로 공사 범위를 정하지 않습니다. 먼저 점검으로 원인 계통과 위치를 확인한 뒤 필요한 보수 방향을 안내합니다.\n\n### 아랫집이나 이웃집 피해가 있으면 무엇을 준비하면 좋나요?\n\n물자국 위치, 언제부터 생겼는지, 물·온수·보일러 사용과의 관계를 알려 주시면 점검 방향을 정하는 데 도움이 됩니다.\n\n## 관련 지역 안내\n\n- [${guide.dong} 누수탐지](/seoul/${guide.districtSlug}/${guide.dongSlug})\n- [${guide.district} 누수탐지](/seoul/${guide.districtSlug})`;
}

function scoreAsset(asset: Asset, analysis: Analysis | undefined, guide: Guide) {
  if (!analysis || analysis.analysis_status !== "tagged") return -1;
  const tags = [...(analysis.visible_subject_tags ?? []), ...(analysis.leak_type_tags ?? [])];
  const score = guide.keywords.reduce((total, keyword) => total + (tags.some((tag) => tag.includes(keyword)) ? 4 : 0), 0);
  return score + Math.max(0, (analysis.confidence ?? 0) / 25);
}

export async function POST() {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const [{ data: drafts, error: draftError }, { data: assets }, { data: analyses }] = await Promise.all([
    db.from("posts").select("id").eq("published", false),
    db.from("media_assets").select("id, url, file_name, active").eq("active", true).limit(2000),
    db.from("media_asset_analysis").select("asset_id, analysis_status, work_stage, visible_subject_tags, leak_type_tags, confidence").eq("analysis_status", "tagged").limit(2000),
  ]);
  if (draftError) return NextResponse.json({ ok: false, error: "임시저장 글을 확인하지 못했습니다." }, { status: 500 });

  const draftIds = (drafts ?? []).map((draft) => draft.id);
  if (draftIds.length > 0) {
    const { error } = await db.from("posts").delete().in("id", draftIds);
    if (error) return NextResponse.json({ ok: false, error: "기존 임시저장 글 삭제에 실패했습니다." }, { status: 500 });
  }

  const analysisByAsset = new Map((analyses ?? []).map((analysis) => [analysis.asset_id, analysis as Analysis]));
  const activeAssets = (assets ?? []) as Asset[];
  const created: Array<{ slug: string; title: string; images: number }> = [];

  for (const guide of GUIDES) {
    const content = pageContent(guide);
    const { data: post, error: createError } = await db.from("posts").upsert({
      title: `${guide.dong} ${guide.building} ${guide.leak} | ${guide.symptom} 점검 안내`,
      slug: guide.slug,
      content: content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, ""),
      excerpt: `${guide.dong} ${guide.building}에서 ${guide.symptom}이 보일 때 ${guide.leak} 가능성을 점검하는 방법을 안내합니다.`,
      category: "leak",
      region_tags: [guide.district],
      published: true,
      published_at: new Date().toISOString(),
    }, { onConflict: "slug" }).select("id, slug, title").single();
    if (createError || !post) return NextResponse.json({ ok: false, error: `${guide.dong} 글 저장에 실패했습니다.` }, { status: 500 });

    await db.from("post_images").delete().eq("post_id", post.id);
    const matched = activeAssets
      .map((asset) => ({ asset, score: scoreAsset(asset, analysisByAsset.get(asset.id), guide) }))
      .filter((entry) => entry.score >= 4)
      .sort((a, b) => b.score - a.score || a.asset.file_name.localeCompare(b.asset.file_name))
      .slice(0, 3)
      .map((entry) => entry.asset);

    const imageIds: string[] = [];
    for (const [index, asset] of matched.entries()) {
      const stage = ["증상 위치 확인", "점검 과정", "보수 방향 상담"][index] ?? "점검 안내";
      const { data: image } = await db.from("post_images").insert({
        post_id: post.id,
        url: asset.url,
        sort_order: index,
        alt_text: `${guide.dong} ${guide.leak} ${stage} 참고 사진`,
        caption: `${guide.dong} ${guide.leak} 점검 안내를 위한 참고 사진입니다. 실제 원인과 작업 범위는 현장 확인 후 안내합니다.`,
        work_stage: stage,
      }).select("id").single();
      if (image) imageIds.push(image.id);
    }

    const rendered = content.replace(/\[\[AUTO_IMAGE_(\d+)\]\]/g, (_, raw) => imageIds[Number(raw)] ? `[[post-image:${imageIds[Number(raw)]}]]` : "");
    await db.from("posts").update({ content: rendered, published: true, published_at: new Date().toISOString() }).eq("id", post.id);
    created.push({ slug: post.slug, title: post.title, images: imageIds.length });
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/posts");
  for (const item of created) revalidatePath(`/posts/${item.slug}`);
  return NextResponse.json({ ok: true, deletedDrafts: draftIds.length, created });
}
