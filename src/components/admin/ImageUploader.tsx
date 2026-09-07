"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  uploadCoverImage,
  uploadPostImage,
  deletePostImage,
  updatePostImageMetadata,
} from "@/app/admin/posts/actions";

const ACCEPT = "image/jpeg,image/png,image/webp";

// ============================================================
// CoverImageUploader — 단일. URL을 state로 관리해 form submit 시 hidden input으로 전달.
// ============================================================

export function CoverImageUploader({
  name,
  initial,
}: {
  name: string;
  initial?: string;
}) {
  const [url, setUrl] = useState<string | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const r = await uploadCoverImage(fd);
      if (r.ok) setUrl(r.url);
      else setError(r.error);
    });
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-800">대표 이미지</label>
      <input type="hidden" name={name} value={url ?? ""} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {url ? (
          <div className="relative aspect-[4/3] w-full max-w-[200px] overflow-hidden rounded-lg border border-slate-200">
            <Image src={url} alt="" fill sizes="200px" className="object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full max-w-[200px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
            대표 이미지 없음
          </div>
        )}
        <div className="space-y-2">
          <input
            type="file"
            accept={ACCEPT}
            disabled={pending}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="block text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-60"
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl(null)}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              제거
            </button>
          )}
          {pending && <p className="text-xs text-slate-500">업로드 중...</p>}
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PostImagesUploader — 다중. 즉시 DB insert (postId 필요)
// ============================================================

export type AdminPostImage = {
  id: string;
  url: string;
  sort_order: number;
  alt_text: string | null;
  caption: string | null;
  work_stage: string | null;
  image_variant: "original" | "annotated";
  overlay_text: string | null;
};

export function PostImagesUploader({
  postId,
  initial,
  onInsertMarker,
}: {
  postId: string;
  initial: AdminPostImage[];
  onInsertMarker?: (marker: string) => void;
}) {
  const [images, setImages] = useState<AdminPostImage[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      const added: AdminPostImage[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const r = await uploadPostImage(postId, fd);
        if (!r.ok) {
          setError(r.error);
          break;
        }
        added.push(r.image);
      }
      if (added.length > 0) setImages((prev) => [...prev, ...added]);
    });
  }

  function handleRemove(imageId: string) {
    setError(null);
    startTransition(async () => {
      const r = await deletePostImage(imageId);
      if (r.ok) setImages((prev) => prev.filter((i) => i.id !== imageId));
      else setError(r.error);
    });
  }

  function handleMetadata(imageId: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePostImageMetadata(imageId, {
        alt_text: String(formData.get("alt_text") ?? ""),
        caption: String(formData.get("caption") ?? ""),
        work_stage: String(formData.get("work_stage") ?? ""),
        overlay_text: String(formData.get("overlay_text") ?? ""),
      });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-800">추가 이미지 (현장 사진)</label>
      <input
        type="file"
        accept={ACCEPT}
        multiple
        disabled={pending}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="block text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-60"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">
        원본 사진의 설명은 ALT·캡션으로 관리합니다. 사진 위 강조 문구는 별도 강조 이미지에만
        입력하세요.
      </p>
      {images.length > 0 && (
        <ul className="mt-4 space-y-4">
          {images.map((img) => (
            <li key={img.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Image
                    src={img.url}
                    alt=""
                    width={360}
                    height={270}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded bg-slate-900/75 px-2 py-1 text-[11px] font-bold text-white">
                    {img.image_variant === "annotated" ? "강조 이미지" : "원본"}
                  </span>
                </div>
                <form action={(formData) => handleMetadata(img.id, formData)} className="grid gap-3">
                  <label className="grid gap-1 text-xs font-bold text-slate-700">
                    ALT 텍스트
                    <input name="alt_text" defaultValue={img.alt_text ?? ""} maxLength={180} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal" />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-slate-700">
                    캡션
                    <input name="caption" defaultValue={img.caption ?? ""} maxLength={240} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-xs font-bold text-slate-700">
                      작업 단계
                      <input name="work_stage" defaultValue={img.work_stage ?? ""} maxLength={80} placeholder="예: 가스탐지 반응 확인" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal" />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-700">
                      사진 위 강조 문구
                      <input name="overlay_text" defaultValue={img.overlay_text ?? ""} maxLength={80} disabled={img.image_variant !== "annotated"} placeholder={img.image_variant === "annotated" ? "예: 누수 위치" : "강조 이미지에만 사용"} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal disabled:bg-slate-100" />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {onInsertMarker && (
                      <button
                        type="button"
                        onClick={() => onInsertMarker(`[[post-image:${img.id}]]`)}
                        disabled={pending}
                        className="rounded-md border border-brand-200 bg-white px-3 py-2 text-xs font-bold text-brand-700 disabled:opacity-50"
                      >
                        본문에 삽입
                      </button>
                    )}
                    <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                      설명 저장
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(img.id)}
                      disabled={pending}
                      className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                    >
                      사진 삭제
                    </button>
                  </div>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pending && <p className="mt-1.5 text-xs text-slate-500">처리 중...</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
