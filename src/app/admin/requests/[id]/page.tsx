import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RequestStatusSelect } from "@/components/admin/RequestStatusSelect";
import { BoardVisibilityToggle } from "@/components/admin/BoardVisibilityToggle";
import { AdminMemoField } from "@/components/admin/AdminMemoField";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteRequest } from "@/app/admin/requests/actions";
import { siteConfig } from "@/lib/env";
import { formatDateYMD } from "@/lib/time";
import type { LeakRequest, RequestStatus } from "@/types/database";

export const dynamic = "force-dynamic";

// symptom 본문에 append된 첨부 사진 URL 추출
function extractAttachedImageUrls(symptom: string): string[] {
  const matches = symptom.match(/https:\/\/\S+\.(?:jpg|jpeg|png|webp)/gi);
  return matches ? Array.from(new Set(matches)) : [];
}

// symptom에서 [첨부 사진] 블록을 잘라 본문만 표시
function stripAttachmentBlock(symptom: string): string {
  const idx = symptom.indexOf("[첨부 사진]");
  return idx >= 0 ? symptom.slice(0, idx).trim() : symptom;
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertAdmin();
  const { id } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: req, error } = await supabase
    .from("leak_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) console.warn("[admin/requests/:id]", error.message);
  if (!req) notFound();
  const row = req as LeakRequest;

  const images = extractAttachedImageUrls(row.symptom);
  const symptomBody = stripAttachmentBlock(row.symptom);
  const phoneDigits = row.phone.replace(/\D/g, "");

  // Server Action을 ConfirmButton에 전달 (use server 파일에서 export됨)
  async function handleDelete() {
    "use server";
    return await deleteRequest(id);
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/admin/requests"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            ← 견적 목록
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {row.customer_name}님의 견적
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            접수 {formatDateYMD(row.created_at)} · ID {row.id.slice(0, 8)}…
          </p>
        </div>
        <ConfirmButton
          label="이 신청 삭제"
          confirmMessage="정말 삭제하시겠습니까? 되돌릴 수 없습니다."
          onAction={handleDelete}
          redirectTo="/admin/requests"
        />
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">상태</p>
          <div className="mt-2">
            <RequestStatusSelect id={row.id} initial={row.status as RequestStatus} size="md" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">공개 보드 노출</p>
          <div className="mt-2">
            <BoardVisibilityToggle id={row.id} initial={row.visible_on_board} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">빠른 액션</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={`tel:${phoneDigits}`}
              className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-700"
            >
              📞 전화
            </a>
            {siteConfig.kakao && (
              <a
                href={siteConfig.kakao}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 rounded-md bg-[#FEE500] px-2.5 py-1 text-xs font-bold text-[#191600]"
              >
                💬 카톡
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-extrabold text-slate-900">증상</h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
            {symptomBody}
          </pre>

          {images.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-extrabold text-slate-900">첨부 사진</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {images.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener">
                    <div className="relative aspect-square overflow-hidden rounded-md border border-slate-200">
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 33vw, 200px"
                        className="object-cover"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900">손님 정보</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="이름" value={row.customer_name} />
              <Row label="마스킹" value={row.masked_name} />
              <Row label="연락처" value={row.phone} />
              <Row label="지역" value={row.region ?? "-"} />
              <Row label="아파트" value={row.apartment ?? "-"} />
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900">광고 추적</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="utm_source" value={row.utm_source ?? "-"} />
              <Row label="utm_campaign" value={row.utm_campaign ?? "-"} />
              <Row label="city_code" value={row.city_code ?? "-"} />
            </dl>
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AdminMemoField id={row.id} initial={row.admin_memo ?? ""} />
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="truncate text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
