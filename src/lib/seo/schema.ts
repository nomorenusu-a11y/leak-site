import { siteConfig } from "@/lib/env";
import { ALL_CITY_CODES, CITY_REGION_TAGS } from "@/lib/city";
import type { Post } from "@/types/database";

/**
 * Schema.org LocalBusiness JSON-LD.
 *
 * - 24시간 상담 + 출동 → openingHours가 "Mo-Su 00:00-23:59"
 * - areaServed: city.ts의 모든 한글 지역명 (서울 25구 + 분당)
 * - aggregateRating: 운영 초기 placeholder (5.0 / 0 review) — 데이터 쌓이면 동적 전환
 */
export function localBusinessJsonLd() {
  const placesServed = ALL_CITY_CODES.map((code) => ({
    "@type": "Place",
    name: CITY_REGION_TAGS[code],
  }));

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/og.png`,
    telephone: siteConfig.phone ? `+82-${siteConfig.phone.slice(1)}` : undefined,
    priceRange: "₩₩",
    // 사람이 읽기 쉬운 표현 (Schema.org 권장 형식 둘 다 지원)
    openingHours: ["Mo-Su 00:00-23:59"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: placesServed,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: "서울특별시",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "0",
      bestRating: "5",
      worstRating: "1",
    },
    // 정규화된 카카오 URL만 (잘못된 형식이면 빈 배열)
    sameAs: ((): string[] => {
      // 동적 import 회피 — siteConfig.kakao은 이미 신·구 변수 fallback 처리됨 (env.ts)
      const k = siteConfig.kakao;
      if (!k || k === "#") return [];
      try {
        const u = new URL(k);
        return u.protocol === "https:" ? [u.toString()] : [];
      } catch {
        return [];
      }
    })(),
  };
}

/**
 * Schema.org Article JSON-LD — 게시글 상세 페이지용.
 * contentLocation: post.region_tags 첫 번째 값을 Place로 표현.
 */
export function articleJsonLd(post: Post) {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const businessRef = { "@type": "Organization", name: siteConfig.name } as const;
  // broken placeholder URL 방어 — 외부 placehold.co는 OG·schema에서 제외
  const isValidCover =
    post.cover_image_url &&
    !/placehold\.co/i.test(post.cover_image_url);
  const image = isValidCover ? [post.cover_image_url as string] : undefined;
  const place = post.region_tags[0]
    ? { "@type": "Place", name: post.region_tags[0] }
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: businessRef,
    publisher: { ...businessRef, logo: { "@type": "ImageObject", url: `${siteConfig.url}/og.png` } },
    contentLocation: place,
  };
}

/**
 * Schema.org CollectionPage JSON-LD — 지역별 글 목록.
 */
export function regionCollectionJsonLd(args: {
  regionTag: string;
  slug: string;
  posts: Post[];
}) {
  const url = `${siteConfig.url}/posts/region/${args.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: `${args.regionTag} 누수 시공 사례`,
    description: `${args.regionTag} 지역의 누수 탐지·시공 사례 모음.`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    about: { "@type": "Place", name: args.regionTag },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: args.posts.slice(0, 12).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteConfig.url}/posts/${p.slug}`,
        name: p.title,
      })),
    },
  };
}
