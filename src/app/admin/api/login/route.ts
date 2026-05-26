import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import { getAdminCredentials } from "@/lib/env";
import { hit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = form.get("password");
  const from = form.get("from");

  const fromPath =
    typeof from === "string" && /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(from)
      ? from
      : "/admin";

  if (typeof password !== "string" || !password) {
    return errorRedirect("잘못된 입력입니다.", fromPath, request);
  }

  const xff = request.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0]!.trim() : "unknown";
  const rl = hit(`login:${ip}`, 5, 5 * 60 * 1000);
  if (!rl.allowed) {
    return errorRedirect(
      `너무 많이 시도했습니다. ${rl.retryAfterSeconds}초 후 다시 시도해 주세요.`,
      fromPath,
      request,
    );
  }

  let actualPassword: string;
  let secret: string;
  try {
    const creds = getAdminCredentials();
    actualPassword = creds.password;
    secret = creds.secret;
  } catch {
    return errorRedirect("서버 설정이 준비되지 않았습니다.", fromPath, request);
  }

  if (!verifyPassword(password, actualPassword)) {
    return errorRedirect("비밀번호가 일치하지 않습니다.", fromPath, request);
  }

  const token = await signSession(secret);
  const res = NextResponse.redirect(new URL(fromPath, request.url), 303);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return res;
}

function errorRedirect(error: string, from: string, request: NextRequest) {
  const params = new URLSearchParams({ error });
  if (from !== "/admin") params.set("from", from);
  return NextResponse.redirect(
    new URL(`/admin/login?${params}`, request.url),
    303,
  );
}
