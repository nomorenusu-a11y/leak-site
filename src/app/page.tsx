import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { HeroV2 } from "@/components/landing/v2/HeroV2";
import { AboutCards } from "@/components/landing/v2/AboutCards";
import { TimeEmphasis } from "@/components/landing/v2/TimeEmphasis";
import { ServicesList } from "@/components/landing/v2/ServicesList";
import { TestimonialsSection } from "@/components/landing/v2/TestimonialsSection";
import { WorksCardsSection } from "@/components/landing/v2/WorksCardsSection";
import { QuoteFormSectionV2 } from "@/components/landing/v2/QuoteFormSectionV2";
import { MasterSection } from "@/components/landing/v2/MasterSection";
import { FaqSection } from "@/components/landing/v2/FaqSection";
import { MobileBottomBar } from "@/components/landing/v2/MobileBottomBar";
import { FloatingDesktop } from "@/components/landing/v2/FloatingDesktop";
import { landingMetadata } from "@/lib/seo/meta";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/seo/schema";
import { faqPageJsonLd, loadFaqItems } from "@/lib/seo/faq";

export const revalidate = 300;
export const metadata: Metadata = landingMetadata("");

export default async function HomePage() {
  const faqItems = await loadFaqItems();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageJsonLd(faqItems)),
        }}
      />
      <Header />
      <main className="theme-shell flex-1 pb-24">
        <HeroV2 cityLabel="" />
        <AboutCards />
        <MasterSection />
        <TimeEmphasis />
        <ServicesList />
        <WorksCardsSection />
        <TestimonialsSection />
        <QuoteFormSectionV2 />
        <FaqSection items={faqItems} />
      </main>
      <Footer />
      <MobileBottomBar />
      <FloatingDesktop />
    </>
  );
}
