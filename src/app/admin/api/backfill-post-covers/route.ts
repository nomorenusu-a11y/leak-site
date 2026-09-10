import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Repairs older posts that have body images but no card/OG cover image.
 * It only fills empty covers; a cover chosen by an editor is never replaced.
 */
export async function POST() {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const { data: posts, error: postsError } = await db
    .from("posts")
    .select("id, slug")
    .eq("published", true)
    .is("cover_image_url", null)
    .limit(1000);
  if (postsError) return NextResponse.json({ ok: false, error: "게시글을 불러오지 못했습니다." }, { status: 500 });
  const ids = (posts ?? []).map((post) => post.id);
  if (ids.length === 0) return NextResponse.json({ ok: true, updated: 0, missing: 0 });

  const { data: images, error: imagesError } = await db
    .from("post_images")
    .select("post_id, url, sort_order")
    .in("post_id", ids)
    .order("sort_order", { ascending: true });
  if (imagesError) return NextResponse.json({ ok: false, error: "첨부 사진을 불러오지 못했습니다." }, { status: 500 });

  const firstImage = new Map<string, string>();
  for (const image of images ?? []) {
    if (!firstImage.has(image.post_id)) firstImage.set(image.post_id, image.url);
  }
  let updated = 0;
  for (const post of posts ?? []) {
    const cover = firstImage.get(post.id);
    if (!cover) continue;
    const { error } = await db.from("posts").update({ cover_image_url: cover }).eq("id", post.id).is("cover_image_url", null);
    if (!error) updated += 1;
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/sitemap.xml");
  for (const post of posts ?? []) revalidatePath(`/posts/${post.slug}`);
  return NextResponse.json({ ok: true, updated, missing: ids.length - updated });
}
