import { assertAdmin } from "@/lib/auth";
import { getTestimonials } from "@/lib/site-content";
import { ReviewsEditor } from "./ReviewsEditor";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await assertAdmin();
  const items = await getTestimonials();

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          후기 관리
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          메인 페이지에 표시되는 고객 후기를 관리합니다.
        </p>
      </header>

      <div className="mt-6">
        <ReviewsEditor items={items} />
      </div>
    </>
  );
}
