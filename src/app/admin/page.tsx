import Link from "next/link";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateYMD } from "@/lib/time";
import type { RequestStatus } from "@/types/database";

export const dynamic = "force-dynamic";

async function loadDashboardData() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const monthStart = new Date(now);
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [todayNew, activeOrQuote, doneThisMonth, publishedPosts, recentRequests, recentPosts] =
    await Promise.all([
      supabase
        .from("leak_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("leak_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["quote", "active"]),
      supabase
        .from("leak_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "done")
        .gte("updated_at", monthStart.toISOString()),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("published", true),
      supabase
        .from("leak_requests")
        .select("id, customer_name, region, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("posts")
        .select("id, title, slug, published, published_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  return {
    counts: {
      todayNew: todayNew.count ?? 0,
      activeOrQuote: activeOrQuote.count ?? 0,
      doneThisMonth: doneThisMonth.count ?? 0,
      publishedPosts: publishedPosts.count ?? 0,
    },
    recentRequests: recentRequests.data ?? [],
    recentPosts: recentPosts.data ?? [],
  };
}

export default async function AdminDashboardPage() {
  await assertAdmin();
  const { counts, recentRequests, recentPosts } = await loadDashboardData();

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">대시보드</h1>
        <p className="mt-1 text-sm text-slate-600">오늘의 신청과 진행 상황을 확인하세요.</p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatsCard label="오늘 신규 견적" value={counts.todayNew} hint="00:00 UTC 기준" />
        <StatsCard label="진행 중 작업" value={counts.activeOrQuote} hint="견적발송중·작업중" />
        <StatsCard label="이번 달 완료" value={counts.doneThisMonth} hint="status=done" />
        <StatsCard label="발행된 시공 사례" value={counts.publishedPosts} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">최근 견적 신청</h2>
            <Link href="/admin/requests" className="text-sm font-semibold text-brand-700 hover:underline">
              전체 보기
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {recentRequests.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">최근 신청이 없습니다.</li>
            ) : (
              recentRequests.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/requests/${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {r.customer_name}
                        {r.region && <span className="ml-2 text-slate-500">· {r.region}</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {formatDateYMD(r.created_at)}
                      </div>
                    </div>
                    <StatusBadge status={r.status as RequestStatus} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">최근 작성한 글</h2>
            <Link href="/admin/posts" className="text-sm font-semibold text-brand-700 hover:underline">
              전체 보기
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {recentPosts.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">아직 작성된 글이 없습니다.</li>
            ) : (
              recentPosts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{p.title}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {formatDateYMD(p.updated_at)} · {p.published ? "발행됨" : "임시저장"}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
