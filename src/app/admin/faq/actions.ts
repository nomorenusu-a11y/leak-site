"use server";

import { assertAdmin } from "@/lib/auth";
import { setSiteContent } from "@/lib/site-content";
import { revalidatePath } from "next/cache";
import type { FaqItemData } from "@/types/database";

export async function saveFaqItems(items: FaqItemData[]) {
  await assertAdmin();
  await setSiteContent("faq_items", items);
  revalidatePath("/");
  revalidatePath("/faq");
}
