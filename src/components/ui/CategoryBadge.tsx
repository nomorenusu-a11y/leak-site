/**
 * 카테고리 배지 — LiveBoard와 시공 사례 PostCard에서 공통으로 사용.
 *
 * 색상 매핑은 단일 진실 원천(SSOT). 코드(leak/sink/...)는 DB의 `posts.category`,
 * `DemoRequest.category` 양쪽에서 동일하게 쓰임.
 */

export type PostCategory = "leak" | "sink" | "toilet" | "heating" | "frozen";

export const POST_CATEGORY_STYLE: Record<PostCategory, { ko: string; cls: string }> = {
  leak: { ko: "누수", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  sink: { ko: "싱크대", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  toilet: { ko: "변기", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  heating: { ko: "난방", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  frozen: { ko: "동파", cls: "bg-slate-100 text-slate-700 border-slate-300" },
};

const ETC_STYLE = { ko: "기타", cls: "bg-slate-100 text-slate-600 border-slate-300" };

function isKnown(category: string | null | undefined): category is PostCategory {
  return !!category && category in POST_CATEGORY_STYLE;
}

/**
 * @param category       영문 코드(leak/sink/toilet/heating/frozen). 그 외는 "기타".
 * @param size           "sm" (기본) — px-2 py-0.5 / "xs" — px-1.5 py-0 더 작게
 * @param fallbackEtc    category가 없거나 미지의 값일 때 "기타" 배지를 표시할지.
 *                       LiveBoard처럼 시각적 일관성이 중요한 곳은 true,
 *                       PostCard처럼 글에 카테고리가 없을 때 자연 미렌더가 좋은 곳은 false (기본).
 */
export function CategoryBadge({
  category,
  size = "sm",
  fallbackEtc = false,
}: {
  category?: string | null;
  size?: "sm" | "xs";
  fallbackEtc?: boolean;
}) {
  if (!category && !fallbackEtc) return null;
  const s = isKnown(category) ? POST_CATEGORY_STYLE[category] : ETC_STYLE;
  const pad = size === "xs" ? "px-1.5 py-0" : "px-2 py-0.5";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${pad} ${s.cls}`}
    >
      {s.ko}
    </span>
  );
}
