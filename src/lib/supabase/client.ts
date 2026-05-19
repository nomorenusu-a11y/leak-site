import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 브라우저(Client Component) 전용 Supabase 클라이언트.
 * `createBrowserClient`는 내부적으로 싱글톤 + cookie 자동 관리.
 *
 * 사용 예 (Realtime 구독 등):
 *   const supabase = createSupabaseBrowserClient();
 *   supabase.channel(...)
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}
