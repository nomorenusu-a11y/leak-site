import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 공개 read-only 데이터(시공 사례·실시간 보드) 조회용 anon 클라이언트.
 *
 * `src/lib/supabase/server.ts`는 `cookies()`를 사용해 `generateStaticParams`나
 * `unstable_cache` 컨텍스트(쿠키 없음)에서 못 쓴다. RLS가 published=true /
 * visible_on_board=true 행만 노출하므로 anon 키로도 권한 안전.
 *
 * Realtime 구독은 브라우저에서 `createSupabaseBrowserClient()`로 별도 처리.
 */

let cached: SupabaseClient<Database> | null = null;

export function createSupabaseAnonClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const { url, anonKey } = getSupabaseConfig();
  cached = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
