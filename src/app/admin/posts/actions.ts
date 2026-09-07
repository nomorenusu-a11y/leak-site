"use server";

import { revalidatePilot } from "@/lib/revalidation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PostInsert } from "@/types/database";
import { CITY_REGION_TAGS } from "@/lib/city";
import type { PostActionResult, PostFormFieldErrors } from "./types";

const ALLOWED_REGION_TAGS: ReadonlySet<string> = new Set<string>(Object.values(CITY_REGION_TAGS));
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const idSchema = z.string().uuid();
const imageMetadataSchema = z.object({
  alt_text: z.string().trim().max(180).transform((value) => value || null),
  caption: z.string().trim().max(240).transform((value) => value || null),
  work_stage: z.string().trim().max(80).transform((value) => value || null),
  overlay_text: z.string().trim().max(80).transform((value) => value || null),
});
const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "영문 소문자·숫자·하이픈만 가능");

const postSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: slugSchema,
  content: z.string().trim().min(20).max(20000),
  excerpt: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : undefined)),
  cover_image_url: z
    .string()
    .url()
    .or(z.literal(""))
    .optional()
    .transform((v) => (v ? v : undefined)),
  category: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
  region_tags: z.array(z.string()).max(10).default([]),
  published: z.boolean().default(true),
});

function flattenErrors(err: z.ZodError): PostFormFieldErrors {
  const fe: PostFormFieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fe)) {
      (fe as Record<string, string>)[key] = issue.message;
    }
  }
  return fe;
}

function sanitizeRegionTags(tags: string[]): string[] {
  return Array.from(
    new Set(tags.filter((t) => typeof t === "string" && ALLOWED_REGION_TAGS.has(t))),
  );
}

function revalidatePosts(slug?: string) {
  revalidatePilot();
  revalidatePath("/");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/admin/posts");
  revalidatePath("/posts");
  revalidatePath("/posts/region/[region]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/posts/${slug}`);
}

// ============================================================
// CRUD
// ============================================================

export async function createPost(input: z.input<typeof postSchema>): Promise<PostActionResult> {
  await assertAdmin();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력값을 확인해 주세요.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }
  const data = parsed.data;
  const supabase = createSupabaseAdminClient();
  const row: PostInsert = {
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt ?? null,
    cover_image_url: data.cover_image_url ?? null,
    category: data.category ?? null,
    region_tags: sanitizeRegionTags(data.region_tags),
    published: data.published,
    published_at: new Date().toISOString(),
  };
  const { data: created, error } = await supabase
    .from("posts")
    .insert(row)
    .select("id, slug")
    .single();
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "이미 같은 슬러그가 존재합니다.",
        fieldErrors: { slug: "이미 존재하는 슬러그" },
      };
    }
    console.error("[admin/posts] create:", error);
    return { ok: false, error: "저장 실패" };
  }
  revalidatePosts(created.slug);
  return { ok: true, postId: created.id, slug: created.slug };
}

export async function updatePost(
  id: string,
  input: z.input<typeof postSchema>,
): Promise<PostActionResult> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력값을 확인해 주세요.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }
  const data = parsed.data;
  const supabase = createSupabaseAdminClient();
  const { data: updated, error } = await supabase
    .from("posts")
    .update({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt ?? null,
      cover_image_url: data.cover_image_url ?? null,
      category: data.category ?? null,
      region_tags: sanitizeRegionTags(data.region_tags),
      published: data.published,
    })
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "이미 같은 슬러그가 존재합니다.",
        fieldErrors: { slug: "이미 존재하는 슬러그" },
      };
    }
    console.error("[admin/posts] update:", error);
    return { ok: false, error: "저장 실패" };
  }
  revalidatePosts(updated.slug);
  return { ok: true, postId: updated.id, slug: updated.slug };
}

// ============================================================
// Storage helpers
// ============================================================

const POST_IMAGE_PUBLIC_PREFIX = "/object/public/post-images/";

function storagePathFromPublicUrl(url: string): string | null {
  const i = url.indexOf(POST_IMAGE_PUBLIC_PREFIX);
  if (i < 0) return null;
  return url.slice(i + POST_IMAGE_PUBLIC_PREFIX.length);
}

function extFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function buildPostImagePath(postId: string | null, mime: string): string {
  const folder = postId ?? "drafts";
  const ts = Date.now();
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `posts/${folder}/${ts}-${rand}.${extFromMime(mime)}`;
}

function validateImage(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file || file.size === 0) return { ok: false, error: "파일이 없습니다." };
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { ok: false, error: "JPG, PNG, WEBP 이미지만 가능합니다." };
  }
  if (file.size > MAX_BYTES) return { ok: false, error: "파일은 5MB 이내여야 합니다." };
  return { ok: true };
}

