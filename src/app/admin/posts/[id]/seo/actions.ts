"use server";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { regionAncestors, regionById } from "@/lib/regions";
import { validTermIds } from "@/lib/seo/taxonomy";
import { revalidateRegionTree } from "@/lib/revalidation";
import { revalidatePath } from "next/cache";
export async function savePostSeo(
  postId: string,
  regionId: string,
  termIds: string[],
  verified: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (
    !z.string().uuid().safeParse(postId).success ||
    !Array.isArray(termIds) ||
    !validTermIds(termIds) ||
    verified !== true
  ) {
    return { ok: false, error: "실제 현장 기록을 확인한 뒤 분류를 저장해 주세요." };
  }
  const region = regionId ? regionById(regionId) : null;
  if (regionId && (!region || region.level === "city"))
    return { ok: false, error: "서울의 실제 구 또는 법정동을 선택해 주세요." };
  const db = createSupabaseAdminClient();
  const { error } = await db.rpc("set_post_seo", {
    p_post_id: postId,
    p_region_id: regionId || null,
    p_term_ids: termIds,
  });
  if (error) {
    console.warn("[post-seo]", error.code);
    return {
      ok: false,
      error: "분류를 저장하지 못했습니다. SEO migration 적용 여부와 연결 상태를 확인해 주세요.",
    };
  }
  if (region) {
    const regionIds = regionAncestors(region).map((ancestor) => ancestor.id);
    const { error: indexError } = await db
      .from("region_pages")
      .update({ indexable: true, updated_at: new Date().toISOString() })
      .in("region_id", regionIds);
    if (indexError) console.warn("[post-seo:indexable]", indexError.code);
    revalidateRegionTree(region);
  }
  revalidatePath("/posts/[slug]", "page");
  revalidatePath(`/admin/posts/${postId}/seo`);
  revalidatePath("/admin/posts");
  return { ok: true };
}
