import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * 서버 컴포넌트·Route Handler·Server Action에서 쓰는 Supabase 클라이언트.
 *
 * - `getAll`/`setAll` 모두 구현 (deprecated `get/set/remove` 사용 금지)
 * - `setAll`은 Server Component 렌더 중에는 cookieStore.set이 던질 수 있어 try/catch.
 *   현재 프로젝트는 미들웨어가 없고 인증 세션도 사용하지 않으므로 이 catch는 사실상 no-op.
 *   추후 인증 도입 시 middleware.ts에서 `setAll`을 처리하도록 보강.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component에서 호출되면 무시 — 정상 동작.
        }
      },
    },
  });
}
