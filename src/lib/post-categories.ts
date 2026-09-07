// Existing presentation categories, separate from the new multi-axis SEO taxonomy.
// Historical values are read as aliases; no stored category is rewritten.
export const POST_CATEGORIES = [
  { value: "leak", label: "누수", aliases: ["leak", "누수 탐지", "누수 시공"] },
  { value: "toilet", label: "변기", aliases: ["toilet"] },
  { value: "sink", label: "싱크대", aliases: ["sink"] },
  { value: "heating", label: "난방", aliases: ["heating"] },
  { value: "frozen", label: "동파", aliases: ["frozen"] },
  { value: "waterproofing", label: "방수", aliases: ["waterproofing", "방수"] },
  { value: "pipe", label: "배관", aliases: ["pipe", "배관"] },
  { value: "other", label: "기타", aliases: ["other", "기타"] },
];
export function categoryValues(value: string) {
  return (
    POST_CATEGORIES.find((c) => c.value === value || c.aliases.includes(value))?.aliases ?? [value]
  );
}
export function categoryLabel(value: string | null) {
  return POST_CATEGORIES.find((c) => c.aliases.includes(value ?? ""))?.label ?? value ?? "기타";
}
