import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/icons";

type Adj = { slug: string; title: string } | null;

/**
 * 글 상세 페이지 하단 이전/다음 사례 네비.
 * prev = 더 최근 글, next = 더 오래된 글 (시간순 desc 기준).
 */
export function PostNav({ prev, next }: { prev: Adj; next: Adj }) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="다른 사례 보기"
      className="mt-10 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <ArrowLeft aria-hidden className="size-5 shrink-0 text-slate-400 group-hover:text-brand-600" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">이전 사례 (최신)</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900 group-hover:text-brand-700">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">다음 사례 (이전)</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900 group-hover:text-brand-700">
              {next.title}
            </p>
          </div>
          <ArrowRight aria-hidden className="size-5 shrink-0 text-slate-400 group-hover:text-brand-600" />
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
