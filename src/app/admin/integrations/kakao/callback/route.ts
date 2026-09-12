import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieOptions, readAdminSession } from "@/lib/auth";
import { connectKakaoOwnerFromCode } from "@/lib/kakao/owner-notify";

const STATE_COOKIE = "nomorenusu_kakao_oauth_state";
const origin = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://nomorenusu.com";

export async function GET(request: NextRequest) {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.redirect(new URL("/admin/login?from=/admin/integrations/kakao", origin()));
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = (await cookies()).get(STATE_COOKIE)?.value;
  const redirect = new URL("/admin/integrations/kakao", origin());
  if (!code || !state || !expected || state !== expected) {
    redirect.searchParams.set("error", "카카오 연결을 확인하지 못했습니다. 다시 시도해 주세요.");
  } else {
    try {
      await connectKakaoOwnerFromCode(code);
      redirect.searchParams.set("connected", "1");
    } catch (error) {
      console.error("[kakao-owner-notify] callback", error);
      redirect.searchParams.set("error", "카카오 연결 저장에 실패했습니다. 앱 설정을 확인해 주세요.");
    }
  }
  const response = NextResponse.redirect(redirect);
  response.cookies.set(STATE_COOKIE, "", { ...adminSessionCookieOptions(0), maxAge: 0 });
  return response;
}
