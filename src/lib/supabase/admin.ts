// =============================================================================
// 🛑 SERVER-ONLY — 절대 클라이언트 컴포넌트('use client') 파일에서 import 금지.
//
// 이 모듈은 service_role 키를 사용하여 RLS를 완전히 우회합니다.
// 키가 브라우저 번들로 새면 모든 행에 무제한 접근 가능 → 사고급 보안 사고.
//
// 허용된 호출 위치:
//   - Server Action ('use server' 파일)
//   - Route Handler (app/api/.../route.ts)
//   - 서버 전용 유틸 (cron, instrumentation 등)
//
// import한 모든 파일이 server-only인지 확인할 것.
// =============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "@/lib/env";
import type { Database } from "@/types/database";

let cached: SupabaseClient<Database> | null = null;

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  // 추가 안전망: 만약 어떤 경로로 이 함수가 브라우저에서 실행되면 즉시 멈춤.
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient() must never run in the browser");
  }
  if (cached) return cached;
  const { url, serviceRole } = getSupabaseAdminConfig();
  cached = createClient<Database>(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}
