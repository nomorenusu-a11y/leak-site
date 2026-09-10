"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import {
  COOKIE_NAME,
  adminSessionCookieOptions,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import { getAdminCredentials } from "@/lib/env";
import { check, hit } from "@/lib/rate-limit";

const inputSchema = z.object({
  password: z.string().min(1).max(200),
  from: z
    .string()
    .max(200)
    .regex(/^\/admin(\/[A-Za-z0-9\-_/]*)?$/, { message: "" })
    .optional(),
});

export type LoginState =
  | { status: "idle" }
  | { status: "success"; redirectTo: string }
  | { status: "error"; message: string };

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = inputSchema.safeParse({
    password: formData.get("password"),
    from: formData.get("from") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "잘못된 입력입니다." };
  }

  const ip = await clientIp();
  const rl = check(`login:${ip}`, RATE_LIMIT_MAX);
  if (!rl.allowed) {
    return {
      status: "error",
      message: `너무 많이 시도했습니다. ${rl.retryAfterSeconds}초 후 다시 시도해 주세요.`,
    };
  }

  let actualPassword: string;
  let secret: string;
  try {
    const creds = getAdminCredentials();
    actualPassword = creds.password;
    secret = creds.secret;
  } catch (err) {
    console.error("[login] missing admin credentials:", err);
    return {
      status: "error",
      message: "서버 설정이 준비되지 않았습니다. 관리자에게 문의하세요.",
    };
  }

  if (!verifyPassword(parsed.data.password, actualPassword)) {
    const failed = hit(`login:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!failed.allowed) {
      return {
        status: "error",
        message: `너무 많이 시도했습니다. ${failed.retryAfterSeconds}초 후 다시 시도해 주세요.`,
      };
    }
    return { status: "error", message: "비밀번호가 일치하지 않습니다." };
  }

  const token = await signSession(secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    ...adminSessionCookieOptions(),
  });

  return { status: "success", redirectTo: parsed.data.from ?? "/admin" };
}
