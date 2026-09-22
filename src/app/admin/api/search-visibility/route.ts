import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/auth";
import {
  checkNaverSearchKeyword,
  DEFAULT_NAVER_SEARCH_VISIBILITY,
  mergeNaverSearchVisibility,
  NAVER_SEARCH_VISIBILITY_KEY,
  type NaverSearchVisibilityState,
} from "@/lib/naver-search-visibility";
import { getSiteContent, setSiteContent } from "@/lib/site-content";

export const maxDuration = 30;

async function inBatches<T, R>(items: T[], size: number, work: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...(await Promise.all(items.slice(index, index + size).map(work))));
  }
  return results;
}

export async function POST() {
  try {
    const session = await readAdminSession();
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "관리자 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const saved = await getSiteContent<NaverSearchVisibilityState | null>(
      NAVER_SEARCH_VISIBILITY_KEY,
      null,
    );
    const state = mergeNaverSearchVisibility(saved);
    const previousCheck = state.publicSearch.checkedAt
      ? new Date(state.publicSearch.checkedAt).getTime()
      : 0;
    if (Date.now() - previousCheck < 30_000) {
      return NextResponse.json({
        ok: true,
        cached: true,
        checkedAt: state.publicSearch.checkedAt,
        checks: state.publicSearch.checks,
        visibleCount: state.publicSearch.checks.filter((item) => item.visible).length,
        errorCount: state.publicSearch.checks.filter((item) => item.error).length,
      });
    }

    const checks = await inBatches(state.trackedKeywords, 3, checkNaverSearchKeyword);
    const nextState: NaverSearchVisibilityState = {
      ...state,
      publicSearch: {
        checkedAt: new Date().toISOString(),
        checks,
      },
    };
    await setSiteContent(NAVER_SEARCH_VISIBILITY_KEY, nextState);

    return NextResponse.json({
      ok: true,
      cached: false,
      checkedAt: nextState.publicSearch.checkedAt,
      checks,
      visibleCount: checks.filter((item) => item.visible).length,
      errorCount: checks.filter((item) => item.error).length,
      baseline: DEFAULT_NAVER_SEARCH_VISIBILITY.officialReport.updatedAt,
    });
  } catch (error) {
    console.error("[search-visibility] refresh failed", error);
    return NextResponse.json(
      { ok: false, error: "검색 결과를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
