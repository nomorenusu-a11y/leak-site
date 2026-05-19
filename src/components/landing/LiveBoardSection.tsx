import { Container } from "@/components/ui/Container";
import { getRecentBoardItems } from "@/lib/posts";
import { LiveBoardClient } from "./LiveBoardClient";
import { StatsBar } from "./StatsBar";

/**
 * 실시간 작업 보드 섹션.
 * - 서버에서 초기 10건을 SSR (anon 클라이언트, RLS로 visible 행만)
 * - 클라이언트가 마운트 후 Realtime 구독해 INSERT/UPDATE 반영
 * - 위에 StatsBar 함께 노출
 */
export async function LiveBoardSection() {
  const initial = await getRecentBoardItems(10);
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              실시간 작업 현황
            </h2>
            <p className="mt-2 text-slate-600">최근 들어온 신청과 진행 상태를 실시간으로 보여드려요.</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            LIVE
          </span>
        </div>
        <div className="mb-5">
          <StatsBar />
        </div>
        <LiveBoardClient initial={initial} />
      </Container>
    </section>
  );
}
