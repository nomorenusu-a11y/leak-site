"use client";
import { useState, useTransition } from "react";
import { savePostSeo } from "@/app/admin/posts/[id]/seo/actions";
import { regionById, SEOUL_DONGS, SEOUL_DISTRICTS } from "@/lib/regions";
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
  const initialRegion = regionById(regionId);
  const [selectedRegionId, setSelectedRegionId] = useState(regionId);
  const [regionQuery, setRegionQuery] = useState(
    initialRegion
      ? `${initialRegion.level === "dong" ? `${regionById(initialRegion.parent_id ?? "")?.name} ` : ""}${initialRegion.name}`
      : "",
  );
  const regionOptions = [...SEOUL_DISTRICTS, ...SEOUL_DONGS].filter((region) => {
    const parent = region.level === "dong" ? regionById(region.parent_id ?? "") : undefined;
    const label = `${parent?.name ?? ""} ${region.name}`;
    return !regionQuery || label.includes(regionQuery.trim());
  });
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
        <input type="hidden" name="region" value={selectedRegionId} />
        <input
          id="case-region"
          type="search"
          value={regionQuery}
          onChange={(event) => {
            setRegionQuery(event.target.value);
            setSelectedRegionId("");
          }}
          placeholder="예: 강남구 역삼동 또는 도봉구"
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-white p-3"
        />
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {!regionQuery && (
            <p className="p-3 text-sm text-slate-600">구 또는 법정동을 입력해 실제 작업 위치를 찾으세요.</p>
          )}
          {regionQuery && regionOptions.slice(0, 30).map((region) => {
            const parent = region.level === "dong" ? regionById(region.parent_id ?? "") : undefined;
            const label = region.level === "dong" ? `${parent?.name} ${region.name}` : `${region.name} (법정동 미확인)`;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  setSelectedRegionId(region.id);
                  setRegionQuery(label);
                }}
                className={`block min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${selectedRegionId === region.id ? "bg-brand-50 font-bold text-brand-800" : ""}`}
              >
                {label}
              </button>
            );
          })}
          {regionQuery && regionOptions.length === 0 && <p className="p-3 text-sm text-slate-600">일치하는 서울 구·법정동이 없습니다.</p>}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {selectedRegionId ? "선택한 실제 지역이 사례와 해당 구·서울 페이지에 자동 연결됩니다." : "선택하지 않으면 기존 지역 연결이 해제됩니다."}
        </p>
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
