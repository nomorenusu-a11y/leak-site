import Link from "next/link";
import type { SearchBreadcrumbItem } from "@/lib/seo/regions";

export function PostBreadcrumbs({ items }: { items: SearchBreadcrumbItem[] }) {
  return (
    <nav aria-label="현재 위치" className="text-sm font-semibold text-slate-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-400">
                  ›
                </span>
              )}
              {current ? (
                <span aria-current="page" className="text-brand-700">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-brand-700 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
