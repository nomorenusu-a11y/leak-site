"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPost, updatePost } from "@/app/admin/posts/actions";
import type { PostFormFieldErrors } from "@/app/admin/posts/types";
import { MarkdownEditor } from "./MarkdownEditor";
import {
  CoverImageUploader,
  PostImagesUploader,
  type AdminPostImage,
} from "./ImageUploader";
import { RegionTagSelector } from "./RegionTagSelector";
import type { Post } from "@/types/database";

const CATEGORIES = ["누수 탐지", "누수 시공", "방수", "배관", "기타"] as const;

function defaultSlug(title: string): string {
  // 영문/숫자만 추출 → 못 만들면 timestamp fallback
  const ascii = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii.length >= 3) return ascii.slice(0, 80);
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `post-${ts}-${rand}`;
}

type Props = {
  mode: "create" | "edit";
  post?: Post;
  images?: AdminPostImage[];
};

export function PostForm({ mode, post, images = [] }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PostFormFieldErrors>({});

  // controlled state
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(Boolean(post?.slug));
  const [content, setContent] = useState(post?.content ?? "");

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugDirty) setSlug(defaultSlug(v));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    const data = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      content,
      excerpt: String(formData.get("excerpt") ?? ""),
      cover_image_url: String(formData.get("cover_image_url") ?? ""),
      category: String(formData.get("category") ?? ""),
      region_tags: formData.getAll("region_tags").map(String),
      published: formData.get("published") === "on",
    };
    startTransition(async () => {
      const r =
        mode === "create"
          ? await createPost(data)
          : await updatePost(post!.id, data);
      if (!r.ok) {
        setError(r.error);
        if (r.fieldErrors) setFieldErrors(r.fieldErrors);
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <Field label="제목" required error={fieldErrors.title}>
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={200}
          className={inputClass(!!fieldErrors.title)}
        />
      </Field>

      <Field
        label="슬러그 (URL용, 영문 소문자·숫자·하이픈)"
        required
        error={fieldErrors.slug}
        hint={`/posts/${slug || "..."}`}
      >
        <input
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugDirty(true);
          }}
          pattern="[a-z0-9]([a-z0-9\-]*[a-z0-9])?"
          maxLength={120}
          className={inputClass(!!fieldErrors.slug)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="카테고리" error={fieldErrors.category}>
          <select
            name="category"
            defaultValue={post?.category ?? ""}
            className={inputClass(!!fieldErrors.category)}
          >
            <option value="">선택 안 함</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="발행 상태" error={fieldErrors.published}>
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post?.published ?? true}
              className="size-4"
            />
            발행됨 (체크 해제 시 임시저장)
          </label>
        </Field>
      </div>

      <RegionTagSelector name="region_tags" initial={post?.region_tags ?? []} />

      <CoverImageUploader name="cover_image_url" initial={post?.cover_image_url ?? undefined} />

      <Field
        label="요약 (excerpt, 선택)"
        error={fieldErrors.excerpt}
        hint="비우면 본문 첫 150자 자동"
      >
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt ?? ""}
          maxLength={300}
          className={inputClass(!!fieldErrors.excerpt) + " resize-y"}
        />
      </Field>

      <MarkdownEditor value={content} onChange={setContent} error={fieldErrors.content} />

      {mode === "edit" && post && (
        <PostImagesUploader postId={post.id} initial={images} />
      )}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "저장 중..." : mode === "create" ? "글 생성" : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}

function inputClass(err: boolean) {
  return `w-full rounded-lg border ${err ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"} px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200`;
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="block text-sm font-bold text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {hint && <span className="truncate text-xs text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
