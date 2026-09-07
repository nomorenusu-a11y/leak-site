import type { Metadata } from "next";
import { siteConfig } from "@/lib/env";
import { regionAncestors, regionPath } from "@/lib/regions";
import type { Region, RegionPageContent } from "@/types/seo";

/** 법정동 상세 페이지는 하나의 강한 지역 페이지에서 검색 의도를 함께 안내한다. */
export function regionPageTitle(region: Region, content: RegionPageContent) {
  return region.level === "dong" ? `${region.name} 누수탐지` : content.title;
}

export function regionPageDescription(region: Region, content: RegionPageContent) {
  if (region.level !== "dong") return content.description;
  const district = regionAncestors(region).find((ancestor) => ancestor.level === "district");
  const location = district ? `서울 ${district.name} ${region.name}` : region.name;
  return `${location} 누수탐지 상담. ${region.name} 아파트 누수, 화장실·욕실 누수, 천장 누수, 수도·온수·난방배관 및 보일러 누수의 증상을 확인하고 실제 사례와 상담 안내를 보세요.`;
}

export function regionMetadataTitle(region: Region, content: RegionPageContent) {
  const pageTitle = regionPageTitle(region, content);
  return region.level === "dong" ? `${pageTitle} | 아파트·화장실·천장·배관 누수 상담` : pageTitle;
}

export function regionHeroDescription(region: Region, content: RegionPageContent) {
  if (region.level !== "dong") return content.intro;
  return `${region.name} 아파트 누수, 화장실·욕실 누수, 천장 누수와 수도배관·온수배관·난방배관·보일러 누수처럼 관찰된 증상을 전화로 알려 주세요.`;
}

export function regionFaqs(region: Region, content: RegionPageContent) {
  if (region.level !== "dong") return content.faq;
  return [
    {
      question: `${region.name} 아파트 화장실·욕실 누수는 어떻게 상담하나요?`,
      answer:
        "물이 보이는 공간, 처음 발견한 시점, 아랫집 연락 여부처럼 확인한 내용을 알려 주세요. 원인과 작업 범위는 현장 확인 전까지 단정하지 않습니다.",
    },
    {
      question: `${region.name} 천장 누수와 보일러·배관 누수는 바로 구분할 수 있나요?`,
      answer:
        "천장 물자국이나 보일러 압력 저하만으로 원인을 확정할 수는 없습니다. 관찰한 증상을 바탕으로 필요한 현장 확인 범위를 상담에서 안내합니다.",
    },
    {
      question: `${region.name} 수도배관·온수배관·난방배관 누수도 상담할 수 있나요?`,
      answer:
        "네. 계량기 회전, 수도요금 변화, 습기처럼 확인한 증상을 알려 주세요. 배관 종류와 누수 원인은 현장 상태를 확인한 뒤 판단합니다.",
    },
    ...content.faq,
  ];
}

export function regionMetadata(region: Region, content: RegionPageContent): Metadata {
  const path = regionPath(region);
  const title = regionMetadataTitle(region, content);
  const description = regionPageDescription(region, content);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: content.indexable, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
export function breadcrumbJsonLd(region: Region, post?: { title: string; slug: string }) {
  const items = [
    { name: "홈", path: "/" },
    ...regionAncestors(region).map((r) => ({ name: r.name, path: regionPath(r) })),
  ];
  if (post) items.push({ name: post.title, path: `/posts/${post.slug}` });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.path, siteConfig.url).href,
    })),
  };
}
export function regionFaqJsonLd(region: Region, content: RegionPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}${regionPath(region)}#faq`,
    mainEntity: regionFaqs(region, content).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
