/**
 * 관리자 인증 — HMAC 서명 쿠키.
 *
 * Edge runtime(proxy.ts)·Node runtime(Server Action)·Browser 모두 지원하기 위해
 * Web Crypto API (`crypto.subtle`)만 사용한다. Node crypto는 import하지 않음.
 *
 * 토큰 포맷: `${expSecondsUnix}.${base64url(HMAC-SHA256(expSecondsUnix))}`
 *   - expSecondsUnix는 평문 (만료 체크 cheap)
 *   - 서명은 SESSION_SECRET 모르면 위조 불가
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCredentials } from "@/lib/env";

// 이전 배포에서 사용하던 `admin_session` 쿠키가 브라우저에 남아 있을 경우,
// host-only 쿠키와 충돌해 관리자 메뉴마다 로그아웃되는 문제가 생길 수 있다.
// 이름을 버전으로 분리해 오래된 쿠키를 완전히 무시한다.
export const COOKIE_NAME = "nomorenusu_admin_session_v2";
// 관리자 본인만 사용하는 콘솔이므로, 같은 브라우저에서는 매번 비밀번호를
// 입력하지 않도록 한 번의 로그인으로 30일간 유지한다. 로그아웃하면 즉시 만료된다.
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30일

/**
 * 로그인·프록시 갱신·로그아웃에서 반드시 같은 범위로 쿠키를 다루기 위한 공통 옵션.
 * path를 루트로 고정해야 /admin 하위의 모든 화면과 Server Action이 동일한 세션을 받는다.
 */
export function adminSessionCookieOptions(maxAge = SESSION_DURATION_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 운영 도메인의 apex/www 전환에도 같은 로그인 세션을 사용한다.
    // Preview의 vercel.app 호스트에는 도메인 속성을 넣지 않는다.
    ...(process.env.VERCEL_ENV === "production" ? { domain: "nomorenusu.com" } : {}),
    priority: "high" as const,
    maxAge,
  };
}

// ============================================================
// base64url helpers
// ============================================================

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64: string): Uint8Array {
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const std = b64.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(std);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ============================================================
// HMAC
// ============================================================

const encoder = new TextEncoder();

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToBase64Url(new Uint8Array(sig));
}

async function hmacVerify(
  secret: string,
  payload: string,
  signatureB64: string,
): Promise<boolean> {
  try {
    const key = await importHmacKey(secret);
    const sigBytes = base64UrlToBytes(signatureB64);
    // crypto.subtle.verify는 timing-safe하다고 명시되어 있다.
    // TS의 BufferSource 좁은 타입 이슈로 BufferSource 캐스팅.
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      encoder.encode(payload) as unknown as BufferSource,
    );
  } catch {
    return false;
  }
}

// ============================================================
// Sessions
// ============================================================

/** 만료 시각을 옵션으로 받을 수 있게 — 통합 테스트에서 만료된 토큰 생성용. */
export async function signSession(
  secret: string,
  opts: { expSeconds?: number } = {},
): Promise<string> {
  const exp = opts.expSeconds ?? Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const sig = await hmacSign(secret, String(exp));
  return `${exp}.${sig}`;
}

export type VerifyResult =
  | { ok: true; expSeconds: number }
  | { ok: false; reason: "missing" | "malformed" | "invalid_signature" | "expired" };

export async function verifySession(
  token: string | undefined | null,
  secret: string,
): Promise<VerifyResult> {
  if (!token) return { ok: false, reason: "missing" };
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return { ok: false, reason: "malformed" };
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(expStr)) return { ok: false, reason: "malformed" };
  const exp = Number(expStr);
  const valid = await hmacVerify(secret, expStr, sig);
  if (!valid) return { ok: false, reason: "invalid_signature" };
  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return { ok: false, reason: "expired" };
  return { ok: true, expSeconds: exp };
}

// ============================================================
// Password — timing-safe compare (Web Crypto: equal-length-or-fail)
// ============================================================

export function verifyPassword(input: string, actual: string): boolean {
  if (typeof input !== "string" || typeof actual !== "string") return false;
  // 길이가 다르면 그 자체로 정보. 그래도 일단 빠르게 false 처리.
  if (input.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= input.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================
// Server-side helpers
// ============================================================

/**
 * 현재 요청의 쿠키에서 세션 검사. Server Component·Action·Route Handler에서 사용.
 */
export async function readAdminSession(): Promise<VerifyResult> {
  const { secret } = getAdminCredentials();
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return verifySession(token, secret);
}

/**
 * Server Action / Server Component 첫 줄에서 호출. 실패 시 /admin/login으로 리다이렉트.
 * proxy(미들웨어)가 이미 막지만 이중 안전.
 */
export async function assertAdmin(): Promise<void> {
  const result = await readAdminSession();
  if (!result.ok) {
    redirect("/admin/login");
  }
}
