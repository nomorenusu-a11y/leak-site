/**
 * 게시판·실시간 보드용 read-only 쿼리 헬퍼.
 *
 * RLS가 published=true / visible_on_board=true 행만 노출하므로 anon 키로 충분.
 * 빌드 시점·SSG·ISR 어디서나 호출 가능 (쿠키 불필요).
 */

import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import type {
  LeakRequestBoardItem,
  Post,
  PostImage,
  RequestStatus,
} from "@/types/database";

export const POSTS_PER_PAGE = 12;
export const BOARD_LIMIT = 10;

export type GetPostsArgs = { page?: number; perPage?: number };

export type PostListResult = {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

function emptyList(page: number, perPage: number): PostListResult {
  return { posts: [], total: 0, page, perPage, totalPages: 1 };
}

export async function getPublishedPosts({
  page = 1,
  perPage = POSTS_PER_PAGE,
}: GetPostsArgs = {}): Promise<PostListResult> {
  const supabase = createSupabaseAnonClient();
  const offset = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + perPage - 1);
  if (error) {
    console.warn("[posts] getPublishedPosts:", error.message);
    return emptyList(page, perPage);
  }
  const total = count ?? 0;
  return {
    posts: data ?? [],
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.warn("[posts] getPostBySlug:", error.message);
    return null;
  }
  return data;
}

export async function getPostImages(postId: string): Promise<PostImage[]> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("post_images")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order");
  if (error) {
    console.warn("[posts] getPostImages:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPostsByRegionTag(
  tag: string,
  { page = 1, perPage = POSTS_PER_PAGE }: GetPostsArgs = {},
): Promise<PostListResult> {
  const supabase = createSupabaseAnonClient();
  const offset = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .contains("region_tags", [tag])
    .order("published_at", { ascending: false })
    .range(offset, offset + perPage - 1);
  if (error) {
    console.warn("[posts] getPostsByRegionTag:", error.message);
    return emptyList(page, perPage);
  }
  const total = count ?? 0;
  return {
    posts: data ?? [],
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  if (post.region_tags.length === 0) return [];
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .neq("id", post.id)
    .overlaps("region_tags", post.region_tags)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[posts] getRelatedPosts:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllPublishedSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("published", true);
  if (error) {
    console.warn("[posts] getAllPublishedSlugs:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getRecentBoardItems(
  limit = BOARD_LIMIT,
): Promise<LeakRequestBoardItem[]> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("leak_requests")
    .select("id, masked_name, region, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[posts] getRecentBoardItems:", error.message);
    return [];
  }
  // PostgREST가 status 컬럼을 좁은 union으로 추론 못해서 캐스팅
  return (data ?? []).map((r) => ({
    ...r,
    status: r.status as RequestStatus,
  }));
}

export type BoardStats = {
  totalRequests: number;
  doneThisMonth: number;
};

export async function getBoardStats(): Promise<BoardStats> {
  const supabase = createSupabaseAnonClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthStartISO = monthStart.toISOString();

  const [totalRes, doneRes] = await Promise.all([
    supabase.from("leak_requests").select("*", { count: "exact", head: true }),
    supabase
      .from("leak_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "done")
      .gte("updated_at", monthStartISO),
  ]);

  return {
    totalRequests: totalRes.count ?? 0,
    doneThisMonth: doneRes.count ?? 0,
  };
}

/**
 * 게시판 사이드바 칩에 노출할 도시 중, 실제로 글이 1건 이상 있는 region_tag만 추리고 싶을 때.
 * 현재는 미사용 — RegionChips는 city.ts의 ALL_CITY_CODES를 그대로 노출.
 * 향후 글이 많아지면 이 함수로 필터링.
 */
export async function getActiveRegionTags(): Promise<string[]> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("posts")
    .select("region_tags")
    .eq("published", true);
  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    for (const t of row.region_tags ?? []) set.add(t);
  }
  return [...set];
}
