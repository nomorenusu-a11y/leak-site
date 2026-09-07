import Image from "next/image";
import type { ReactNode } from "react";
import type { CaseStudyDraft } from "@/types/case-study";
import type { PostImage } from "@/types/database";

export function CaseStudyArticle({
  draft,
  images,
  inlineCta,
}: {
  draft: CaseStudyDraft;
  images: PostImage[];
  inlineCta?: ReactNode;
}) {
  const imageById = new Map(images.map((image) => [image.id, image]));
  const ctaAfterStep = Math.max(1, Math.ceil(draft.steps.length / 2));

  return (
    <div className="text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
      <div className="space-y-4">
        {draft.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {draft.steps.map((step, index) => {
        const image = imageById.get(step.imageId);
        if (!image) return null;
        return (
          <section key={step.imageId} className="mt-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{step.title}</h2>
            <div className="mt-4 space-y-4">
              {step.beforePhoto.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <figure className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Image src={image.url} alt={image.alt_text ?? ""} width={1600} height={1200} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full object-contain" />
              <figcaption className="border-t border-slate-100 px-4 py-3.5 text-sm leading-6 text-slate-700">{step.caption}</figcaption>
            </figure>
            {step.afterPhoto && (
              <div className="space-y-4">
                {step.afterPhoto.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
            {inlineCta && index + 1 === ctaAfterStep && inlineCta}
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{draft.symptomsHeading}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-brand-700">
          {draft.symptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>
        <p className="mt-5">{draft.closing}</p>
      </section>
    </div>
  );
}
