import { notFound } from "next/navigation";
import { resolveRegion, SEOUL_DISTRICTS } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { regionMetadata } from "@/lib/seo/regions";
import { RegionPage } from "@/components/regions/RegionPage";
export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;
export function generateStaticParams() {
  return SEOUL_DISTRICTS.map((region) => ({ district: region.slug }));
}
type Props = { params: Promise<{ district: string }> };
export async function generateMetadata({ params }: Props) {
  const region = resolveRegion((await params).district);
  if (!region) notFound();
  const content = await getPublicRegionContent(region);
  if (!content) notFound();
  return regionMetadata(region, content);
}
export default async function Page({ params }: Props) {
  const region = resolveRegion((await params).district);
  if (!region) notFound();
  return <RegionPage region={region} />;
}
