import { notFound } from "next/navigation";
import { DOBONG, resolvePilotRegion } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { regionMetadata } from "@/lib/seo/regions";
import { RegionPage } from "@/components/regions/RegionPage";
export const revalidate = 3600;
export const dynamic = "force-static";
// The explicit resolver below rejects every route outside the approved pilot.
// Blocking ISR allows revalidatePath to rebuild an already approved URL.
export const dynamicParams = true;
export function generateStaticParams() {
  return [{ district: DOBONG.slug }];
}
type Props = { params: Promise<{ district: string }> };
export async function generateMetadata({ params }: Props) {
  const region = resolvePilotRegion((await params).district);
  if (!region) notFound();
  const content = await getPublicRegionContent(region);
  if (!content) notFound();
  return regionMetadata(region, content);
}
export default async function Page({ params }: Props) {
  const region = resolvePilotRegion((await params).district);
  if (!region) notFound();
  return <RegionPage region={region} />;
}
