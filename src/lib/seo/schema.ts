import { siteConfig } from "@/lib/env";

/**
 * Schema.org LocalBusiness JSON-LD.
 * 후속 단계에서 주소·서비스 지역·운영 시간 정보를 채운다.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/og.png`,
    telephone: siteConfig.phone ? `+82-${siteConfig.phone.slice(1)}` : undefined,
    priceRange: "₩₩",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "서울특별시",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: "서울특별시",
    },
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
    sameAs: siteConfig.kakao ? [siteConfig.kakao] : [],
  };
}
