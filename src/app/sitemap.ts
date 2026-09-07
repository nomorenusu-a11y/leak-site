import { regionPath, SEOUL_REGIONS } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";
import { ALL_CITY_CODES, cityCodeToSlug } from "@/lib/city";
import { getAllPublishedSlugs } from "@/lib/posts";

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

  for (const region of SEOUL_REGIONS) {
    const content = await getPublicRegionContent(region);
    if (content?.indexable)
      entries.push({
        url: `${base}${regionPath(region)}`,
        lastModified: new Date(content.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
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
