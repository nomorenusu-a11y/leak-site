"use client";

import { useState } from "react";
import { Check } from "@/components/icons";

/**
 * 시/도 → 구 2단계 칩 선택 UI.
 *
 * 단일 datalist 대신 명확한 두 단계로 분리. 사용자가 시/도를 먼저 고르면
 * 해당 시/도의 구 목록만 노출되어 선택 부담을 줄임.
 * 최종 값은 hidden input `region` ("서울 강남구" 형태)으로 form에 제출.
 */

type Province = "서울" | "인천" | "경기";

const DISTRICTS: Record<Province, string[]> = {
  서울: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  인천: [
    "계양구",
    "남동구",
    "동구",
    "미추홀구",
    "부평구",
    "서구",
    "연수구",
    "중구",
    "강화군",
    "옹진군",
  ],
  경기: [
    "가평군",
    "고양시",
    "과천시",
    "광명시",
    "광주시",
    "구리시",
    "군포시",
    "김포시",
    "남양주시",
    "동두천시",
    "부천시",
    "성남시",
    "수원시",
    "시흥시",
    "안산시",
    "안성시",
    "안양시",
    "양주시",
    "양평군",
    "여주시",
    "연천군",
    "오산시",
    "용인시",
    "의왕시",
    "의정부시",
    "이천시",
    "파주시",
    "평택시",
    "포천시",
    "하남시",
    "화성시",
  ],
};

const PROVINCES: Province[] = ["서울", "인천", "경기"];

type Props = {
  invalid?: boolean;
  errorId?: string;
};

export function RegionStepPicker({ invalid, errorId }: Props) {
  const [province, setProvince] = useState<Province | null>(null);
  const [district, setDistrict] = useState<string | null>(null);

  const composed =
    province && district ? `${province} ${district}` : province ?? "";

  function pickProvince(p: Province) {
    if (province === p) {
      // 같은 항목 재클릭 시 해제
      setProvince(null);
      setDistrict(null);
      return;
    }
    setProvince(p);
    setDistrict(null);
  }

  function reset() {
    setProvince(null);
    setDistrict(null);
  }

  function changeDistrict() {
    setDistrict(null);
  }

  return (
    <div
      aria-describedby={errorId}
      className={`rounded-lg border bg-white p-3 ${
        invalid ? "border-rose-400" : "border-slate-300"
      }`}
    >
      {/* form 제출 값 */}
      <input type="hidden" name="region" value={composed} />

      {/* 선택 결과 표시 + 변경 버튼 */}
      {province && district ? (
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
            {composed}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            다시 선택
          </button>
        </div>
      ) : (
        <>
          {/* 1단계: 시·도 */}
          <p className="mb-2 text-xs font-bold text-slate-700">
            1) 시·도 선택
          </p>
          <div className="flex flex-wrap gap-2">
            {PROVINCES.map((p) => {
              const active = province === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickProvince(p)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50"
                  }`}
                  aria-pressed={active}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* 2단계: 구·시 */}
          {province && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">
                  2) {province}의 {province === "경기" ? "시·군" : "구·군"}{" "}
                  선택
                </p>
                <button
                  type="button"
                  onClick={changeDistrict}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                >
                  시·도 다시
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DISTRICTS[province].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDistrict(d)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:bg-brand-50"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
