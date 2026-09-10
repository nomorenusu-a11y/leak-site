import Link from "next/link";
import { assertAdmin } from "@/lib/auth";
import { kakaoOwnerNotifyConnected, sendKakaoOwnerNotification } from "@/lib/kakao/owner-notify";
import { KakaoTestForm } from "@/components/admin/KakaoTestForm";

export const dynamic = "force-dynamic";

async function sendKakaoTestAction(_previous: { ok: boolean; message: string } | null): Promise<{ ok: boolean; message: string }> {
  "use server";
  try {
    await assertAdmin();
    await sendKakaoOwnerNotification({
      id: "test",
      customerName: "알림 테스트",
      phone: "010-5700-4026",
      region: "테스트",
      apartment: null,
      symptom: "견적 신청 알림이 정상적으로 도착하는지 확인하는 테스트입니다.",
    });
    return { ok: true, message: "카카오 전송 성공: ‘나와의 채팅’을 확인하세요." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "카카오 전송에 실패했습니다." };
  }
}

export default async function KakaoIntegrationPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  await assertAdmin();
  const [integration, params] = await Promise.all([kakaoOwnerNotifyConnected(), searchParams]);
  const connected = Boolean(integration);
  return <section className="mx-auto max-w-2xl">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">Customer notifications</p>
    <h1 className="mt-2 text-3xl font-black text-white">카카오 접수 알림</h1>
    <p className="mt-3 leading-7 text-slate-400">고객이 견적 신청 폼을 제출하면 대표님 카카오톡 ‘나와의 채팅’으로 이름, 연락처, 지역, 증상과 관리자 바로가기 링크를 보냅니다.</p>
    {params.connected === "1" && <p className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">카카오 알림 계정 연결이 완료되었습니다.</p>}
    {params.error && <p className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm font-semibold text-rose-200">{params.error}</p>}
    <div className="mt-7 rounded-2xl border border-white/[.1] bg-[#111827] p-6">
      <p className="text-sm font-bold text-white">현재 상태</p>
      <p className={`mt-2 text-lg font-extrabold ${connected ? "text-emerald-300" : "text-amber-300"}`}>{connected ? "연결됨 — 새 접수부터 카카오 알림 발송" : "연결 필요 — 아직 알림은 발송되지 않음"}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/integrations/kakao/authorize" className="rounded-xl bg-yellow-300 px-5 py-3 text-sm font-black text-slate-950">{connected ? "카카오 계정 다시 연결" : "대표님 카카오톡 연결"}</Link>
        {connected && <KakaoTestForm action={sendKakaoTestAction} />}
      </div>
    </div>
    <ol className="mt-7 space-y-3 rounded-2xl border border-white/[.08] bg-white/[.025] p-6 text-sm leading-6 text-slate-300"><li><strong className="text-white">1.</strong> ‘대표님 카카오톡 연결’을 한 번 누릅니다.</li><li><strong className="text-white">2.</strong> 카카오 동의 화면에서 메시지 전송을 허용합니다.</li><li><strong className="text-white">3.</strong> 테스트 알림을 받아본 뒤 견적 폼 접수부터 자동 발송됩니다.</li></ol>
  </section>;
}
