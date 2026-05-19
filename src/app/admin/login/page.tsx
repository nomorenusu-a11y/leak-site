import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { readAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

type Search = { [key: string]: string | string[] | undefined };

function firstString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  // 이미 로그인됐으면 /admin으로 (또는 from으로) 즉시 이동
  const session = await readAdminSession();
  const sp = await searchParams;
  const from = firstString(sp.from);
  const fromValid = from && /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(from) ? from : undefined;

  if (session.ok) {
    redirect(fromValid ?? "/admin");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-extrabold text-slate-900">관리자 로그인</h1>
        <p className="mt-1 text-sm text-slate-600">비밀번호를 입력하세요.</p>
        <div className="mt-5">
          <LoginForm from={fromValid} />
        </div>
      </div>
    </main>
  );
}
