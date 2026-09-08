"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  updatePost,
  updatePostImageMetadata,
  uploadPostImage,
} from "@/app/admin/posts/actions";
import allRegionData from "@/data/seo/seoul-regions.json";
import type { Region } from "@/types/seo";

const LEAK_TYPES = [
  { value: "수도배관 누수", slug: "water-pipe" },
  { value: "온수배관 누수", slug: "hot-water-pipe" },
  { value: "난방배관 누수", slug: "heating-pipe" },
  { value: "보일러 누수", slug: "boiler" },
  { value: "매립배관 누수", slug: "buried-pipe" },
  { value: "화장실·욕실 누수", slug: "bathroom" },
  { value: "천장 누수", slug: "ceiling" },
  { value: "베란다 누수", slug: "veranda" },
] as const;

const SYMPTOMS = [
  "바닥 습기",
  "천장 물자국",
  "벽지 젖음",
  "수도요금 증가",
  "보일러 압력 저하",
  "아랫집 누수",
];

type Draft = { title: string; excerpt: string; content: string; imageStages: string[] };

const regions = allRegionData as Region[];
const districts = regions.filter((item) => item.level === "district");
const dongs = regions.filter((item) => item.level === "dong");

function randomPick<T>(items: T[], count: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length));
}

function buildDraft(place: string, leak: string, symptom: string, imageCount: number): Draft {
  const stages = [
    "현장 상태 확인",
    "누수 의심 부위 점검",
    "배관 주변 확인",
    "필요 작업 안내",
    "마무리 상태 확인",
  ].slice(0, imageCount);
  const sections = stages.map(
    (stage, index) =>
      `## ${index + 1}. ${stage}\n\n${place}에서 ${symptom}이 보일 때는 증상만으로 원인을 단정하지 않고, 물이 보이는 위치와 주변 상태를 먼저 확인합니다.\n\n[[AUTO_IMAGE_${index}]]\n\n사진은 점검 과정을 이해하기 위한 현장 이미지입니다. 실제 원인과 작업 범위는 현장 상태를 확인한 뒤 안내합니다.`,
  );
  return {
    title: `${place} ${leak} 점검 상담 | ${symptom} 확인과 작업 안내`,
    excerpt: `${place} ${leak}가 의심될 때 ${symptom}을 중심으로 확인할 점과 상담 방법을 안내합니다.`,
    imageStages: stages,
    content: `## ${place} ${leak} 상담 안내\n\n${place}에서 ${leak}가 의심되거나 ${symptom}이 보이면, 주소와 증상을 전화로 알려 주세요. 건물 구조와 물이 보이는 위치에 따라 확인 범위가 달라집니다.\n\n${sections.join("\n\n")}\n\n## ${place} 누수 상담\n\n${leak}, 아파트 누수, 화장실·욕실 누수, 천장 누수, 수도·온수·난방배관 누수 상담이 필요하면 **010-5700-4026**으로 전화해 주세요.`,
  };
}

