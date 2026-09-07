import { revalidatePath } from "next/cache";
import { regionAncestors, regionPath } from "./regions";
import type { Region } from "@/types/seo";
export function revalidateRegionTree(region: Region) {
  for (const ancestor of regionAncestors(region)) revalidatePath(regionPath(ancestor));
  revalidatePath("/sitemap.xml");
}
