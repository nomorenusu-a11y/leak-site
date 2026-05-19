"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STATUS_ORDER, type RequestStatus } from "@/types/database";

const idSchema = z.string().uuid();

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll(id: string) {
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");
  revalidatePath("/"); // 공개 보드도 영향
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<ActionResult> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };
  if (!STATUS_ORDER.includes(status)) return { ok: false, error: "잘못된 상태" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leak_requests").update({ status }).eq("id", id);
  if (error) {
    console.error("[admin/requests] status update:", error);
    return { ok: false, error: "상태 변경 실패" };
  }
  revalidateAll(id);
  return { ok: true };
}

export async function updateRequestMemo(id: string, memo: string): Promise<ActionResult> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };
  if (typeof memo !== "string" || memo.length > 2000) return { ok: false, error: "메모는 2000자 이내" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("leak_requests")
    .update({ admin_memo: memo })
    .eq("id", id);
  if (error) {
    console.error("[admin/requests] memo update:", error);
    return { ok: false, error: "메모 저장 실패" };
  }
  revalidatePath(`/admin/requests/${id}`);
  return { ok: true };
}

export async function toggleBoardVisibility(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("leak_requests")
    .update({ visible_on_board: visible })
    .eq("id", id);
  if (error) {
    console.error("[admin/requests] board toggle:", error);
    return { ok: false, error: "보드 노출 변경 실패" };
  }
  revalidateAll(id);
  return { ok: true };
}

export async function deleteRequest(id: string): Promise<ActionResult> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "잘못된 ID" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leak_requests").delete().eq("id", id);
  if (error) {
    console.error("[admin/requests] delete:", error);
    return { ok: false, error: "삭제 실패" };
  }
  revalidateAll(id);
  return { ok: true };
}
