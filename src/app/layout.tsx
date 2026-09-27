import "./globals.css";
import type { Metadata, Viewport } from "next";
import { baseMetadata } from "@/lib/seo/meta";
import { AnalyticsScript } from "@/components/landing/AnalyticsScript";
import { ScrollTracker } from "@/components/landing/ScrollTracker";
import { safeJsonLd } from "@/lib/seo/regions";
import { websiteJsonLd } from "@/lib/seo/schema";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0060ad",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 네이버 서치어드바이저 소유확인 — 공개용 메타태그 */}
        <meta name="naver-site-verification" content="ed2d198862385a03e604e5b15c6e8ca628946bdd" />
        {/* Pretendard Variable — subset CSS auto-loads woff2 with optimal font-display */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd()) }}
        />
        {children}
        {/* GA4 — /admin/* 에서는 자체적으로 렌더 안 함 */}
        <AnalyticsScript />
        <ScrollTracker />
      </body>
    </html>
  );
}
