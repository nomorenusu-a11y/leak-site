import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /admin/logout — 쿠키 즉시 만료 후 /admin/login으로 리다이렉트.
 * 네비게이션 링크로 호출하는 간단 경로. CSRF는 무관 (쿠키 삭제만 함).
 */
export function GET(request: NextRequest) {
  const url = new URL("/admin/login", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
