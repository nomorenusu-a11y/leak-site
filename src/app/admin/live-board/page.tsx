import { assertAdmin } from "@/lib/auth";
import { getDemoBoardData } from "@/lib/site-content";
import { DEMO_POOL } from "@/data/live-board-demo";
import LiveBoardEditor from "./LiveBoardEditor";
import type { DemoRequestData } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminLiveBoardPage() {
  await assertAdmin();

  const dbData = await getDemoBoardData();
  const items: DemoRequestData[] =
    dbData.length > 0
      ? dbData
      : DEMO_POOL.map((d) => ({
          id: d.id,
          masked_name: d.masked_name,
          region: d.region,
          metro: d.metro,
          category: d.category,
          symptom: d.symptom,
        }));

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          실시간 현황판 관리
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          메인페이지 실시간 작업현황 더미 데이터를 관리합니다.
        </p>
      </header>

      <LiveBoardEditor items={items} />
    </>
  );
}
