import "./globals.css";
import type { Metadata, Viewport } from "next";
import { baseMetadata } from "@/lib/seo/meta";
import { AnalyticsScript } from "@/components/landing/AnalyticsScript";
import { ScrollTracker } from "@/components/landing/ScrollTracker";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0060ad",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Pretendard Variable — subset CSS auto-loads woff2 with optimal font-display */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
        {/* GA4 — /admin/* 에서는 자체적으로 렌더 안 함 */}
        <AnalyticsScript />
        <ScrollTracker />
      </body>
    </html>
  );
}
