/**
 * Next.js 16 Proxy (이전 이름: middleware). Edge Runtime에서 동작.
 *
 * `/admin/*` 경로는 HMAC 서명 세션 쿠키가 있어야 통과.
 * `/admin/login`만 예외로 통과 (로그인 폼 자체는 인증 불필요).
 *
 * proxy는 빠른 path 체크용 — Server Action 진입에서도 `assertAdmin()`으로 이중 검증.
 */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login은 인증 없이 접근 가능
  if (pathname === "/admin/login") {
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
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}
