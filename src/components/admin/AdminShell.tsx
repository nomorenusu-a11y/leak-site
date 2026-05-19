"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV: { href: string; label: string }[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/requests", label: "견적 신청" },
  { href: "/admin/posts", label: "시공 사례" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // 로그인 페이지는 사이드바 없이 자체 레이아웃만 사용
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const linkClass = (href: string) =>
    `block rounded-md px-3 py-2 text-sm font-semibold ${
      isActive(pathname, href)
        ? "bg-brand-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="font-extrabold text-slate-900">
          관리자
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {mobileOpen ? "닫기" : "메뉴"}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className={linkClass(it.href)} onClick={() => setMobileOpen(false)}>
                  {it.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin/logout"
                className="block rounded-md px-3 py-2 text-sm font-semibold text-red-300 hover:bg-slate-800"
              >
                로그아웃
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Desktop layout */}
      <div className="md:flex">
        <aside className="hidden w-56 shrink-0 border-r border-slate-800 bg-slate-900 p-4 md:block md:min-h-screen">
          <div className="px-3 py-2 text-base font-extrabold text-white">관리자</div>
          <ul className="mt-4 space-y-1">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className={linkClass(it.href)}>
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-slate-800 pt-4">
            <Link
              href="/admin/logout"
              className="block rounded-md px-3 py-2 text-sm font-semibold text-red-300 hover:bg-slate-800"
            >
              로그아웃
            </Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
