import { siteConfig } from "@/lib/env";
import { getContactInfo } from "@/lib/contact";
import { ALL_CITY_CODES, CITY_REGION_TAGS } from "@/lib/city";
import type { Post, PostImage } from "@/types/database";

function distinctOriginalImages(images: PostImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (image.image_variant === "annotated" || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

/** The current brand on the canonical homepage, for Google site-name selection. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: `${siteConfig.url}/`,
  };
}

/**
 * Schema.org LocalBusiness JSON-LD.
 *
 * - 24시간 상담 + 출동 → openingHours가 "Mo-Su 00:00-23:59"
 * - areaServed: city.ts의 모든 한글 지역명 (서울 25구 + 분당)
 * - 검증된 평점 데이터가 없으므로 aggregateRating은 출력하지 않는다.
 */
export function localBusinessJsonLd() {
  const placesServed = ALL_CITY_CODES.map((code) => ({
    "@type": "Place",
    name: CITY_REGION_TAGS[code],
  }));
  const { phone } = getContactInfo();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/og-image.png`,
    telephone: phone?.tel,
    priceRange: "₩₩",
    // 사람이 읽기 쉬운 표현 (Schema.org 권장 형식 둘 다 지원)
    openingHours: ["Mo-Su 00:00-23:59"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
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
export function articleJsonLd(post: Post, verifiedLocation?: string, postImages: PostImage[] = []) {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const businessRef = { "@type": "Organization", name: siteConfig.name } as const;
  // broken placeholder URL 방어 — 외부 placehold.co는 OG·schema에서 제외
  const isValidCover = post.cover_image_url && !/placehold\.co/i.test(post.cover_image_url);
  const imageUrls = distinctOriginalImages(postImages).map((item) => item.url);
  if (isValidCover && !imageUrls.includes(post.cover_image_url as string)) {
    imageUrls.unshift(post.cover_image_url as string);
  }
  const image = imageUrls.length ? imageUrls.slice(0, 8) : undefined;
  const placeName = verifiedLocation ?? post.region_tags[0];
  const place = placeName ? { "@type": "Place", name: placeName } : undefined;
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
    publisher: {
      ...businessRef,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/og-image.png` },
    },
    contentLocation: place,
  };
}

/**
 * Naver image carousel hint for posts with enough distinct field photos.
 * Naver recommends one ItemList per page, original non-duplicate images, and
 * descriptive names. Search engines still decide whether to render a carousel.
 */
export function postImageCarouselJsonLd(
  post: Post,
  postImages: PostImage[],
  relatedPosts: Post[] = [],
) {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const items: Array<{ name: string; imageUrl: string; caption?: string; url: string }> =
    distinctOriginalImages(postImages)
      .slice(0, 8)
      .map((image, index) => ({
        name:
          image.work_stage?.trim() ||
          image.alt_text?.trim() ||
          `${post.region_tags[0] ?? "누수"} 현장 사진 ${index + 1}`,
        imageUrl: image.url,
        caption: image.caption?.trim() || image.alt_text?.trim() || undefined,
        url: `${url}?photo=${index + 1}`,
      }));

  const usedUrls = new Set(items.map((item) => item.imageUrl));
  for (const related of relatedPosts) {
    if (items.length >= 8) break;
    const imageUrl = related.cover_image_url;
    if (!imageUrl || /placehold\.co/i.test(imageUrl) || usedUrls.has(imageUrl)) continue;
    usedUrls.add(imageUrl);
    items.push({
      name: related.title,
      imageUrl,
      caption: related.excerpt ?? undefined,
      url: `${siteConfig.url}/posts/${related.slug}`,
    });
  }

  if (items.length < 5) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#field-photo-list`,
    name: `${post.title} 현장 사진과 관련 사례`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      image: {
        "@type": "ImageObject",
        url: item.imageUrl,
        contentUrl: item.imageUrl,
        caption: item.caption,
      },
      url: item.url,
    })),
  };
}

/**
 * Schema.org CollectionPage JSON-LD — 지역별 글 목록.
 */
export function regionCollectionJsonLd(args: { regionTag: string; slug: string; posts: Post[] }) {
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
