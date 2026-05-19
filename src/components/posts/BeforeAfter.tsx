"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
};

/**
 * Before/After 비교 슬라이더. 사용자가 시공 전·후 사진을 받으면 글 상세에 삽입.
 * 누수 시공 카테고리의 가장 강한 신뢰 시그널.
 */
export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt = "시공 전",
  afterAlt = "시공 후",
}: Props) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt={beforeAlt}
            style={{ objectFit: "cover" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt={afterAlt}
            style={{ objectFit: "cover" }}
          />
        }
        defaultPosition={50}
        style={{ height: "min(420px, 60vw)" }}
      />
      <figcaption className="flex items-center justify-between bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
        <span>← 시공 전</span>
        <span>시공 후 →</span>
      </figcaption>
    </figure>
  );
}
