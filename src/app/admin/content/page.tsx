import { assertAdmin } from "@/lib/auth";
import {
  getAboutCards,
  getMasterSection,
  getTimeSection,
  getEquipment,
  getServicesLeak,
  getServicesPipe,
} from "@/lib/site-content";
import { ContentEditor } from "./ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await assertAdmin();

  const [aboutCards, masterSection, timeSection, equipment, servicesLeak, servicesPipe] =
    await Promise.all([
      getAboutCards(),
      getMasterSection(),
      getTimeSection(),
      getEquipment(),
      getServicesLeak(),
      getServicesPipe(),
    ]);

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          메인 콘텐츠 관리
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          메인 페이지 각 섹션의 텍스트와 항목을 편집합니다.
        </p>
      </header>

      <div className="mt-6">
        <ContentEditor
          aboutCards={aboutCards}
          masterSection={masterSection}
          timeSection={timeSection}
          equipment={equipment}
          servicesLeak={servicesLeak}
          servicesPipe={servicesPipe}
        />
      </div>
    </>
  );
}
