"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  uploadCoverImage,
  uploadPostImage,
  deletePostImage,
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

export type AdminPostImage = { id: string; url: string; sort_order: number };

export function PostImagesUploader({
  postId,
  initial,
}: {
  postId: string;
  initial: AdminPostImage[];
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
      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img) => (
            <li key={img.id} className="relative overflow-hidden rounded-md border border-slate-200">
              <Image
                src={img.url}
                alt=""
                width={200}
                height={150}
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white hover:bg-black"
                aria-label="삭제"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      {pending && <p className="mt-1.5 text-xs text-slate-500">처리 중...</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
