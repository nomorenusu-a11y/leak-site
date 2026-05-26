"use server";

import { assertAdmin } from "@/lib/auth";
import { setSiteContent } from "@/lib/site-content";
import { revalidatePath } from "next/cache";
import type { DemoRequestData } from "@/types/database";

export async function saveDemoBoard(items: DemoRequestData[]) {
  await assertAdmin();
  await setSiteContent("live_board_demo", items);
  revalidatePath("/");
}
