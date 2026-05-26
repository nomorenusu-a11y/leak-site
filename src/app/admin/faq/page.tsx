import { assertAdmin } from "@/lib/auth";
import { getFaqItems } from "@/lib/site-content";
import { FaqEditor } from "./FaqEditor";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  await assertAdmin();
  const items = await getFaqItems();

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          FAQ 관리
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          자주 묻는 질문을 추가하거나 수정하세요.
        </p>
      </header>

      <div className="mt-6">
        <FaqEditor items={items} />
      </div>
    </>
  );
}
