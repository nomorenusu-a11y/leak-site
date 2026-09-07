import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/posts/PostCard";
import { PhoneButton, KakaoButton } from "@/components/landing/CtaButtons";
import { MobileBottomBar } from "@/components/landing/v2/MobileBottomBar";
import { RegionBreadcrumbs } from "./RegionBreadcrumbs";
import { DOBONG, PILOT_REGIONS, regionPath } from "@/lib/regions";
import { getPublicRegionContent } from "@/lib/region-content";
import { getRegionPosts } from "@/lib/region-posts";
import {
  breadcrumbJsonLd,
  regionFaqJsonLd,
  regionFaqs,
  regionHeroDescription,
  regionPageTitle,
  safeJsonLd,
} from "@/lib/seo/regions";
import type { Region } from "@/types/seo";

const SYMPTOMS = [
  "계량기가 계속 돌아가요",
  "수도요금이 갑자기 늘었어요",
  "천장에 물자국이 생겼어요",
  "화장실이나 욕실 주변이 젖어 있어요",
  "보일러 압력이 계속 떨어져요",
];

const RELATED_LEAK_SERVICES = [
  "아파트 누수",
  "화장실 누수",
  "욕실 누수",
  "천장 누수",
  "수도배관 누수",
  "온수배관 누수",
  "난방배관 누수",
  "보일러 누수",
  "계량기 누수",
  "배관 누수",
];

const CHECK_STEPS = [
  ["1", "주소와 증상 확인", "전화로 관찰한 증상과 위치를 먼저 듣습니다."],
  ["2", "현장 상태 점검", "누수 여부와 확인이 필요한 범위를 살핍니다."],
  ["3", "필요한 작업 안내", "확인 결과에 따라 탐지와 보수 방향을 안내합니다."],
];

