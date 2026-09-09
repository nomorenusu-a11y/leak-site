import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Images, Sparkles } from "lucide-react";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateYMD } from "@/lib/time";
import type { RequestStatus } from "@/types/database";

export const dynamic = "force-dynamic";

async function loadDashboardData() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const [todayNew, activeOrQuote, publishedPosts, draftPosts, taggedMedia, reviewMedia, recentPosts, recentRequests] = await Promise.all([
    supabase.from("leak_requests").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("leak_requests").select("*", { count: "exact", head: true }).in("status", ["quote", "active"]),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", false),
    supabase.from("media_asset_analysis").select("*", { count: "exact", head: true }).eq("analysis_status", "tagged"),
    supabase.from("media_asset_analysis").select("*", { count: "exact", head: true }).eq("analysis_status", "needs_review"),
    supabase.from("posts").select("id, title, slug, published, updated_at, region_tags").order("updated_at", { ascending: false }).limit(6),
    supabase.from("leak_requests").select("id, customer_name, region, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  return { counts: { todayNew: todayNew.count ?? 0, activeOrQuote: activeOrQuote.count ?? 0, publishedPosts: publishedPosts.count ?? 0, draftPosts: draftPosts.count ?? 0, taggedMedia: taggedMedia.count ?? 0, reviewMedia: reviewMedia.count ?? 0 }, recentPosts: recentPosts.data ?? [], recentRequests: recentRequests.data ?? [] };
}

const quickActions = [
  { href: "/admin/auto-post", title: "새 자동 초안", description: "지역·누수 유형을 고르고 글과 사진을 만듭니다.", icon: Sparkles, tone: "bg-blue-500/15 text-blue-300" },
  { href: "/admin/posts?status=draft", title: "발행 대기함", description: "사진과 문구를 검토한 초안을 공개합니다.", icon: ClipboardCheck, tone: "bg-amber-500/15 text-amber-300" },
  { href: "/admin/media", title: "사진 라이브러리", description: "자동 선택 가능한 사진과 검토 대상을 봅니다.", icon: Images, tone: "bg-emerald-500/15 text-emerald-300" },
];

export default async function AdminDashboardPage() {
  await assertAdmin();
  const { counts, recentPosts, recentRequests } = await loadDashboardData();
  const pipelineTotal = counts.draftPosts + counts.publishedPosts;
  const publishRate = pipelineTotal ? Math.round((counts.publishedPosts / pipelineTotal) * 100) : 0;
  return <div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Marketing operations</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">오늘의 콘텐츠 운영</h1><p className="mt-2 text-sm text-slate-400">초안 생성부터 검토·발행·지역 SEO 연결까지 한 곳에서 관리합니다.</p></div><Link href="/admin/auto-post" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400"><Sparkles size={17} /> 새 자동 초안</Link></header>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="발행 대기" value={counts.draftPosts} hint="사진·문구 검토 후 공개" accent="amber" href="/admin/posts?status=draft" /><Metric label="공개 글" value={counts.publishedPosts} hint={`초안 대비 공개 ${publishRate}%`} accent="blue" href="/admin/posts?status=published" /><Metric label="사진 자동 선택 가능" value={counts.taggedMedia} hint={`추가 확인 필요 ${counts.reviewMedia}장`} accent="emerald" href="/admin/media" /><Metric label="오늘 신규 견적" value={counts.todayNew} hint={`진행·견적 ${counts.activeOrQuote}건`} accent="violet" href="/admin/requests" /></section>
    <section className="mt-7 grid gap-4 lg:grid-cols-3">{quickActions.map(({ href, title, description, icon: Icon, tone }) => <Link key={href} href={href} className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/[0.06]"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span><div className="mt-5 flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div><ArrowUpRight size={18} className="shrink-0 text-slate-600 transition group-hover:text-blue-300" /></div></Link>)}</section>
    <section className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]"><div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Publish queue</p><h2 className="mt-1 font-bold text-white">최근 작성한 글</h2></div><Link href="/admin/posts?status=draft" className="text-sm font-semibold text-blue-300 hover:text-blue-200">대기함 열기</Link></div><ul className="divide-y divide-white/[0.07]">{recentPosts.length === 0 ? <li className="px-5 py-12 text-center text-sm text-slate-500">아직 만든 글이 없습니다.</li> : recentPosts.map((post) => <li key={post.id}><Link href={`/admin/posts/${post.id}/edit`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.035]"><span className={`size-2 rounded-full ${post.published ? "bg-emerald-400" : "bg-amber-400"}`} /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-100">{post.title}</p><p className="mt-1 truncate text-xs text-slate-500">{post.region_tags?.join(" · ") || "지역 미지정"} · {formatDateYMD(post.updated_at)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${post.published ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{post.published ? "공개" : "검토 대기"}</span></Link></li>)}</ul></div><div className="rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">SEO publishing checklist</p><h2 className="mt-1 font-bold text-white">공개 전 5초 점검</h2><ol className="mt-5 space-y-4 text-sm text-slate-300"><Checklist text="지역·건물·누수 유형이 제목과 H1에 일치" /><Checklist text="사진은 본문 흐름에 맞고 ALT·캡션이 존재" /><Checklist text="법정동·구 페이지와 관련 글로 내부링크" /><Checklist text="전화 CTA와 메타 설명 확인" /></ol><Link href="/admin/posts?status=draft" className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200 hover:bg-blue-500/20"><ClipboardCheck size={17} /> 발행 대기함 검토</Link></div></section>
    <section className="mt-7 rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Customer requests</p><h2 className="mt-1 font-bold text-white">최근 견적 신청</h2></div><Link href="/admin/requests" className="text-sm font-semibold text-blue-300">전체 보기</Link></div><div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">{recentRequests.map((request) => <Link key={request.id} href={`/admin/requests/${request.id}`} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 hover:bg-white/[0.05]"><p className="truncate text-sm font-bold text-slate-200">{request.customer_name}</p><p className="mt-1 text-xs text-slate-500">{request.region || "지역 미입력"} · {formatDateYMD(request.created_at)}</p><p className="mt-2 text-xs text-blue-300">{request.status as RequestStatus}</p></Link>)}</div></section>
  </div>;
}
function Metric({ label, value, hint, accent, href }: { label: string; value: number; hint: string; accent: "amber" | "blue" | "emerald" | "violet"; href: string }) { const colors = { amber: "from-amber-400 to-orange-500", blue: "from-blue-400 to-indigo-500", emerald: "from-emerald-400 to-teal-500", violet: "from-violet-400 to-fuchsia-500" }; return <Link href={href} className="group overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5 transition hover:border-white/20"><span className={`block h-1 w-12 rounded-full bg-gradient-to-r ${colors[accent]}`} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><div className="mt-1 flex items-end justify-between"><p className="text-3xl font-black text-white">{value.toLocaleString("ko-KR")}</p><ArrowUpRight size={17} className="mb-1 text-slate-600 group-hover:text-white" /></div><p className="mt-2 text-xs text-slate-500">{hint}</p></Link>; }
function Checklist({ text }: { text: string }) { return <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" /><span>{text}</span></li>; }
