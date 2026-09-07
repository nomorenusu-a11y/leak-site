import { revalidatePath } from "next/cache";
import { PILOT_REGIONS, regionPath } from "./regions";
export function revalidatePilot() {
  for (const region of PILOT_REGIONS) revalidatePath(regionPath(region));
  revalidatePath("/sitemap.xml");
}
