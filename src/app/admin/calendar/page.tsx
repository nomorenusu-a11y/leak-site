import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, FileCheck2 } from "lucide-react";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ScheduleWeekButton } from "@/components/admin/ScheduleWeekButton";

export const dynamic = "force-dynamic";

type Search = { [key: string]: string | string[] | undefined };
type CalendarPost = { id: string; title: string; slug: string; published: boolean; published_at: string };

function firstString(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function validMonth(value?: string) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "") ? value! : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7); }
function monthShift(month: string, amount: number) { const [year, m] = month.split("-").map(Number); const date = new Date(Date.UTC(year, m - 1 + amount, 1)); return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; }
function dateKey(value: Date | string) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(typeof value === "string" ? new Date(value) : value); }
function timeLabel(value: string) { return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)); }

export default async function AdminCalendarPage({ searchParams }: { searchParams: Promise<Search> }) {
  await assertAdmin();
  const month = validMonth(firstString((await searchParams).month));
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const gridStart = new Date(first); gridStart.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const gridEnd = new Date(gridStart); gridEnd.setUTCDate(gridStart.getUTCDate() + 42);
  const from = new Date(`${dateKey(gridStart)}T00:00:00+09:00`).toISOString();
  const to = new Date(`${dateKey(gridEnd)}T00:00:00+09:00`).toISOString();
  const db = createSupabaseAdminClient();
  const { data } = await db.from("posts").select("id, title, slug, published, published_at").gte("published_at", from).lt("published_at", to).order("published_at");
  const posts = (data ?? []) as CalendarPost[];
  const grouped = new Map<string, CalendarPost[]>();
  for (const post of posts) grouped.set(dateKey(post.published_at), [...(grouped.get(dateKey(post.published_at)) ?? []), post]);
  const now = new Date();
  const today = dateKey(now);
  const todayPosts = (grouped.get(today) ?? []).filter((post) => post.published);
  const publishedToday = todayPosts.filter((post) => new Date(post.published_at) <= now).length;
  const scheduledAhead = posts.filter((post) => post.published && new Date(post.published_at) > now).length;
  const monthPublished = posts.filter((post) => post.published && new Date(post.published_at) <= now && dateKey(post.published_at).startsWith(month)).length;
  const cells = Array.from({ length: 42 }, (_, index) => { const day = new Date(gridStart); day.setUTCDate(gridStart.getUTCDate() + index); return day; });

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Publishing calendar</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">발행 캘린더</h1><p className="mt-2 text-sm text-slate-400">공개된 글과 예약 글을 날짜별로 확인합니다. 예약 시각이 되면 자동으로 공개됩니다.</p></div>
        <ScheduleWeekButton />
      </header>

      <section className="mt-7 grid gap-3 sm:grid-cols-3">
        <Summary label="오늘 공개" value={publishedToday} suffix="개" hint={`오늘 전체 배치 ${todayPosts.length}개`} tone="emerald" />
        <Summary label="앞으로 예약" value={scheduledAhead} suffix="개" hint="선택한 달 화면 기준" tone="blue" />
        <Summary label="이번 달 공개" value={monthPublished} suffix="개" hint={`${year}년 ${monthNumber}월`} tone="violet" />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-6">
          <Link href={`/admin/calendar?month=${monthShift(month, -1)}`} aria-label="이전 달" className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.06]"><ChevronLeft size={18} /></Link>
          <div className="text-center"><p className="text-xl font-black text-white">{year}년 {monthNumber}월</p><Link href="/admin/calendar" className="mt-1 inline-block text-xs font-semibold text-blue-300">오늘로 이동</Link></div>
          <Link href={`/admin/calendar?month=${monthShift(month, 1)}`} aria-label="다음 달" className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.06]"><ChevronRight size={18} /></Link>
        </div>
        <div className="grid grid-cols-7 border-b border-white/[0.08] bg-white/[0.025] text-center text-[11px] font-bold text-slate-500 sm:text-xs">{["일", "월", "화", "수", "목", "금", "토"].map((label) => <div key={label} className="py-3 first:text-rose-300 last:text-blue-300">{label}</div>)}</div>
        <div className="grid grid-cols-7">
          {cells.map((day) => {
            const key = dateKey(day); const dayPosts = grouped.get(key) ?? []; const inMonth = day.getUTCMonth() === monthNumber - 1; const isToday = key === today;
            return <div key={key} className={`min-h-28 border-b border-r border-white/[0.07] p-1.5 sm:min-h-40 sm:p-2.5 ${inMonth ? "bg-[#0d121d]" : "bg-black/20"}`}>
              <div className="flex items-center justify-between"><span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${isToday ? "bg-blue-500 text-white" : inMonth ? "text-slate-300" : "text-slate-700"}`}>{day.getUTCDate()}</span>{dayPosts.length > 0 && <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-slate-400">{dayPosts.length}</span>}</div>
              <div className="mt-1.5 space-y-1.5">{dayPosts.slice(0, 4).map((post) => { const scheduled = post.published && new Date(post.published_at) > now; return <Link key={post.id} href={`/admin/posts/${post.id}/edit`} title={post.title} className={`block rounded-md border px-1.5 py-1 text-[9px] leading-3 transition hover:brightness-125 sm:px-2 sm:py-1.5 sm:text-[11px] sm:leading-4 ${scheduled ? "border-blue-400/20 bg-blue-400/10 text-blue-200" : post.published ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-amber-400/20 bg-amber-400/10 text-amber-200"}`}><span className="hidden font-bold sm:inline">{timeLabel(post.published_at)} </span><span className="line-clamp-2">{post.title}</span></Link>; })}{dayPosts.length > 4 && <p className="px-1 text-[10px] font-semibold text-slate-500">+ {dayPosts.length - 4}개 더 있음</p>}</div>
            </div>;
          })}
        </div>
        <div className="flex flex-wrap gap-4 border-t border-white/[0.08] px-5 py-4 text-xs text-slate-400"><span className="inline-flex items-center gap-1.5"><FileCheck2 size={14} className="text-emerald-300" /> 공개 완료</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-blue-300" /> 공개 예약</span><span className="text-slate-600">시간은 한국 표준시(KST) 기준</span></div>
      </section>
    </div>
  );
}

function Summary({ label, value, suffix, hint, tone }: { label: string; value: number; suffix: string; hint: string; tone: "emerald" | "blue" | "violet" }) {
  const color = { emerald: "from-emerald-400 to-teal-500", blue: "from-blue-400 to-indigo-500", violet: "from-violet-400 to-fuchsia-500" }[tone];
  return <div className="rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5"><span className={`block h-1 w-12 rounded-full bg-gradient-to-r ${color}`} /><p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-white">{value.toLocaleString("ko-KR")}<span className="ml-1 text-base text-slate-500">{suffix}</span></p><p className="mt-2 text-xs text-slate-500">{hint}</p></div>;
}
