"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMediaAsset } from "@/app/admin/media/actions";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function MediaLibraryUploader({ assetCount }: { assetCount: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function registerFolder(files: FileList | null) {
    const all = Array.from(files ?? []);
    const images = all.filter((file) => IMAGE_TYPES.has(file.type));
    const skipped = all.length - images.length;
    if (images.length === 0) {
      setMessage("등록할 JPG, PNG, WEBP 사진을 찾지 못했습니다.");
      return;
    }
    setMessage(
      `사진 ${images.length}장을 등록합니다. 영상 등 ${skipped}개 파일은 자동으로 제외됩니다.`,
    );
    startTransition(async () => {
      let done = 0;
      for (const image of images) {
        const data = new FormData();
        data.set("file", image);
        const result = await uploadMediaAsset(data);
        if (!result.ok) {
          setMessage(`${done}장 등록 후 중단: ${result.error}`);
          return;
        }
        done += 1;
        setMessage(`사진 라이브러리에 ${done}/${images.length}장 등록 중...`);
      }
      setMessage(`사진 ${done}장 등록 완료. 이제 자동 글쓰기에서 사진을 고를 필요가 없습니다.`);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold text-slate-900">사진 풀 한 번 등록하기</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        현재 등록된 사진은 <strong>{assetCount}장</strong>입니다. 사진과 영상이 섞인 폴더를 그대로
        고르면 JPG·PNG·WEBP 사진만 자동으로 등록하고 MP4·MOV는 건너뜁니다.
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
