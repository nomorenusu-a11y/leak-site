import { notFound } from "next/navigation";
import { regionById, resolveRegion, SEOUL_DONGS } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { regionMetadata } from "@/lib/seo/regions";
import { RegionPage } from "@/components/regions/RegionPage";
export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;
export function generateStaticParams() {
  return SEOUL_DONGS.flatMap((region) => {
    const district = regionById(region.parent_id ?? "");
    return district ? [{ district: district.slug, dong: region.slug }] : [];
  });
}
type Props = { params: Promise<{ district: string; dong: string }> };
export async function generateMetadata({ params }: Props) {
  const { district, dong } = await params;
  const region = resolveRegion(district, dong);
  if (!region) notFound();
  const content = await getPublicRegionContent(region);
  if (!content) notFound();
  return regionMetadata(region, content);
}
export default async function Page({ params }: Props) {
  const { district, dong } = await params;
  const region = resolveRegion(district, dong);
  if (!region) notFound();
  return <RegionPage region={region} />;
}
