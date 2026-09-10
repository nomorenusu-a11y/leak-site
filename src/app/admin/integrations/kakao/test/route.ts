import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/auth";
import { sendKakaoOwnerNotification } from "@/lib/kakao/owner-notify";

export async function POST() {
  const session = await readAdminSession();
  if (!session.ok) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  try {
    await sendKakaoOwnerNotification({ id: "test", customerName: "알림 테스트", phone: "010-5700-4026", region: "테스트", apartment: null, symptom: "견적 신청 알림이 정상적으로 도착하는지 확인하는 테스트입니다." });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[kakao-owner-notify] test", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "알림 발송에 실패했습니다." }, { status: 500 });
  }
}
