"use server";

import { assertAdmin } from "@/lib/auth";
import { setSiteContent } from "@/lib/site-content";
import { revalidatePath } from "next/cache";
import type { TestimonialData } from "@/types/database";

export async function saveTestimonials(items: TestimonialData[]) {
  await assertAdmin();
  await setSiteContent("testimonials", items);
  revalidatePath("/");
}
