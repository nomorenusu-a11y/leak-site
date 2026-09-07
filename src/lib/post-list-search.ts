import { POST_CATEGORIES } from "./post-categories";
export type ListSearch = Record<string, string | string[] | undefined>;
export function parseListSearch(sp: ListSearch) {
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (
    (rawPage !== undefined && !/^[1-9]\d*$/.test(rawPage)) ||
    !Number.isSafeInteger(page) ||
    page > 100000
  )
    return null;
  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const category = cat
    ? POST_CATEGORIES.find((c) => c.value === cat || c.aliases.includes(cat))?.value
    : undefined;
  if (cat && !category) return null;
  return { page, category };
}
export function listPath(base: string, page: number, category?: string) {
  const query = new URLSearchParams();
  if (category) query.set("cat", category);
  if (page > 1) query.set("page", String(page));
  return query.size ? `${base}?${query}` : base;
}
