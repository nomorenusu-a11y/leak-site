import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { adminSessionCookieOptions, readAdminSession } from "@/lib/auth";
import { getKakaoOwnerNotifyConfig } from "@/lib/env";
import { kakaoRedirectUri } from "@/lib/kakao/owner-notify";

const STATE_COOKIE = "nomorenusu_kakao_oauth_state";

export async function GET() {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.redirect(new URL("/admin/login?from=/admin/integrations/kakao", process.env.NEXT_PUBLIC_SITE_URL));
  const state = randomBytes(24).toString("base64url");
  const { restApiKey } = getKakaoOwnerNotifyConfig();
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", restApiKey);
  url.searchParams.set("redirect_uri", kakaoRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "talk_message");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, { ...adminSessionCookieOptions(10 * 60), httpOnly: true });
  return response;
}
