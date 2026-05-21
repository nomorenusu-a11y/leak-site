import type { Metadata } from "next";
import { siteConfig } from "@/lib/env";

const DEFAULT_DESCRIPTION =
  "누수 탐지·시공 전문. 정밀 장비 기반 진단으로 누수 위치를 빠르게 찾아 최소한의 시공으로 해결합니다. 24시간 상담 가능.";

/**
 * 사이트 전역 기본 메타. 페이지마다 `generateMetadata`로 덮어쓴다.
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | 누수 탐지·시공 전문`,
    template: `%s | ${siteConfig.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 누수 탐지·시공 전문`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} 로고`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | 누수 탐지·시공 전문`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // 신/구 변수 이름 모두 fallback. NEXT_PUBLIC_은 1단계부터 사용 중,
    // 새 이름(NEXT_PUBLIC_ 없음)이 권장 — 메타 태그는 빌드 시 인라인되니 둘 다 동작.
    google:
      process.env.GOOGLE_SITE_VERIFICATION ||
      process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ||
      undefined,
    other: (() => {
      const naver =
        process.env.NAVER_SITE_VERIFICATION ||
        process.env.NEXT_PUBLIC_NAVER_VERIFICATION;
      return naver ? { "naver-site-verification": naver } : undefined;
    })(),
  },
};

/**
 * 광고 LP에서 도시 코드를 받아 타이틀/설명만 동적으로 덮어쓰는 헬퍼.
 * 라벨이 비면 기본값을 반환.
 */
export function landingMetadata(cityLabel: string): Metadata {
  if (!cityLabel) return baseMetadata;
  const title = `${cityLabel} 누수 전문 | ${siteConfig.name}`;
  const description = `${cityLabel} 지역 누수 탐지·시공 전문. 누수 위치를 정확히 진단해 최소 시공으로 해결합니다.`;
  return {
    ...baseMetadata,
    title,
    description,
    openGraph: { ...baseMetadata.openGraph, title, description },
    twitter: { ...baseMetadata.twitter, title, description },
  };
}
