"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024;

function extension(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadMediaAsset(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "사진 파일이 없습니다." };
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { ok: false, error: "JPG, PNG, WEBP 사진만 등록할 수 있습니다." };
  }
  if (file.size > MAX_BYTES) return { ok: false, error: "사진 한 장은 5MB 이하여야 합니다." };

  const db = createSupabaseAdminClient();
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  const path = `assets/${Date.now()}-${random}.${extension(file.type)}`;
  const { error: uploadError } = await db.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: "사진 업로드에 실패했습니다." };

  const { data: publicUrl } = db.storage.from("post-images").getPublicUrl(path);
  const { error: insertError } = await db.from("media_assets").insert({
    url: publicUrl.publicUrl,
    file_name: file.name,
    mime_type: file.type as "image/jpeg" | "image/png" | "image/webp",
  });
  if (insertError) {
    await db.storage.from("post-images").remove([path]);
    return { ok: false, error: "사진 목록 저장에 실패했습니다." };
  }
  revalidatePath("/admin/media");
  revalidatePath("/admin/auto-post");
  return { ok: true };
}

export async function attachMediaAssetToPost(input: {
  postId: string;
  assetId: string;
  altText: string;
  caption: string;
  workStage: string;
}): Promise<{ ok: true; imageId: string } | { ok: false; error: string }> {
  await assertAdmin();
  const id = z.string().uuid();
  if (!id.safeParse(input.postId).success || !id.safeParse(input.assetId).success) {
    return { ok: false, error: "사진 또는 게시글 정보가 올바르지 않습니다." };
  }
  const db = createSupabaseAdminClient();
  const { data: asset } = await db
    .from("media_assets")
    .select("url")
    .eq("id", input.assetId)
    .eq("active", true)
    .maybeSingle();
  if (!asset) return { ok: false, error: "사진 라이브러리에서 이미지를 찾지 못했습니다." };

  const { data: latest } = await db
    .from("post_images")
    .select("sort_order")
    .eq("post_id", input.postId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: image, error } = await db
    .from("post_images")
    .insert({
      post_id: input.postId,
      url: asset.url,
      sort_order: (latest?.sort_order ?? -1) + 1,
      alt_text: input.altText.slice(0, 180),
      caption: input.caption.slice(0, 240),
      work_stage: input.workStage.slice(0, 80),
    })
    .select("id")
    .single();
  if (error || !image) return { ok: false, error: "게시글 사진 연결에 실패했습니다." };
  revalidatePath(`/admin/posts/${input.postId}/edit`);
  revalidatePath(`/posts/[slug]`, "page");
  return { ok: true, imageId: image.id };
}
