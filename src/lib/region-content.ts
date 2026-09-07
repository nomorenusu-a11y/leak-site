import { cache } from "react";
import { z } from "zod";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { publicEnv } from "@/lib/env";
import { defaultRegionContent, regionAncestors } from "@/lib/regions";
import type { Region } from "@/types/seo";

const contentSchema = z.object({
  region_id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  intro: z.string().min(1),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  published: z.boolean(),
  indexable: z.boolean(),
  updated_at: z.string().datetime({ offset: true }),
});
export const getRegionContent = cache(async (id: string) => {
  // Before the additive migration is installed, reviewed pilot copy can render locally.
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return defaultRegionContent(id);
  const { data, error } = await createSupabaseAnonClient()
    .from("region_pages")
    .select("*")
    .eq("region_id", id)
    .maybeSingle();
  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") return defaultRegionContent(id);
    throw new Error(`Region content unavailable: ${error.code}`);
  }
  // An absent/RLS-hidden row is NOT replaced by public fallback copy (unpublish safe).
  if (!data) return null;
  const content = contentSchema.parse(data);
  return content.published ? content : null;
});
export async function getPublicRegionContent(region: Region) {
  const ancestors = await Promise.all(regionAncestors(region).map((r) => getRegionContent(r.id)));
  return ancestors.every(Boolean) ? ancestors.at(-1)! : null;
}