export async function uploadCoverImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "파일이 없습니다." };
  const check = validateImage(file);
  if (!check.ok) return check;

  const supabase = createSupabaseAdminClient();
  const path = buildPostImagePath(null, file.type);
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[admin/posts] upload cover:", error);
    return { ok: false, error: "업로드 실패" };
  }
  const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}

export async function uploadPostImage(
  postId: string,
  formData: FormData,
): Promise<
  | {
      ok: true;
      image: {
        id: string;
        url: string;
        sort_order: number;
        alt_text: string | null;
        caption: string | null;
        work_stage: string | null;
        image_variant: "original" | "annotated";
        overlay_text: string | null;
      };
    }
  | { ok: false; error: string }
> {
  await assertAdmin();
  if (!idSchema.safeParse(postId).success) return { ok: false, error: "잘못된 글 ID" };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "파일이 없습니다." };
  const check = validateImage(file);
  if (!check.ok) return check;

  const supabase = createSupabaseAdminClient();
  const path = buildPostImagePath(postId, file.type);
  const { error: upErr } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) {
    console.error("[admin/posts] upload post image:", upErr);
    return { ok: false, error: "업로드 실패" };
  }
  const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);

  // 다음 sort_order 결정
  const { data: lastOrder } = await supabase
    .from("post_images")
    .select("sort_order")
    .eq("post_id", postId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (lastOrder?.sort_order ?? -1) + 1;

  const { data: created, error: insErr } = await supabase
    .from("post_images")
    .insert({ post_id: postId, url: pub.publicUrl, sort_order: nextOrder })
    .select("id, url, sort_order, alt_text, caption, work_stage, image_variant, overlay_text")
    .single();
  if (insErr || !created) {
    // 업로드 성공했는데 DB 실패 → 파일 정리
    await supabase.storage.from("post-images").remove([path]);
    console.error("[admin/posts] insert image row:", insErr);
    return { ok: false, error: "이미지 등록 실패" };
  }
  revalidatePosts();
  return { ok: true, image: created };
}

export async function deletePostImage(
  imageId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (!idSchema.safeParse(imageId).success) return { ok: false, error: "잘못된 ID" };
  const supabase = createSupabaseAdminClient();
  const { data: img, error: getErr } = await supabase
    .from("post_images")
    .select("url, post_id")
    .eq("id", imageId)
    .maybeSingle();
  if (getErr || !img) return { ok: false, error: "이미지를 찾을 수 없음" };

  const path = storagePathFromPublicUrl(img.url);
  if (path) await supabase.storage.from("post-images").remove([path]);
  const { error: delErr } = await supabase.from("post_images").delete().eq("id", imageId);
  if (delErr) return { ok: false, error: "DB 삭제 실패" };
  revalidatePosts();
  return { ok: true };
}

/**
 * 사진 자체는 바꾸지 않고 설명 메타데이터만 저장한다.
 * 원본 사진의 alt/caption과 강조 derivative의 overlay_text를 분리해 관리한다.
 */
export async function updatePostImageMetadata(
  imageId: string,
  input: z.input<typeof imageMetadataSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (!idSchema.safeParse(imageId).success) return { ok: false, error: "잘못된 이미지 ID" };
  const parsed = imageMetadataSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "이미지 설명은 정해진 글자 수 안에서 입력해 주세요." };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("post_images")
    .update(parsed.data)
    .eq("id", imageId);
  if (error) {
    console.error("[admin/posts] image metadata:", error);
    return { ok: false, error: "이미지 설명 저장 실패" };
  }
  revalidatePosts();
  return { ok: true };
}

export async function deletePost(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };

  const supabase = createSupabaseAdminClient();
  // 1) post + 이미지 URL들 수집
  const { data: post } = await supabase
    .from("posts")
    .select("slug, cover_image_url")
    .eq("id", id)
    .maybeSingle();
  const { data: images } = await supabase.from("post_images").select("url").eq("post_id", id);

  // 2) Storage 파일 일괄 삭제 (cover + post_images)
  const allUrls = [post?.cover_image_url, ...(images?.map((i) => i.url) ?? [])].filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  );
  const paths = allUrls
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => typeof p === "string");
  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage.from("post-images").remove(paths);
    if (storageErr) {
      console.warn("[admin/posts] storage cleanup partial:", storageErr.message);
    }
  }

  // 3) DB row 삭제 (FK ON DELETE CASCADE로 post_images도 함께)
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[admin/posts] delete:", error);
    return { ok: false, error: "삭제 실패" };
  }
  revalidatePosts(post?.slug);
  return { ok: true };
}
