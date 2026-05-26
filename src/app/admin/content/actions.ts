"use server";

import { assertAdmin } from "@/lib/auth";
import { setSiteContent } from "@/lib/site-content";
import { revalidatePath } from "next/cache";
import type {
  AboutCardData,
  MasterSectionData,
  TimeSectionData,
  EquipmentData,
  ServiceData,
} from "@/types/database";

export async function saveAboutCards(items: AboutCardData[]) {
  await assertAdmin();
  await setSiteContent("about_cards", items);
  revalidatePath("/");
}

export async function saveMasterSection(data: MasterSectionData) {
  await assertAdmin();
  await setSiteContent("master_section", data);
  revalidatePath("/");
}

export async function saveTimeSection(data: TimeSectionData) {
  await assertAdmin();
  await setSiteContent("time_section", data);
  revalidatePath("/");
}

export async function saveEquipment(items: EquipmentData[]) {
  await assertAdmin();
  await setSiteContent("equipment", items);
  revalidatePath("/");
}

export async function saveServicesLeak(items: ServiceData[]) {
  await assertAdmin();
  await setSiteContent("services_leak", items);
  revalidatePath("/");
}

export async function saveServicesPipe(items: ServiceData[]) {
  await assertAdmin();
  await setSiteContent("services_pipe", items);
  revalidatePath("/");
}
