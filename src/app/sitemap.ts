import { isPilotRegion, regionAncestors, regionPath, SEOUL_REGIONS } from "@/lib/regions";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";
import { ALL_CITY_CODES, cityCodeToSlug } from "@/lib/city";
import { getAllPublishedSlugs } from "@/lib/posts";

// 예약 발행 시각이 지난 글을 별도 재배포 없이 즉시 사이트맵에 반영한다.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/posts`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...ALL_CITY_CODES.map((code) => ({
      url: `${base}/posts/region/${cityCodeToSlug(code)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // A single public query avoids hundreds of concurrent region lookups. If this
  // optional section fails, keep the post sitemap available to crawlers.
  const { data: regionPages, error: regionError } = await createSupabaseAnonClient()
    .from("region_pages")
    .select("region_id,indexable,updated_at")
    .limit(1000);
  if (regionError) {
    console.warn("[sitemap] region pages skipped:", regionError.code ?? regionError.message);
  } else {
    const byId = new Map((regionPages ?? []).map((page) => [page.region_id, page]));
    for (const region of SEOUL_REGIONS) {
      const page = byId.get(region.id);
      if (!page?.indexable) continue;
      // RLS hides unpublished ancestors. Non-pilot ancestors without a row use
      // the published fallback copy, while a missing pilot ancestor is hidden.
      if (regionAncestors(region).some((ancestor) =>
        isPilotRegion(ancestor.id) && !byId.has(ancestor.id),
      )) continue;
      entries.push({
        url: `${base}${regionPath(region)}`,
        lastModified: new Date(page.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }
  // Fail instead of silently returning a truncated list on a DB error.
  const slugs = await getAllPublishedSlugs();
  for (const row of slugs) {
    entries.push({
      url: `${base}/posts/${row.slug}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
