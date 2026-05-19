import { Container } from "@/components/ui/Container";
import { getRecentBoardItems } from "@/lib/posts";
import { LiveBoardClient } from "./LiveBoardClient";
import { StatsBar } from "./StatsBar";

/**
 * 실시간 작업 보드 섹션.
 *
 * **0건이면 섹션 자체를 미렌더** — "휴면 업체" 인상 방지.
 * 1건 이상 들어와야 LIVE 뱃지와 StatsBar가 의미 있다.
 *
 * 신규 행이 들어와도 페이지 ISR로 1분 안에 노출 (page.tsx의 revalidate=60).
 */
export async function LiveBoardSection() {
  const initial = await getRecentBoardItems(10);

  // 빈 데이터 → 섹션 자체 미렌더
  if (initial.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              실시간 작업 현황
            </h2>
            <p className="mt-2 text-slate-600">최근 들어온 신청과 진행 상태를 보여드려요.</p>
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
