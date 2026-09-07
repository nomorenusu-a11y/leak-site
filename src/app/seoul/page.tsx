import { notFound } from "next/navigation";
import { SEOUL } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { regionMetadata } from "@/lib/seo/regions";
import { RegionPage } from "@/components/regions/RegionPage";
export const revalidate = 3600;
export const dynamic = "force-static";
export async function generateMetadata() {
  const content = await getPublicRegionContent(SEOUL);
  if (!content) notFound();
  return regionMetadata(SEOUL, content);
}
export default function Page() {
  return <RegionPage region={SEOUL} />;
}
