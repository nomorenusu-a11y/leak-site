import { Container } from "@/components/ui/Container";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { WorksGalleryClient, type GalleryItem } from "./WorksGalleryClient";

const PHOTOS_PER_CATEGORY = 24;

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

const CATEGORIES: { code: Cat; ko: string }[] = [
  { code: "leak", ko: "누수" },
  { code: "sink", ko: "싱크대" },
  { code: "toilet", ko: "변기" },
  { code: "heating", ko: "난방" },
  { code: "frozen", ko: "동파" },
];

/**
 * 작업사례 갤러리 (장인케어 IMG_4 톤).
 *
 * 카테고리별로 시공사례 post_images에서 사진을 모아 [전체]·[누수]·…·[동파] 탭으로 노출.
 * 동일 URL은 dedupe — 카테고리 풀이 작아도 중복 노출 방지.
 */
export async function WorksGallery() {
  const supabase = createSupabaseAnonClient();

  // 카테고리별 published 글의 post_images에서 사진 URL 끌어옴.
  // posts.category → posts.id → post_images.url
  const itemsByCategory: Record<Cat, GalleryItem[]> = {
    leak: [],
    toilet: [],
    sink: [],
    heating: [],
    frozen: [],
  };

  for (const { code } of CATEGORIES) {
    const { data: postRows } = await supabase
      .from("posts")
      .select("id, title, slug")
      .eq("published", true)
      .eq("category", code);
    if (!postRows?.length) continue;
    const ids = postRows.map((p) => p.id);
    const { data: imgs } = await supabase
      .from("post_images")
      .select("post_id, url, sort_order")
      .in("post_id", ids)
      .order("sort_order");
    const titleById = new Map(postRows.map((p) => [p.id, { title: p.title, slug: p.slug }]));
    const seen = new Set<string>();
    const list: GalleryItem[] = [];
    for (const im of imgs ?? []) {
      if (seen.has(im.url)) continue;
      seen.add(im.url);
      const meta = titleById.get(im.post_id);
      list.push({
        url: im.url,
        category: code,
        title: meta?.title ?? "",
        slug: meta?.slug ?? "",
      });
      if (list.length >= PHOTOS_PER_CATEGORY) break;
    }
    itemsByCategory[code] = list;
  }

  const all: GalleryItem[] = [];
  for (const c of CATEGORIES) all.push(...itemsByCategory[c.code]);
  if (all.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">WORKS</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            작업사례
          </h2>
          <p className="mt-3 text-slate-600">
            실제 작업이 이루어지는 모습들을 생생히 담아 보여드립니다
          </p>
        </div>
        <div className="mt-8">
          <WorksGalleryClient
            categories={CATEGORIES}
            itemsByCategory={itemsByCategory}
            allItems={all}
          />
        </div>
      </Container>
    </section>
  );
}
