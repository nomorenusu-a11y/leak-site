import { assertAdmin } from "@/lib/auth";
import { getHeroBanner, getHeroSlides } from "@/lib/site-content";
import { HeroEditor } from "./HeroEditor";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await assertAdmin();

  const [banner, slides] = await Promise.all([getHeroBanner(), getHeroSlides()]);

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          히어로 관리
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          메인 페이지 상단 배너 문구와 캐러셀 슬라이드를 편집합니다.
        </p>
      </header>

      <div className="mt-6">
        <HeroEditor banner={banner} slides={slides} />
      </div>
    </>
  );
}
