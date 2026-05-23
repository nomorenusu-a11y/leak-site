import { Container } from "@/components/ui/Container";
import { LIVE_BOARD_DEMO_ON } from "@/lib/env";
import { buildScrollPool, type ScrollItem } from "@/lib/live-board-scroll";
import { getRecentBoardItems } from "@/lib/posts";
import { LiveStatusTableClient } from "@/components/landing/v2/LiveStatusTableClient";
import { StatsBar } from "./StatsBar";
import { Reveal } from "@/components/ui/Reveal";

const REAL_LIMIT = 40;

/**
 * 실시간 견적현황 — 테이블 포맷 (장인배관 IMG_1318 톤).
 *
 * 진짜 데이터(visible_on_board=true) + 더미 풀 32건 시드 → ScrollItem[]
 * → LiveStatusTableClient(12행 + 일정 간격 새 row 추가 애니메이션).
 *
 * 더미 OFF (NEXT_PUBLIC_LIVE_BOARD_DEMO=false):
 *   - 진짜 N건만 노출 (0건이면 미렌더)
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
        <Reveal
          variant="up"
          className="mb-4 flex items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-bold tracking-wide text-brand-600">LIVE</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              실시간 견적문의 현황
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
              오늘도 저희 홈페이지를 방문해주셔서 감사합니다.
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
          <LiveStatusTableClient initial={initial} />
        </Reveal>
      </Container>
    </section>
  );
}