export async function RegionPage({ region }: { region: Region }) {
  const content = await getPublicRegionContent(region);
  if (!content) notFound();
  const [{ posts, unavailable }, nearbyResult, children] = await Promise.all([
    getRegionPosts(region),
    region.level === "dong" ? getRegionPosts(DOBONG) : Promise.resolve(null),
    Promise.all(
      PILOT_REGIONS.filter((r) => r.parent_id === region.id).map(async (r) => ({
        region: r,
        content: await getPublicRegionContent(r),
      })),
    ),
  ]);
  const visibleChildren = children.filter((r) => r.content);
  const hasVerifiedLocalCases = posts.length > 0;
  const casePosts = hasVerifiedLocalCases ? posts : (nearbyResult?.posts ?? []);
  const caseUnavailable = !hasVerifiedLocalCases && (nearbyResult?.unavailable ?? unavailable);
  const isNearbyEvidence = region.level === "dong" && !hasVerifiedLocalCases;
  const isDongPage = region.level === "dong";
  const pageTitle = regionPageTitle(region, content);
  const heroDescription = regionHeroDescription(region, content);
  const faqs = regionFaqs(region, content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd(region)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(regionFaqJsonLd(region, content)) }}
      />
      <Header showBack />
      <main className="flex-1 pb-24">
        <section className="border-b border-slate-200 bg-slate-50 py-5 sm:py-10">
          <Container>
            <RegionBreadcrumbs region={region} />
            <p className="text-brand-700 mt-4 text-sm font-bold">
              {region.name} 누수탐지 전화 상담
            </p>
            <h1 className="mt-2 max-w-3xl text-[30px] leading-tight font-extrabold break-keep text-slate-900 sm:mt-3 sm:text-4xl">
              {pageTitle}
            </h1>
            <p className="mt-3 max-w-3xl leading-6 break-keep text-slate-600 sm:mt-5 sm:leading-8">
              {heroDescription}
            </p>
            <div className="mt-5 max-w-md">
              <PhoneButton block label="지금 전화 상담 · 010-5700-4026" />
            </div>
          </Container>
        </section>
        <Container className="space-y-12 py-10 sm:space-y-16">
          <section aria-labelledby="region-symptoms">
            <p className="text-brand-700 text-sm font-bold">누수 의심 신호</p>
            <h2 id="region-symptoms" className="mt-2 text-2xl font-extrabold">
              {isDongPage ? `${region.name} 누수 증상, 이런 경우인가요?` : "이런 증상인가요?"}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              아래와 같은 변화가 보인다면, 사진을 찾느라 기다리지 말고 증상부터 전화로 알려 주세요.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {SYMPTOMS.map((symptom) => (
                <li
                  key={symptom}
                  className="flex min-h-14 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800"
                >
                  <span aria-hidden className="text-brand-600 mr-2">
                    ✓
                  </span>
                  {symptom}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="regional-cases">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-brand-700 text-sm font-bold">작업 근거</p>
                <h2 id="regional-cases" className="mt-2 text-2xl font-extrabold">
                  {isNearbyEvidence
                    ? "도봉구 인근 실제 사례"
                    : region.level === "city"
                      ? "도봉구 실제 시공사례"
                      : `${region.name} 실제 시공사례`}
                </h2>
              </div>
              <Link
                href="/posts/region/dobong"
                className="text-brand-700 min-h-12 py-2 font-semibold underline underline-offset-4"
              >
                도봉구 사례 게시판
              </Link>
            </div>
            {isNearbyEvidence ? (
              <p className="mt-3 leading-7 text-slate-600">
                현재 {region.name}으로 확인된 공개 사례는 아직 없습니다. 아래는 도봉구에서 확인된
                실제 사례이며, {region.name} 사례라고 표시하지 않습니다.
              </p>
            ) : (
              <p className="mt-3 leading-7 text-slate-600">
                작업 지역이 확인된 기존 시공사례만 보여드립니다. 구 태그만 있는 글의 법정동은
                추정하지 않습니다.
              </p>
            )}
            {casePosts.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {casePosts.slice(0, 3).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 leading-7 text-slate-600">
                {caseUnavailable
                  ? "현재 시공사례 목록을 불러올 수 없습니다. 기존 사례 게시판을 확인하거나 전화로 문의해 주세요."
                  : `${isNearbyEvidence ? "도봉구 인근 실제 사례도" : `${region.name}으로 확인된 공개 시공사례가`} 아직 공개되어 있지 않습니다. 존재하지 않는 사례를 만들지 않고, 등록된 실제 사례만 이곳에 표시합니다.`}
              </div>
            )}
            <Link
              href="/posts"
              className="text-brand-700 mt-4 inline-flex min-h-12 items-center font-semibold hover:underline"
            >
              전체 시공사례 보기 →
            </Link>
          </section>

          <section
            className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8"
            aria-labelledby="mid-call"
          >
            <h2 id="mid-call" className="text-2xl font-extrabold">
              증상과 주소를 전화로 바로 알려주세요
            </h2>
            <p className="mt-3 leading-7 text-slate-200">
              방문 가능 여부와 확인할 내용을 빠르게 안내해 드립니다.
            </p>
            <div className="mt-5 max-w-md">
              <PhoneButton block label="전화 상담 · 010-5700-4026" />
            </div>
          </section>

          {isDongPage && (
            <section aria-labelledby="related-leak-services">
              <p className="text-brand-700 text-sm font-bold">관련 누수 상담</p>
              <h2 id="related-leak-services" className="mt-2 text-2xl font-extrabold">
                {region.name} 누수 종류 상담 항목
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                증상만으로 원인을 정하지 않습니다. 아래 항목 중 가까운 상황을 골라 전화 상담에서
                알려 주세요.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {RELATED_LEAK_SERVICES.map((service) => (
                  <Link
                    key={service}
                    href="#quote-form"
                    className="text-brand-800 hover:border-brand-500 hover:bg-brand-50 flex min-h-14 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold transition"
                  >
                    <span>
                      {region.name} {service}
                    </span>
                    <span aria-hidden>상담 →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="inspection-steps">
            <p className="text-brand-700 text-sm font-bold">상담부터 현장 확인까지</p>
            <h2 id="inspection-steps" className="mt-2 text-2xl font-extrabold">
              누수 확인은 이렇게 진행합니다
            </h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {CHECK_STEPS.map(([number, title, description]) => (
                <li key={number} className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="bg-brand-100 text-brand-800 inline-flex size-8 items-center justify-center rounded-full text-sm font-extrabold">
                    {number}
                  </span>
                  <h3 className="mt-4 font-extrabold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ol>
          </section>

          {visibleChildren.length > 0 && (
            <section aria-labelledby="region-directory">
              <h2 id="region-directory" className="text-2xl font-extrabold">
                {region.level === "city" ? "지역 안내 찾아보기" : "도봉구 법정동별 안내"}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {visibleChildren.map(({ region: r }) => (
                  <Link
                    key={r.id}
                    href={regionPath(r)}
                    className="text-brand-700 hover:border-brand-500 hover:bg-brand-50 flex min-h-16 items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 font-bold transition"
                  >
                    <span>{r.name} 누수탐지 안내</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section id="faq" aria-labelledby="region-faq" className="scroll-mt-24">
            <h2 id="region-faq" className="text-2xl font-extrabold">
              {isDongPage ? `${region.name} 누수탐지 자주 묻는 질문` : "자주 묻는 질문"}
            </h2>
            <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 px-5">
              {faqs.map((f) => (
                <details key={f.question} className="group py-5">
                  <summary className="cursor-pointer leading-7 font-bold text-slate-900">
                    {f.question}
                  </summary>
                  <p className="mt-3 leading-7 break-keep text-slate-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section
            id="quote-form"
            aria-labelledby="region-contact"
            className="bg-brand-50 scroll-mt-28 rounded-2xl p-6 sm:p-8"
          >
            <h2 id="region-contact" className="text-brand-900 text-2xl font-extrabold">
              {region.name} 누수 상담
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              주소와 관찰한 증상을 알려 주세요. 방문 일정과 작업 범위는 상담을 통해 확인하실 수
              있습니다.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PhoneButton label="전화 상담 · 010-5700-4026" />
              <KakaoButton />
              <Link
                href="/?city=Dobong#quote-form"
                className="bg-brand-600 hover:bg-brand-700 inline-flex min-h-12 items-center justify-center rounded-lg px-5 font-bold text-white"
              >
                견적 신청서 작성
              </Link>
            </div>
          </section>
        </Container>
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  );
}
