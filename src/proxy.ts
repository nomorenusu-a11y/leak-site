/**
 * Next.js 16 Proxy (이전 이름: middleware). Edge Runtime에서 동작.
 *
 * `/admin/*` 경로는 HMAC 서명 세션 쿠키가 있어야 통과.
 * `/admin/login`만 예외로 통과 (로그인 폼 자체는 인증 불필요).
 *
 * proxy는 빠른 path 체크용 — Server Action 진입에서도 `assertAdmin()`으로 이중 검증.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  adminSessionCookieOptions,
  COOKIE_NAME,
  signSession,
  verifySession,
} from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/admin/api/login") {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // 시크릿이 설정 안 됐으면 모든 admin 경로 차단 (안전 측)
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const verify = await verifySession(token, secret);
  if (verify.ok) {
    // 관리자가 실제로 콘솔을 사용하는 동안에는 만료 시점을 매 요청마다 연장한다.
    // 페이지 전환·글 저장·발행 등 어느 admin 경로에서도 같은 쿠키가 유지된다.
    const response = NextResponse.next();
    response.cookies.set(
      COOKIE_NAME,
      await signSession(secret),
      adminSessionCookieOptions(),
    );
    return response;
  }

  // 토큰이나 시크릿은 절대 로그에 남기지 않는다. 운영 로그에서 로그인 반복의 원인만
  // 확인할 수 있도록 경로와 검증 결과만 기록한다.
  console.warn("[admin-auth] rejected admin session", {
    path: pathname,
    reason: verify.reason,
  });

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}
