import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { siteConfig } from "@/lib/env";
import { submitIndexNow } from "@/lib/indexnow";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const session = await readAdminSession();
  if (!session.ok) {
    return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("posts")
    .select("slug")
    .eq("published", true)
    .gte("published_at", since.toISOString())
    .lte("published_at", now.toISOString())
    .order("published_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { ok: false, error: "최근 공개 글을 확인하지 못했습니다." },
      { status: 500 },
    );
  }

  const urls = (data ?? []).map((post) => `${siteConfig.url}/posts/${post.slug}`);
  const result = await submitIndexNow(urls);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "IndexNow 알림에 실패했습니다.", detail: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, submitted: result.submitted });
}
