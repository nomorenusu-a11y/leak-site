"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import {
  BarChart3,
  BellRing,
  ClipboardCheck,
  FileText,
  Images,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MonitorCog,
  PhoneCall,
  Sparkles,
  X,
} from "lucide-react";

type NavItem = { href: string; label: string; group?: string; icon: ReactNode };

const NAV: NavItem[] = [
  { href: "/admin", label: "운영 대시보드", icon: <LayoutDashboard size={17} /> },
  { href: "/admin/auto-post", label: "자동 글쓰기", group: "콘텐츠 운영", icon: <Sparkles size={17} /> },
  { href: "/admin/posts?status=draft", label: "발행 대기함", group: "콘텐츠 운영", icon: <ClipboardCheck size={17} /> },
  { href: "/admin/posts", label: "게시글 관리", group: "콘텐츠 운영", icon: <FileText size={17} /> },
  { href: "/admin/media", label: "사진 라이브러리", group: "콘텐츠 운영", icon: <Images size={17} /> },
  { href: "/admin/requests", label: "견적 신청", group: "고객 관리", icon: <PhoneCall size={17} /> },
  { href: "/admin/integrations/kakao", label: "카카오 접수 알림", group: "고객 관리", icon: <BellRing size={17} /> },
  { href: "/admin/live-board", label: "실시간 현황판", group: "고객 관리", icon: <BarChart3 size={17} /> },
  { href: "/admin/hero", label: "히어로", group: "사이트 설정", icon: <MonitorCog size={17} /> },
  { href: "/admin/reviews", label: "후기 관리", group: "사이트 설정", icon: <MessageSquareText size={17} /> },
  { href: "/admin/faq", label: "FAQ 관리", group: "사이트 설정", icon: <MessageSquareText size={17} /> },
  { href: "/admin/content", label: "메인 콘텐츠", group: "사이트 설정", icon: <FileText size={17} /> },
];

function isActive(pathname: string, search: URLSearchParams, href: string): boolean {
  const [targetPath, query] = href.split("?");
  if (query) return pathname === targetPath && new URLSearchParams(query).get("status") === search.get("status");
  if (href === "/admin") return pathname === href;
  if (href === "/admin/posts") return pathname === href && !search.get("status");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const navigation = (mobile = false) => (
    <nav className={mobile ? "px-3 pb-4" : "px-3 pb-6"}>
      <ul className="space-y-1">
        {NAV.map((item, index) => {
          const previousGroup = index > 0 ? NAV[index - 1].group : undefined;
          const showGroup = item.group && item.group !== previousGroup;
          const active = isActive(pathname, search, item.href);
          return (
            <li key={item.href}>
              {showGroup && <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">{item.group}</p>}
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-blue-500 text-white shadow-lg shadow-blue-950/30" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}
              >
                <span className={active ? "text-white" : "text-slate-500"}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="admin-console min-h-screen bg-[#080b12] text-slate-100">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-[#0b0f17]/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold text-white">
          <span className="grid size-7 place-items-center rounded-lg bg-blue-500 text-xs">N</span>
          NOMORENUSU
        </Link>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="관리자 메뉴" aria-expanded={mobileOpen} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      {mobileOpen && <div className="border-b border-white/[0.07] bg-[#0b0f17] md:hidden">{navigation(true)}</div>}
      <div className="md:flex">
        <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/[0.07] bg-[#0b0f17] md:flex md:flex-col">
          <Link href="/admin" className="mx-6 mt-7 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 text-sm font-black text-white shadow-lg shadow-blue-950/40">N</span>
            <span><strong className="block text-sm tracking-wide text-white">NOMORENUSU</strong><small className="text-xs text-slate-500">SEO 운영 콘솔</small></span>
          </Link>
          <div className="mt-7">{navigation()}</div>
          <div className="mt-auto border-t border-white/[0.07] p-5">
            <p className="mb-3 text-xs leading-5 text-slate-500">글은 초안에서 검토한 뒤 공개하세요. 지역·사진·문구를 한 번 더 확인할 수 있습니다.</p>
            <Link href="/admin/logout" className="block rounded-xl px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10">로그아웃</Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#080b12]" />}><AdminShellContent>{children}</AdminShellContent></Suspense>;
}
