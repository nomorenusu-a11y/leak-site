import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // production 외 환경(preview, 로컬)은 색인 차단
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (!isProd) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
