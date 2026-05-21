import { Container } from "@/components/ui/Container";
import { LIVE_BOARD_DEMO_ON } from "@/lib/env";
import { buildScrollPool, type ScrollItem } from "@/lib/live-board-scroll";
import { getRecentBoardItems } from "@/lib/posts";
import { LiveBoardScrollClient } from "./LiveBoardScrollClient";
import { StatsBar } from "./StatsBar";

const REAL_LIMIT = 40;

/**
 * 실시간 작업 보드 — 무한 세로 스크롤 (cnsolution.kr/leak 톤).
 *
 * 진짜 데이터(visible_on_board=true) 위에, 더미 풀 32건을 시드로 변환한 ScrollItem[]을
 * 합쳐서 LiveBoardScrollClient에 넘김. 둘 다 0건이면 섹션 자체 미렌더.
 *
 * 더미 OFF (NEXT_PUBLIC_LIVE_BOARD_DEMO=false):
 *   - 진짜 N건만 노출 (0건이면 미렌더)
 *
 * 진짜 Realtime INSERT 들어오면 client에서 items 앞에 prepend → 자연 합류.
 */
export async function LiveBoardSection() {
  const real = await getRecentBoardItems(REAL_LIMIT);
  const realItems: ScrollItem[] = real.map((r) => ({
    ...r,
    time_variant: "relative",
  }));
  const demoItems = LIVE_BOARD_DEMO_ON ? buildScrollPool(new Date()) : [];
  const initial: ScrollItem[] = [...realItems, ...demoItems];

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
            <span aria-hidden className="live-dot text-emerald-500" />
            LIVE
          </span>
        </div>
        <div className="mb-5">
          <StatsBar />
        </div>
        <LiveBoardScrollClient initial={initial} />
      </Container>
    </section>
  );
}
