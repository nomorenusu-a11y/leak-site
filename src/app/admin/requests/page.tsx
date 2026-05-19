import Link from "next/link";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RequestFilters } from "@/components/admin/RequestFilters";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BoardVisibilityToggle } from "@/components/admin/BoardVisibilityToggle";
import { formatDateYMD } from "@/lib/time";
import { STATUS_ORDER, type RequestStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

type Search = { [key: string]: string | string[] | undefined };

function firstString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseStatus(v: string | undefined): RequestStatus | null {
  if (!v) return null;
  return (STATUS_ORDER as readonly string[]).includes(v) ? (v as RequestStatus) : null;
}

function summarize(text: string, max = 60): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max) + "…";
}

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await assertAdmin();
  const sp = await searchParams;
  const status = parseStatus(firstString(sp.status));
  const order: "latest" | "oldest" =
    firstString(sp.order) === "oldest" ? "oldest" : "latest";

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("leak_requests")
    .select(
      "id, customer_name, phone, region, symptom, status, visible_on_board, created_at",
    )
    .order("created_at", { ascending: order === "oldest" })
    .limit(PER_PAGE);
  if (status) query = query.eq("status", status);
  const { data: rows, error } = await query;
  if (error) console.warn("[admin/requests] list:", error.message);
  const items = rows ?? [];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">견적 신청</h1>
          <p className="mt-1 text-sm text-slate-600">최근 {PER_PAGE}건까지 표시됩니다.</p>
        </div>
      </header>

      <div className="mt-5">
        <RequestFilters active={status} order={order} />
      </div>

      {/* Desktop: table */}
      <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">시간</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3">증상</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">보드</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  해당 조건의 신청이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateYMD(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/requests/${r.id}`}
                      className="font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                    >
                      {r.customer_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{r.region ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{summarize(r.symptom)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status as RequestStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <BoardVisibilityToggle id={r.id} initial={r.visible_on_board} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="mt-6 space-y-3 md:hidden">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-slate-500">
            해당 조건의 신청이 없습니다.
          </li>
        ) : (
          items.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/admin/requests/${r.id}`}
                  className="min-w-0 flex-1 text-base font-bold text-slate-900 hover:text-brand-700"
                >
                  {r.customer_name}
                </Link>
                <StatusBadge status={r.status as RequestStatus} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {formatDateYMD(r.created_at)} · {r.phone}
                {r.region && ` · ${r.region}`}
              </p>
              <p className="mt-2 text-sm text-slate-700">{summarize(r.symptom, 80)}</p>
              <div className="mt-3 flex justify-end">
                <BoardVisibilityToggle id={r.id} initial={r.visible_on_board} />
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
