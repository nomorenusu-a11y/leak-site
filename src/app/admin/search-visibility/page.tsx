import Link from "next/link";
import { ExternalLink, Search, TrendingUp } from "lucide-react";
import { SearchVisibilityRefresh } from "@/components/admin/SearchVisibilityRefresh";
import { assertAdmin } from "@/lib/auth";
import {
  DEFAULT_NAVER_SEARCH_VISIBILITY,
  mergeNaverSearchVisibility,
  NAVER_SEARCH_VISIBILITY_KEY,
  type NaverSearchVisibilityState,
} from "@/lib/naver-search-visibility";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const legacyKeyword = /유레카|최태환/;

function formatCheckedAt(value: string | null) {
  if (!value) return "아직 확인하지 않음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function SearchVisibilityPage() {
  await assertAdmin();
  const saved = await getSiteContent<NaverSearchVisibilityState | null>(
    NAVER_SEARCH_VISIBILITY_KEY,
    null,
  );
  const state = mergeNaverSearchVisibility(saved);
  const { officialReport, publicSearch } = state;
  const visibleCount = publicSearch.checks.filter((item) => item.visible).length;
  const errorCount = publicSearch.checks.filter((item) => item.error).length;
  const rows = publicSearch.checks.length
    ? publicSearch.checks
    : state.trackedKeywords.map((keyword) => ({
        keyword,
        visible: false,
        matchedUrls: [],
        error: null,
      }));

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
            Naver search performance
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            네이버 검색 노출
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            실제 유입 검색어와 주요 지역·증상 키워드의 현재 검색 노출 여부를 함께 확인합니다.
          </p>
        </div>
        <SearchVisibilityRefresh />
      </header>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="최근 30일 노출" value={officialReport.impressions} suffix="회" tone="blue" />
        <Metric label="최근 30일 클릭" value={officialReport.clicks} suffix="회" tone="emerald" />
        <Metric label="평균 클릭률" value={officialReport.ctr} suffix="%" tone="violet" />
        <Metric
          label="현재 확인된 키워드"
          value={visibleCount}
          suffix={`/ ${state.trackedKeywords.length}`}
          tone="amber"
        />
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Search size={18} />
              <p className="text-xs font-bold tracking-[0.14em] uppercase">Live search check</p>
            </div>
            <h2 className="mt-2 text-xl font-black text-white">현재 네이버 검색 결과</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              첫 검색 화면에 노모어누수 결과가 있는지 직접 확인한 값입니다. 마지막 확인:{" "}
              {formatCheckedAt(publicSearch.checkedAt)}
            </p>
          </div>
          {errorCount > 0 && (
            <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300">
              확인 오류 {errorCount}개
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 sm:px-6">검색어</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3">확인된 주소</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {rows.map((item) => (
                <tr key={item.keyword} className="align-top">
                  <td className="px-5 py-4 font-bold text-slate-100 sm:px-6">{item.keyword}</td>
                  <td className="px-5 py-4">
                    {!publicSearch.checkedAt ? (
                      <Status label="확인 전" tone="neutral" />
                    ) : item.error ? (
                      <Status label="확인 오류" tone="error" />
                    ) : item.visible ? (
                      <Status label="첫 화면 노출" tone="visible" />
                    ) : (
                      <Status label="첫 화면 미확인" tone="hidden" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs leading-5 text-slate-500">
                    {item.matchedUrls[0] ? (
                      <a
                        href={item.matchedUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-md items-center gap-1 text-blue-300 hover:text-blue-200"
                      >
                        <span className="truncate">{item.matchedUrls[0]}</span>
                        <ExternalLink size={13} className="shrink-0" />
                      </a>
                    ) : item.error ? (
                      item.error
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.08] bg-blue-400/[0.04] px-5 py-4 text-xs leading-5 text-slate-400 sm:px-6">
          ‘첫 화면 미확인’은 색인에서 완전히 빠졌다는 뜻이 아닙니다. 뒤쪽 검색 결과에 있거나 아직
          순위가 낮을 수 있습니다.
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-blue-300">
              <TrendingUp size={18} />
              <p className="text-xs font-bold tracking-[0.14em] uppercase">Official report</p>
            </div>
            <h2 className="mt-2 text-xl font-black text-white">실제 유입 검색어</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              네이버 서치어드바이저 {officialReport.updatedAt} 집계값입니다. 네이버 공식 리포트는 약
              1주 전 검색 데이터를 보여줍니다.
            </p>
          </div>
          <Link
            href="https://searchadvisor.naver.com/console/site/report/expose?site=https%3A%2F%2Fnomorenusu.com"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.06]"
          >
            공식 리포트 열기 <ExternalLink size={15} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 sm:px-6">검색어</th>
                <th className="px-5 py-3 text-right">노출</th>
                <th className="px-5 py-3 text-right">클릭</th>
                <th className="px-5 py-3 text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {officialReport.keywords.map((item) => (
                <tr key={item.keyword}>
                  <td className="px-5 py-4 font-semibold text-slate-100 sm:px-6">
                    <span>{item.keyword}</span>
                    {legacyKeyword.test(item.keyword) && (
                      <span className="ml-2 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        과거 검색어
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-300">
                    {item.impressions}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-300">{item.clicks}</td>
                  <td className="px-5 py-4 text-right text-slate-400">
                    {item.impressions
                      ? `${((item.clicks / item.impressions) * 100).toFixed(1)}%`
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.08] px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
          서치어드바이저는 공식 노출·클릭 데이터를 외부 API로 제공하지 않습니다. 위 표는 마지막 공식
          확인값이며, 버튼 업데이트는 위의 현재 공개 검색 결과를 다시 점검합니다.
        </div>
      </section>

      <p className="mt-5 text-xs leading-5 text-slate-600">
        최초 기준 데이터: {DEFAULT_NAVER_SEARCH_VISIBILITY.officialReport.updatedAt} · 검색 결과
        확인은 관리자 요청 시에만 실행됩니다.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix: string;
  tone: "blue" | "emerald" | "violet" | "amber";
}) {
  const tones = {
    blue: "text-blue-300 bg-blue-400/10",
    emerald: "text-emerald-300 bg-emerald-400/10",
    violet: "text-violet-300 bg-violet-400/10",
    amber: "text-amber-300 bg-amber-400/10",
  };
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[#0d121d] p-5">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">
        {value.toLocaleString("ko-KR")}
        <span className={`ml-1 rounded-lg px-2 py-1 align-middle text-xs ${tones[tone]}`}>
          {suffix}
        </span>
      </p>
    </div>
  );
}

function Status({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "visible" | "hidden" | "error";
}) {
  const classes = {
    neutral: "bg-slate-400/10 text-slate-400",
    visible: "bg-emerald-400/10 text-emerald-300",
    hidden: "bg-amber-400/10 text-amber-300",
    error: "bg-rose-400/10 text-rose-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes[tone]}`}>
      {label}
    </span>
  );
}
