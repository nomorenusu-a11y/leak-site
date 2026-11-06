import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { refreshPostTracking } from "@/lib/admin-post-tracking";

export const maxDuration = 60;

export async function POST() {
  try {
    const session = await readAdminSession();
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "관리자 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const tracking = await refreshPostTracking();
    const checked = Object.values(tracking.checks).filter((item) => item.search);

    return NextResponse.json({
      ok: true,
      cached: tracking.cached,
      checkedAt: tracking.updatedAt,
      visibleCount: checked.filter((item) => item.search?.found && !item.search?.error).length,
      errorCount: checked.filter((item) => item.search?.error).length,
      pagesChecked: tracking.pagesChecked,
      searchChecked: tracking.searchChecked,
      cooldownUntil: tracking.cooldownUntil,
    });
  } catch (error) {
    console.error("[search-visibility] refresh failed", error);
    return NextResponse.json(
      { ok: false, error: "검색 결과를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
