import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { publicEnv } from "@/lib/env";
import { getPostsByRegionTag } from "@/lib/posts";
import type { Region } from "@/types/seo";
import type { Post } from "@/types/database";

export async function getRegionPosts(
  region: Region,
): Promise<{ posts: Post[]; unavailable: boolean }> {
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return { posts: [], unavailable: true };
  const { data, error } = await createSupabaseAnonClient()
    .rpc("get_region_posts", { p_region_id: region.id })
    .order("published_at", { ascending: false })
    .order("id")
    .limit(12);
  if (error) {
    // Existing district tags support the district hub only. Never guess a legal dong.
    if ((error.code === "PGRST202" || error.code === "42883") && region.level !== "dong") {
      const old = await getPostsByRegionTag("도봉구");
      return { posts: old.posts, unavailable: false };
    }
    console.warn("[region-posts]", error.code);
    return { posts: [], unavailable: true };
  }
  return {
    posts: (data ?? []).map((p) => ({
      ...p,
      cover_image_url: /placehold\.co/i.test(p.cover_image_url ?? "") ? null : p.cover_image_url,
    })),
    unavailable: false,
  };
}
export async function getPostLocation(postId: string) {
  const { data, error } = await createSupabaseAnonClient()
    .from("post_locations")
    .select("*")
    .eq("post_id", postId)
    .maybeSingle();
  if (error) return null; // Additive rollout: original case remains available before migration.
  return data;
}
