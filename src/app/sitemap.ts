import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  // 2단계 이후 posts·status 추가
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
