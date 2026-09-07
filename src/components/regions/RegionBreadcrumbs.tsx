import Link from "next/link";
import { regionAncestors, regionPath } from "@/lib/regions";
import type { Region } from "@/types/seo";
export function RegionBreadcrumbs({ region, postTitle }: { region: Region; postTitle?: string }) {
  const crumbs = regionAncestors(region);
  return (
    <nav aria-label="현재 위치" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <li>
          <Link href="/" className="hover:underline">
            홈
          </Link>
        </li>
        {crumbs.map((r, i) => (
          <li key={r.id} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {i === crumbs.length - 1 && !postTitle ? (
              <span aria-current="page">{r.name}</span>
            ) : (
              <Link href={regionPath(r)} className="text-brand-700 font-semibold hover:underline">
                {r.name}
              </Link>
            )}
          </li>
        ))}
        {postTitle && (
          <li aria-current="page" className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true">/</span>
            <span className="break-words">{postTitle}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
