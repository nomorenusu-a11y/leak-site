"use client";

import { useState, useCallback } from "react";
import type { HeroBannerData, HeroSlideData } from "@/types/database";
import { saveHeroBanner, saveHeroSlides } from "./actions";

// ============================================================
// 상태 타입
// ============================================================

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ============================================================
// 스타일 상수
// ============================================================

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1";
const primaryBtnCls =
  "rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50";
const cardCls = "rounded-xl border border-slate-200 bg-white p-5";
const dangerBtnCls =
  "rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";
const ghostBtnCls =
  "rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40";

// ============================================================
// 빈 슬라이드 기본값
// ============================================================

function emptySlide(): HeroSlideData {
  return {
    src: "",
    alt: "",
    tag: "",
    tagColor: "",
    line1: "",
    line2: "",
    line2Color: "",
    sub: "",
    hashtags: [],
  };
}

// ============================================================
// 저장 상태 버튼 텍스트
// ============================================================

function statusText(status: SaveStatus, label: string): string {
  switch (status) {
    case "saving":
      return "저장 중...";
    case "saved":
      return "저장 완료";
    case "error":
      return "오류 발생";
    default:
      return label;
  }
}

// ============================================================
// 컴포넌트
// ============================================================

export function HeroEditor({
  banner: initialBanner,
  slides: initialSlides,
}: {
  banner: HeroBannerData;
  slides: HeroSlideData[];
}) {
  // --- Banner state ---
  const [banner, setBanner] = useState<HeroBannerData>(initialBanner);
  const [bannerStatus, setBannerStatus] = useState<SaveStatus>("idle");

  // --- Slides state ---
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides);
  const [slidesStatus, setSlidesStatus] = useState<SaveStatus>("idle");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // ========================================
  // Banner handlers
  // ========================================

  const handleBannerSave = useCallback(async () => {
    setBannerStatus("saving");
    try {
      await saveHeroBanner(banner);
      setBannerStatus("saved");
      setTimeout(() => setBannerStatus("idle"), 2000);
    } catch {
      setBannerStatus("error");
      setTimeout(() => setBannerStatus("idle"), 3000);
    }
  }, [banner]);

  // ========================================
  // Slide helpers
  // ========================================

  const updateSlide = useCallback(
    (index: number, patch: Partial<HeroSlideData>) => {
      setSlides((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const moveSlide = useCallback((index: number, direction: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOpenIndex((prev) => {
      if (prev === index) return index + direction;
      return prev;
    });
  }, []);

  const removeSlide = useCallback((index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex(null);
  }, []);

  const addSlide = useCallback(() => {
    setSlides((prev) => [...prev, emptySlide()]);
    setOpenIndex((prev) => (prev !== null ? prev : slides.length));
  }, [slides.length]);

  const handleSlidesSave = useCallback(async () => {
    setSlidesStatus("saving");
    try {
      await saveHeroSlides(slides);
      setSlidesStatus("saved");
      setTimeout(() => setSlidesStatus("idle"), 2000);
    } catch {
      setSlidesStatus("error");
      setTimeout(() => setSlidesStatus("idle"), 3000);
    }
  }, [slides]);

  // ========================================
  // Render
  // ========================================

  return (
    <div className="space-y-8">
      {/* ====== 배너 섹션 ====== */}
      <section className={cardCls}>
        <h2 className="text-lg font-bold text-slate-900">배너 문구</h2>
        <p className="mt-1 text-xs text-slate-500">
          메인 페이지 최상단에 표시되는 강조 문구입니다.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>하이라이트</label>
            <input
              className={inputCls}
              value={banner.highlight}
              onChange={(e) =>
                setBanner((b) => ({ ...b, highlight: e.target.value }))
              }
              placeholder="예: ✨ 신속함과 정직함으로"
            />
          </div>
          <div>
            <label className={labelCls}>본문</label>
            <input
              className={inputCls}
              value={banner.text}
              onChange={(e) =>
                setBanner((b) => ({ ...b, text: e.target.value }))
              }
              placeholder="예: 수도권 365일 24시간 누수 출동 전문업체"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            className={primaryBtnCls}
            disabled={bannerStatus === "saving"}
            onClick={handleBannerSave}
          >
            {statusText(bannerStatus, "배너 저장")}
          </button>
        </div>
      </section>

      {/* ====== 슬라이드 섹션 ====== */}
      <section className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">캐러셀 슬라이드</h2>
            <p className="mt-1 text-xs text-slate-500">
              히어로 캐러셀에 표시되는 슬라이드 목록입니다. ({slides.length}개)
            </p>
          </div>
          <button className={primaryBtnCls} onClick={addSlide}>
            슬라이드 추가
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {slides.map((slide, idx) => {
            const isOpen = openIndex === idx;
            return (
              <li
                key={idx}
                className="rounded-lg border border-slate-200 bg-slate-50"
              >
                {/* 헤더 (접기/펼치기) */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    #{idx + 1} &mdash; {slide.tag || "(태그 없음)"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isOpen ? "접기 ▲" : "펼치기 ▼"}
                  </span>
                </button>

                {/* 펼친 영역 */}
                {isOpen && (
                  <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>이미지 경로 (src)</label>
                        <input
                          className={inputCls}
                          value={slide.src}
                          onChange={(e) =>
                            updateSlide(idx, { src: e.target.value })
                          }
                          placeholder="/about/dispatch.png"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>대체 텍스트 (alt)</label>
                        <input
                          className={inputCls}
                          value={slide.alt}
                          onChange={(e) =>
                            updateSlide(idx, { alt: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelCls}>태그</label>
                        <input
                          className={inputCls}
                          value={slide.tag}
                          onChange={(e) =>
                            updateSlide(idx, { tag: e.target.value })
                          }
                          placeholder="24시간 긴급출동"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>태그 색상 (CSS 클래스)</label>
                        <input
                          className={inputCls}
                          value={slide.tagColor}
                          onChange={(e) =>
                            updateSlide(idx, { tagColor: e.target.value })
                          }
                          placeholder="bg-cyan-500/30 text-cyan-200"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>라인 1</label>
                        <input
                          className={inputCls}
                          value={slide.line1}
                          onChange={(e) =>
                            updateSlide(idx, { line1: e.target.value })
                          }
                          placeholder="365일 24시간"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>라인 2</label>
                        <input
                          className={inputCls}
                          value={slide.line2}
                          onChange={(e) =>
                            updateSlide(idx, { line2: e.target.value })
                          }
                          placeholder="긴급 출동"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>라인 2 색상 (CSS 클래스)</label>
                        <input
                          className={inputCls}
                          value={slide.line2Color}
                          onChange={(e) =>
                            updateSlide(idx, { line2Color: e.target.value })
                          }
                          placeholder="text-yellow-300"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>서브 텍스트</label>
                        <input
                          className={inputCls}
                          value={slide.sub}
                          onChange={(e) =>
                            updateSlide(idx, { sub: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          해시태그 (쉼표로 구분)
                        </label>
                        <input
                          className={inputCls}
                          value={slide.hashtags.join(", ")}
                          onChange={(e) =>
                            updateSlide(idx, {
                              hashtags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="24시간출동, 수도권전지역, 긴급누수"
                        />
                      </div>
                    </div>

                    {/* 슬라이드 액션 버튼 */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        className={ghostBtnCls}
                        disabled={idx === 0}
                        onClick={() => moveSlide(idx, -1)}
                      >
                        위로 이동
                      </button>
                      <button
                        className={ghostBtnCls}
                        disabled={idx === slides.length - 1}
                        onClick={() => moveSlide(idx, 1)}
                      >
                        아래로 이동
                      </button>
                      <div className="flex-1" />
                      <button
                        className={dangerBtnCls}
                        onClick={() => removeSlide(idx)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {slides.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-400">
            슬라이드가 없습니다. &ldquo;슬라이드 추가&rdquo; 버튼을 눌러주세요.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            className={primaryBtnCls}
            disabled={slidesStatus === "saving"}
            onClick={handleSlidesSave}
          >
            {statusText(slidesStatus, "슬라이드 저장")}
          </button>
        </div>
      </section>
    </div>
  );
}
