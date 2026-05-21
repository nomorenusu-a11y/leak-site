import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustPoints } from "@/components/landing/TrustPoints";
import { QuoteFormSection } from "@/components/landing/QuoteFormSection";
import { LiveBoardSection } from "@/components/landing/LiveBoardSection";
import { RecentPostsPreview } from "@/components/landing/RecentPostsPreview";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { Footer } from "@/components/landing/Footer";
import { resolveCity } from "@/lib/city";
import { landingMetadata } from "@/lib/seo/meta";
import { localBusinessJsonLd } from "@/lib/seo/schema";
import { faqPageJsonLd } from "@/lib/seo/faq";

/**
 * 1분 ISR — LiveBoardSection 조건부 미렌더와 호환되도록.
 * 신규 leak_requests 행이 들어오면 1분 안에 홈 보드에 반영.
 */
export const revalidate = 60;

type Search = { [key: string]: string | string[] | undefined };

function firstString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { label } = resolveCity(sp.city);
  return landingMetadata(label);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { code, label } = resolveCity(sp.city);
  const utmSource = firstString(sp.utm_source);
  const utmCampaign = firstString(sp.utm_campaign);

  return (
    <>
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
          __html: JSON.stringify(faqPageJsonLd()),
        }}
      />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Hero cityLabel={label} />
        <LiveBoardSection />
        <TrustPoints />
        <QuoteFormSection
          utmSource={utmSource}
          utmCampaign={utmCampaign}
          cityCode={code ?? undefined}
        />
        <RecentPostsPreview />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
