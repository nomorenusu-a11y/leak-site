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
    sameAs: siteConfig.kakao ? [siteConfig.kakao] : [],
  };
}

/**
 * Schema.org Article JSON-LD — 게시글 상세 페이지용.
 * contentLocation: post.region_tags 첫 번째 값을 Place로 표현.
 */
export function articleJsonLd(post: Post) {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const businessRef = { "@type": "Organization", name: siteConfig.name } as const;
  const image = post.cover_image_url ? [post.cover_image_url] : undefined;
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
