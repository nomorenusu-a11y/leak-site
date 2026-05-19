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
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 누수 탐지·시공 전문`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | 누수 탐지·시공 전문`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_VERIFICATION }
      : undefined,
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
