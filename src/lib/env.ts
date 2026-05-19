import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .or(z.literal(""))
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalString = z
  .string()
  .trim()
  .min(1)
  .or(z.literal(""))
  .optional()
  .transform((v) => (v ? v : undefined));

/** Supabase 키처럼 "있을 때 최소 길이"가 의미 있는 값에 사용. 빈 값은 통과. */
const optionalSecret = (min = 20) =>
  z
    .string()
    .trim()
    .min(min, `expected at least ${min} chars`)
    .or(z.literal(""))
    .optional()
    .transform((v) => (v ? v : undefined));

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default("누수 시공"),
  NEXT_PUBLIC_PHONE: z
    .string()
    .regex(/^\d{8,12}$/, "phone must be digits only")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v ? v : undefined)),
  // 카카오 채널 — 신/구 이름 둘 다 허용 (UI에서 fallback 처리)
  NEXT_PUBLIC_KAKAO_CHANNEL_URL: optionalUrl,
  NEXT_PUBLIC_KAKAO_CHANNEL: optionalUrl,

  // 영업 정보 (모두 optional, 빈 값이면 business.ts fallback 사용)
  NEXT_PUBLIC_SERVICE_AREA: optionalString,
  NEXT_PUBLIC_RESPONSE_TIME: optionalString,
  NEXT_PUBLIC_EXPERIENCE: optionalString,

  // 사업자 정보 (Footer + privacy/terms). 빈 값이면 해당 항목 미렌더.
  NEXT_PUBLIC_BUSINESS_OWNER: optionalString,
  NEXT_PUBLIC_BUSINESS_REG_NO: optionalString,
  NEXT_PUBLIC_BUSINESS_ADDRESS: optionalString,
  NEXT_PUBLIC_BUSINESS_EMAIL: optionalString,

  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret(20),

  NEXT_PUBLIC_GA_ID: optionalString,
  NEXT_PUBLIC_NAVER_VERIFICATION: optionalString,
  NEXT_PUBLIC_GOOGLE_VERIFICATION: optionalString,
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret(20),
  ADMIN_PASSWORD: optionalSecret(8),
  SESSION_SECRET: optionalSecret(32),
  // 검색콘솔 verification — server 또는 NEXT_PUBLIC_ 모두 fallback (meta.ts 참고)
  GOOGLE_SITE_VERIFICATION: optionalString,
  NAVER_SITE_VERIFICATION: optionalString,
});

function readPublicEnv() {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
    NEXT_PUBLIC_KAKAO_CHANNEL_URL: process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL,
    NEXT_PUBLIC_KAKAO_CHANNEL: process.env.NEXT_PUBLIC_KAKAO_CHANNEL,
    NEXT_PUBLIC_SERVICE_AREA: process.env.NEXT_PUBLIC_SERVICE_AREA,
    NEXT_PUBLIC_RESPONSE_TIME: process.env.NEXT_PUBLIC_RESPONSE_TIME,
    NEXT_PUBLIC_EXPERIENCE: process.env.NEXT_PUBLIC_EXPERIENCE,
    NEXT_PUBLIC_BUSINESS_OWNER: process.env.NEXT_PUBLIC_BUSINESS_OWNER,
    NEXT_PUBLIC_BUSINESS_REG_NO: process.env.NEXT_PUBLIC_BUSINESS_REG_NO,
    NEXT_PUBLIC_BUSINESS_ADDRESS: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
    NEXT_PUBLIC_BUSINESS_EMAIL: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_NAVER_VERIFICATION: process.env.NEXT_PUBLIC_NAVER_VERIFICATION,
    NEXT_PUBLIC_GOOGLE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  };
}

const parsedPublic = publicSchema.safeParse(readPublicEnv());
if (!parsedPublic.success) {
  console.error(
    "[env] invalid public env:",
    parsedPublic.error.flatten().fieldErrors,
  );
  throw new Error("Invalid NEXT_PUBLIC_* environment variables");
}

export const publicEnv = parsedPublic.data;

let cachedServer: z.infer<typeof serverSchema> | null = null;
export function serverEnv() {
  if (cachedServer) return cachedServer;
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() called in the browser");
  }
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    NAVER_SITE_VERIFICATION: process.env.NAVER_SITE_VERIFICATION,
  });
  if (!parsed.success) {
    console.error(
      "[env] invalid server env:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid server environment variables");
  }
  cachedServer = parsed.data;
  return cachedServer;
}

export const siteConfig = {
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  name: publicEnv.NEXT_PUBLIC_SITE_NAME,
  phone: publicEnv.NEXT_PUBLIC_PHONE,
  kakao:
    publicEnv.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? publicEnv.NEXT_PUBLIC_KAKAO_CHANNEL,
} as const;

// production에서 phone/kakao 둘 다 비어 있으면 운영자에게 경고 (빌드 통과)
if (
  (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") &&
  !siteConfig.phone &&
  !siteConfig.kakao
) {
  console.warn(
    "[env] WARNING: 운영 환경에 NEXT_PUBLIC_PHONE / NEXT_PUBLIC_KAKAO_CHANNEL_URL 둘 다 미설정. " +
      "CTA 버튼이 모두 미렌더되고 견적 폼 fallback만 노출됩니다.",
  );
}

/**
 * Supabase 브라우저·SSR용 키 묶음. 누락 시 명확한 에러.
 * 사용처: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
 */
export function getSupabaseConfig() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL/anon key가 .env.local에 설정되지 않았습니다. " +
        "Project Settings > API에서 Project URL과 anon public 키를 복사해 채워주세요.",
    );
  }
  return { url, anonKey };
}

/**
 * Supabase 관리자(service_role) 키 묶음. 서버 전용.
 * 사용처: `src/lib/supabase/admin.ts`만 — 절대 클라이언트 컴포넌트에서 import 금지.
 */
export function getSupabaseAdminConfig() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Supabase service_role 키 또는 URL이 누락되었습니다. " +
        "Project Settings > API에서 service_role 키를 복사해 SUPABASE_SERVICE_ROLE_KEY에 채워주세요.",
    );
  }
  return { url, serviceRole };
}

/**
 * 관리자 페이지 인증용 비밀번호 + HMAC 서명 시크릿. 둘 다 server-only.
 * 사용처: `src/lib/auth.ts` (Server Action / proxy).
 */
export function getAdminCredentials() {
  const env = serverEnv();
  const password = env.ADMIN_PASSWORD;
  const secret = env.SESSION_SECRET;
  if (!password || !secret) {
    throw new Error(
      "관리자 인증 정보가 누락됐습니다. .env.local의 ADMIN_PASSWORD(min 8) / SESSION_SECRET(min 32)을 채워주세요. " +
        "임시 dev 값 자동 생성: `npx tsx scripts/seed-admin-env.ts`",
    );
  }
  return { password, secret };
}
