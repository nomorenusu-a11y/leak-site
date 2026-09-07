"use client";
import { useState, useTransition } from "react";
import { savePostSeo } from "@/app/admin/posts/[id]/seo/actions";
import { PILOT_REGIONS } from "@/lib/regions";
import { AXIS_LABELS, SEO_TERMS } from "@/lib/seo/taxonomy";
import type { TermAxis } from "@/types/seo";
export function PostSeoForm({
  postId,
  regionId,
  termIds,
}: {
  postId: string;
  regionId: string;
  termIds: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function save(form: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await savePostSeo(
        postId,
        String(form.get("region") ?? ""),
        form.getAll("terms").map(String),
        form.get("verified") === "on",
      );
      setMessage(
        result.ok
          ? "분류를 저장했습니다. 기존 글의 본문·태그·카테고리는 유지됩니다."
          : (result.error ?? "저장 실패"),
      );
    });
  }
  return (
    <form action={save} className="max-w-3xl space-y-7">
      <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        실제 주소와 작업 기록으로 확인된 항목만 선택하세요. 계량기 회전은 증상이며 누수 원인으로
        분류하지 않습니다. 기존 지역 태그에서 법정동을 자동 추정하지 않습니다.
      </p>
      <div>
        <label htmlFor="case-region" className="mb-2 block font-bold">
          실제 시공 지역
        </label>
        <select
          id="case-region"
          name="region"
          defaultValue={regionId}
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3"
        >
          <option value="">확인되지 않음 / 지역 연결 해제</option>
          {PILOT_REGIONS.filter((r) => r.level !== "city").map((r) => (
            <option key={r.id} value={r.id}>
              {r.level === "dong" ? `도봉구 ${r.name}` : "도봉구 (법정동 미확인)"}
            </option>
          ))}
        </select>
      </div>
      {(Object.entries(AXIS_LABELS) as [TermAxis, string][]).map(([axis, label]) => (
        <fieldset key={axis} className="rounded-xl border border-slate-200 p-4">
          <legend className="px-2 font-bold">{label}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SEO_TERMS.filter((t) => t.axis === axis).map((t) => (
              <label key={t.id} className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="terms"
                  value={t.id}
                  defaultChecked={termIds.includes(t.id)}
                  className="size-4"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="flex items-start gap-3 text-sm font-semibold">
        <input type="checkbox" name="verified" required className="mt-1 size-4" />
        선택한 지역·증상·탐지방법·작업이 실제 현장 기록과 일치함을 확인했습니다.
      </label>
      <button
        disabled={pending}
        className="bg-brand-600 min-h-12 rounded-lg px-6 font-bold text-white disabled:opacity-50"
      >
        {pending ? "저장 중..." : "사례 분류 저장"}
      </button>
      <p role="status" className="text-sm leading-6">
        {message}
      </p>
    </form>
  );
}
