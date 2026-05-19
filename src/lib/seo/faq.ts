import { siteConfig } from "@/lib/env";

/**
 * 홈에 노출할 FAQ 항목. 실제 텍스트는 운영자가 추후 보강 가능.
 * Schema.org FAQPage JSON-LD 출력에 사용.
 */
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "누수 탐지비는 얼마인가요?",
    answer:
      "현장 환경에 따라 다르지만 일반 가정 기준 탐지비는 8만 원~15만 원 선입니다. 현장 진단 후 정확한 견적을 사진과 함께 안내드립니다.",
  },
  {
    question: "출장은 어느 지역까지 가능한가요?",
    answer:
      "서울 전 지역과 성남 분당 등 수도권 일부까지 출동합니다. 그 외 지역은 일정에 따라 조율 가능하니 카톡으로 문의 주세요.",
  },
  {
    question: "보증 기간은 어떻게 되나요?",
    answer:
      "시공 부위에 대해 1년 무상 사후 보증을 제공합니다. 동일 부위 누수 재발 시 추가 비용 없이 재시공합니다.",
  },
  {
    question: "24시간 출동이 가능한가요?",
    answer:
      "야간·휴일 상담은 항상 가능하고, 긴급 누수 출동은 인력 일정에 따라 우선 배정해 드립니다. 먼저 전화 또는 카톡으로 상황을 알려주세요.",
  },
  {
    question: "결제 방식은 어떻게 되나요?",
    answer:
      "카드 결제·계좌이체 모두 가능합니다. 시공 전에 견적을 사진과 함께 확정한 뒤 진행하므로 추가 청구는 없습니다.",
  },
];

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    mainEntity: FAQ_ITEMS.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}