export function AutoPostComposer() {
  const router = useRouter();
  const [districtId, setDistrictId] = useState(districts[0]?.id ?? "");
  const [dongId, setDongId] = useState("");
  const [leak, setLeak] = useState<(typeof LEAK_TYPES)[number]>(LEAK_TYPES[0]);
  const [symptom, setSymptom] = useState(SYMPTOMS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [picked, setPicked] = useState<File[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const district = districts.find((item) => item.id === districtId);
  const availableDongs = dongs.filter((item) => item.parent_id === districtId);
  const dong = availableDongs.find((item) => item.id === dongId);
  const place = dong?.name ?? district?.name ?? "서울";

  function generate() {
    setError(null);
    const nextPicked = randomPick(files, files.length ? 5 : 0);
    setPicked(nextPicked);
    setDraft(buildDraft(place, leak.value, symptom, nextPicked.length));
  }

  function saveDraft() {
    if (!draft || !district) return;
    setError(null);
    startTransition(async () => {
      const slug = `auto-${district.slug}-${dong?.slug ?? "district"}-${leak.slug}-${Date.now().toString(36)}`;
      const created = await createPost({
        title: draft.title,
        slug,
        content: draft.content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, ""),
        excerpt: draft.excerpt,
        category: "leak",
        region_tags: [district.name],
        published: false,
      });
      if (!created.ok) return setError(created.error);

      const imageIds: string[] = [];
      for (let index = 0; index < picked.length; index += 1) {
        const data = new FormData();
        data.set("file", picked[index]);
        const uploaded = await uploadPostImage(created.postId, data);
        if (!uploaded.ok) return setError(`사진 ${index + 1} 업로드 실패: ${uploaded.error}`);
        imageIds.push(uploaded.image.id);
        await updatePostImageMetadata(uploaded.image.id, {
          work_stage: draft.imageStages[index],
          alt_text: `${place} ${leak.value} ${draft.imageStages[index]} 현장 사진`,
          caption: `${leak.value} 점검 과정에서 ${draft.imageStages[index]}를 보여주는 현장 사진입니다.`,
          overlay_text: "",
        });
      }
      const content = draft.content.replace(/\[\[AUTO_IMAGE_(\d+)\]\]/g, (_, raw) => {
        const id = imageIds[Number(raw)];
        return id ? `[[post-image:${id}]]` : "";
      });
      const updated = await updatePost(created.postId, {
        title: draft.title,
        slug,
        content,
        excerpt: draft.excerpt,
        category: "leak",
        region_tags: [district.name],
        published: false,
      });
      if (!updated.ok) return setError(updated.error);
      router.push(`/admin/posts/${created.postId}/edit`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="space-y-5">
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          구 선택
          <select
            value={districtId}
            onChange={(event) => {
              setDistrictId(event.target.value);
              setDongId("");
            }}
            className="rounded-lg border border-slate-300 px-3 py-3 font-normal"
          >
            {districts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          법정동 선택 <span className="font-normal text-slate-500">(선택)</span>
          <select
            value={dongId}
            onChange={(event) => setDongId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-3 font-normal"
          >
            <option value="">구 전체</option>
            {availableDongs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          누수 유형
          <select
            value={leak.value}
            onChange={(event) =>
              setLeak(LEAK_TYPES.find((item) => item.value === event.target.value) ?? LEAK_TYPES[0])
            }
            className="rounded-lg border border-slate-300 px-3 py-3 font-normal"
          >
            {LEAK_TYPES.map((item) => (
              <option key={item.value}>{item.value}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          대표 증상
          <select
            value={symptom}
            onChange={(event) => setSymptom(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-3 font-normal"
          >
            {SYMPTOMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          현장 사진 폴더
          <input
            ref={(node) => {
              fileInput.current = node;
              node?.setAttribute("webkitdirectory", "");
            }}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="file:bg-brand-50 file:text-brand-700 block w-full text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-bold"
          />
          <span className="text-xs leading-5 font-normal text-slate-500">
            폴더를 선택하면 최대 5장을 무작위로 골라 글 사이에 배치합니다. 아직 사진을 고르지 않아도
            글 초안은 만들 수 있습니다.
          </span>
        </label>
        <button
          type="button"
          onClick={generate}
          className="bg-brand-600 hover:bg-brand-700 w-full rounded-lg px-4 py-3 font-bold text-white"
        >
          자동 초안 만들기
        </button>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        {draft ? (
          <>
            <p className="text-brand-700 text-xs font-bold tracking-wider">임시저장 전 미리보기</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">{draft.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{draft.excerpt}</p>
            <p className="mt-5 rounded-lg bg-white p-3 text-sm font-semibold text-slate-700">
              선택 사진: {picked.length}장 · 저장 시 글 속 사진 위치와 ALT·캡션이 자동 등록됩니다.
            </p>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-white p-4 text-sm leading-6 whitespace-pre-wrap text-slate-700">
              {draft.content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, "[사진]")}
            </pre>
            <button
              type="button"
              disabled={pending}
              onClick={saveDraft}
              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-bold text-white disabled:bg-slate-400"
            >
              {pending ? "사진과 초안을 저장 중..." : "임시저장하고 편집하기"}
            </button>
          </>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            왼쪽에서 지역과 누수 유형을 선택한 뒤 자동 초안 만들기를 누르세요. 발행은 하지 않으며,
            먼저 임시저장됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
