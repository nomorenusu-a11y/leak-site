import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustSection } from "@/components/landing/TrustSection";
import { QuoteFormSection } from "@/components/landing/QuoteFormSection";
import { LiveBoardSection } from "@/components/landing/LiveBoardSection";
import { CasesPreviewSkeleton } from "@/components/landing/CasesPreviewSkeleton";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { Footer } from "@/components/landing/Footer";
import { resolveCity } from "@/lib/city";
import { landingMetadata } from "@/lib/seo/meta";
import { localBusinessJsonLd } from "@/lib/seo/schema";

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
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Hero cityLabel={label} />
        <QuoteFormSection
          utmSource={utmSource}
          utmCampaign={utmCampaign}
          cityCode={code ?? undefined}
        />
        <LiveBoardSection />
        <TrustSection />
        <CasesPreviewSkeleton />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
