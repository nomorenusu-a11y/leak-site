import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // non-production은 전체 색인 차단
  const isProd =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (!isProd) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const sharedDisallow = ["/admin", "/admin/", "/admin/*", "/api/", "/api/*"];

  return {
    rules: [
      // 기본 모든 봇
      {
        userAgent: "*",
        allow: "/",
        disallow: sharedDisallow,
      },
      // 네이버 봇 — 명시적으로 같은 정책 적용 (서치어드바이저 인지 향상)
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: sharedDisallow,
      },
      // 구글 봇 — 명시 (이미 *로 커버되지만 일부 봇이 첫 매칭만 보는 경우 대비)
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: sharedDisallow,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
