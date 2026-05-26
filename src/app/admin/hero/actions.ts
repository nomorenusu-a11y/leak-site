"use server";

import { assertAdmin } from "@/lib/auth";
import { setSiteContent } from "@/lib/site-content";
import { revalidatePath } from "next/cache";
import type { HeroSlideData, HeroBannerData } from "@/types/database";

export async function saveHeroBanner(banner: HeroBannerData) {
  await assertAdmin();
  await setSiteContent("hero_banner", banner);
  revalidatePath("/");
}

export async function saveHeroSlides(slides: HeroSlideData[]) {
  await assertAdmin();
  await setSiteContent("hero_slides", slides);
  revalidatePath("/");
}
