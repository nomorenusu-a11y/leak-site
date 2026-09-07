-- Existing originals remain untouched. Annotated derivatives are separate rows.
alter table public.post_images
  add column if not exists caption text,
  add column if not exists work_stage text,
  add column if not exists image_variant text not null default 'original'
    check (image_variant in ('original', 'annotated')),
  add column if not exists original_image_id uuid references public.post_images(id) on delete cascade,
  add column if not exists overlay_text text;

create index if not exists post_images_original_image_id_idx on public.post_images(original_image_id);

comment on column public.post_images.image_variant is 'original is the uploaded evidence; annotated is a separately stored derivative.';
comment on column public.post_images.overlay_text is 'Short explanatory text shown only on an annotated derivative, never a substitute for alt text.';
