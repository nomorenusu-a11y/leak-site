import { Container } from "@/components/ui/Container";
import { LIVE_BOARD_DEMO_ON } from "@/lib/env";
import { buildScrollPool, type ScrollItem } from "@/lib/live-board-scroll";
import { getRecentBoardItems } from "@/lib/posts";
import { LiveBoardScrollClient } from "./LiveBoardScrollClient";
import { StatsBar } from "./StatsBar";
import { Reveal } from "@/components/ui/Reveal";

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
    <section id="live-board" className="scroll-mt-20 py-12 md:py-16">
      <Container>
        <Reveal variant="up" className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-brand-600">LIVE</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              실시간 작업신청 현황
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
              지금 들어오는 신청과 진행 상태입니다.
            </p>
          </div>
          <span className="live-blink hidden items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 sm:inline-flex">
            <span aria-hidden className="live-dot text-rose-500" />
            LIVE
          </span>
        </Reveal>
        <Reveal variant="fade" delay={0.1} className="mb-4">
          <StatsBar />
        </Reveal>
        <Reveal variant="up" delay={0.15}>
          <LiveBoardScrollClient initial={initial} />
        </Reveal>
      </Container>
    </section>
  );
}
