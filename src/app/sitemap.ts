import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";
import { ALL_CITY_CODES, cityCodeToSlug } from "@/lib/city";
import { getAllPublishedSlugs } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/posts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...ALL_CITY_CODES.map((code) => ({
      url: `${base}/posts/region/${cityCodeToSlug(code)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // 글 목록은 supabase fetch 실패 시 빈 배열 — 정적 경로만 반환되어 sitemap 자체는 유효.
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
