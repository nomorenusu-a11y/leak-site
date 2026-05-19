import Link from "next/link";
import {
  ALL_CITY_CODES,
  CITY_REGION_TAGS,
  cityCodeToSlug,
  type CityCode,
} from "@/lib/city";

type Props = {
  /** 현재 활성 도시. 없으면 "전체"가 활성화. */
  activeCode?: CityCode | null;
  /** "전체" 칩을 가리키는 링크 (예: "/posts"). 미지정이면 노출 안 함. */
  allHref?: string;
};

export function RegionChips({ activeCode, allHref }: Props) {
  const baseClass =
    "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors";
  const inactive = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  const active = "border-brand-600 bg-brand-600 text-white";
  return (
    <nav aria-label="지역별 시공 사례" className="flex flex-wrap gap-1.5">
      {allHref && (
        <Link
          href={allHref}
          className={`${baseClass} ${!activeCode ? active : inactive}`}
        >
          전체
        </Link>
      )}
      {ALL_CITY_CODES.map((code) => (
        <Link
          key={code}
          href={`/posts/region/${cityCodeToSlug(code)}`}
          className={`${baseClass} ${activeCode === code ? active : inactive}`}
        >
          {CITY_REGION_TAGS[code]}
        </Link>
      ))}
    </nav>
  );
}
