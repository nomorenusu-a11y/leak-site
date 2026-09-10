"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMediaAsset } from "@/app/admin/media/actions";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const INITIAL_LIBRARY_SIZE = 180;

function isImage(file: File) {
  return IMAGE_TYPES.has(file.type) || IMAGE_EXTENSIONS.test(file.name);
}

function randomSample<T>(items: T[], count: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length));
}

async function makeWebOptimizedCopy(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const longestSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, 1600 / longestSide);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지 변환을 시작하지 못했습니다.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("이미지 변환에 실패했습니다."))),
      "image/webp",
      0.8,
    ),
  );
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export function MediaLibraryUploader({ assetCount }: { assetCount: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [coverMessage, setCoverMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function registerFolder(files: FileList | null) {
    const all = Array.from(files ?? []);
    const images = all.filter(isImage);
    const skipped = all.length - images.length;
    if (images.length === 0) {
      setMessage("등록할 JPG, PNG, WEBP 사진을 찾지 못했습니다.");
      return;
    }
    const selected = randomSample(images, INITIAL_LIBRARY_SIZE);
    setMessage(
      `사진 ${images.length}장 중 ${selected.length}장을 무작위로 골라 웹용으로 줄여 등록합니다. 영상 등 ${skipped}개 파일은 자동으로 제외됩니다.`,
    );
    startTransition(async () => {
      let done = 0;
      for (const image of selected) {
        try {
          const optimized = await makeWebOptimizedCopy(image);
          const data = new FormData();
          data.set("file", optimized);
          const result = await uploadMediaAsset(data);
          if (!result.ok) {
            setMessage(`${done}장 등록 후 중단: ${result.error}`);
            return;
          }
        } catch {
          setMessage(`${done}장 등록 후 중단: 사진 변환에 실패했습니다.`);
          return;
        }
        done += 1;
        setMessage(`사진 라이브러리에 ${done}/${selected.length}장 등록 중...`);
      }
      setMessage(`사진 ${done}장 등록 완료. 이제 자동 글쓰기에서 사진을 고를 필요가 없습니다.`);
    });
  }

  function fillMissingCovers() {
    setCoverMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch("/admin/api/backfill-post-covers", { method: "POST" });
        const result = await response.json() as { ok?: boolean; updated?: number; missing?: number; error?: string };
        if (!response.ok || !result.ok) {
          setCoverMessage(result.error ?? "대표사진 자동 지정에 실패했습니다.");
          return;
        }
        setCoverMessage(result.updated ? `대표사진이 비어 있던 글 ${result.updated}개에 첫 번째 본문 사진을 지정했습니다.` : "대표사진이 비어 있는 공개 글이 없습니다.");
      } catch {
        setCoverMessage("대표사진 자동 지정 요청에 실패했습니다.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold text-slate-900">사진 풀 한 번 등록하기</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        현재 등록된 사진은 <strong>{assetCount}장</strong>입니다. 사진과 영상이 섞인 폴더를 그대로
        고르면 MP4·MOV는 건너뛰고 사진 중 180장을 무작위로 골라 웹용 사본으로 줄여 등록합니다.
      </p>
      <input
        ref={(node) => {
          inputRef.current = node;
          node?.setAttribute("webkitdirectory", "");
        }}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => registerFolder(event.target.files)}
        disabled={pending}
        className="file:bg-brand-50 file:text-brand-700 mt-5 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:px-4 file:py-2.5 file:font-bold disabled:opacity-60"
      />
      {message && (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          {message}
        </p>
      )}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-sm font-extrabold text-slate-900">대표사진 자동 관리</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">대표사진을 지정하지 않은 글은 첫 번째 본문 사진을 카드·공유 이미지용 대표사진으로 자동 사용합니다. 이미 정한 대표사진은 바꾸지 않습니다.</p>
        <button type="button" disabled={pending} onClick={fillMissingCovers} className="mt-3 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-60">기존 글 대표사진 자동 채우기</button>
        {coverMessage && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">{coverMessage}</p>}
      </div>
    </section>
  );
}
