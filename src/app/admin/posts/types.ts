/**
 * 'use server' 파일은 async function만 export 가능 (Next.js 16 server action 규칙).
 * 따라서 actions.ts와 동거할 수 없는 타입은 이 파일로 분리.
 */

export type PostFormFieldErrors = Partial<
  Record<"title" | "slug" | "content" | "excerpt" | "cover_image_url" | "category" | "region_tags" | "published", string>
>;

export type PostActionResult =
  | { ok: true; postId: string; slug: string }
  | { ok: false; error: string; fieldErrors?: PostFormFieldErrors };
