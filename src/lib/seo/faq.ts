import { siteConfig } from "@/lib/env";
import { getFaqItems, DEFAULT_FAQ_ITEMS } from "@/lib/site-content";
import type { FaqItemData } from "@/types/database";

export { DEFAULT_FAQ_ITEMS as FAQ_ITEMS_FALLBACK };

export async function loadFaqItems(): Promise<FaqItemData[]> {
  return getFaqItems();
}

export function faqPageJsonLd(items?: FaqItemData[]) {
  const faqItems = items ?? DEFAULT_FAQ_ITEMS;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    mainEntity: faqItems.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}
