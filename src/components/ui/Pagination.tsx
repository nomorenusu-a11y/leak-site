import Link from "next/link";

type Props = {
  /** 페이지 1의 URL (?page= 없이). 예: "/posts" 또는 "/posts/region/gangnam" */
  basePath: string;
  page: number;
  totalPages: number;
};

export function Pagination({ basePath, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    if (p === 1) return basePath;
    const sep = basePath.includes("?") ? "&" : "?";
    return `${basePath}${sep}page=${p}`;
  };

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const linkClass = (disabled: boolean) =>
    `rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
      disabled
        ? "pointer-events-none border-slate-200 text-slate-400"
        : "border-slate-300 text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <nav aria-label="페이지" className="mt-10 flex items-center justify-center gap-2">
      <Link href={href(prev)} aria-disabled={page === 1} className={linkClass(page === 1)}>
        이전
      </Link>
      <span className="px-3 text-sm font-semibold text-slate-700">
        {page} / {totalPages}
      </span>
      <Link
        href={href(next)}
        aria-disabled={page === totalPages}
        className={linkClass(page === totalPages)}
      >
        다음
      </Link>
    </nav>
  );
}
