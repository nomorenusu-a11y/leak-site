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
    </section>
  );
}
