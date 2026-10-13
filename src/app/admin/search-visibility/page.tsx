import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Eye,
  MousePointerClick,
  Route,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { SearchVisibilityRefresh } from "@/components/admin/SearchVisibilityRefresh";
import { loadTrafficAnalytics } from "@/lib/admin-traffic";
import { assertAdmin } from "@/lib/auth";
import {
  DEFAULT_NAVER_SEARCH_VISIBILITY,
  mergeNaverSearchVisibility,
  NAVER_SEARCH_VISIBILITY_KEY,
  type NaverSearchVisibilityState,
} from "@/lib/naver-search-visibility";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

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
  const [saved, traffic] = await Promise.all([
    getSiteContent<NaverSearchVisibilityState | null>(NAVER_SEARCH_VISIBILITY_KEY, null),
    loadTrafficAnalytics(30),
  ]);
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
    <div className="mx-auto max-w-[1400px] pb-12">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
            Traffic &amp; search performance
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            일간 현황
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            오늘 방문부터 유입 검색어, 인기 글, 문의 행동까지 중요한 순서대로 확인합니다.
          </p>
        </div>
        <SearchVisibilityRefresh />
      </header>

      <section className="mt-7 overflow-hidden rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-400/[0.11] via-[#0d141c] to-[#0b1019]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-300 uppercase">Today</p>
            <h2 className="mt-1 text-xl font-black text-white">오늘의 홈페이지 성과</h2>
          </div>
          <p className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-slate-300">
            {traffic.today.date.replaceAll("-", ".")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <TodayMetric
            icon={<Users size={20} />}
            label="방문"
            value={traffic.today.sessions}
            suffix="명"
          />
          <TodayMetric
            icon={<Eye size={20} />}
            label="페이지 조회"
            value={traffic.today.views}
            suffix="회"
          />
          <TodayMetric
            icon={<Search size={20} />}
            label="검색 유입"
            value={traffic.today.searchSessions}
            suffix="명"
          />
          <TodayMetric
            icon={<MousePointerClick size={20} />}
            label="문의 행동"
            value={traffic.today.contacts}
            suffix="회"
          />
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-white/[0.09] bg-[#0d121d] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-blue-300 uppercase">
              Last 30 days
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">최근 30일 추이</h2>
            <p className="mt-2 text-sm text-slate-400">
              이전 30일과 비교해 방문이 늘고 있는지 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              조회
            </span>
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              방문
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PeriodMetric
            label="방문"
            value={traffic.sessions}
            suffix="명"
            change={traffic.changes.sessions}
          />
          <PeriodMetric
            label="페이지 조회"
            value={traffic.pageViews}
            suffix="회"
            change={traffic.changes.pageViews}
          />
          <PeriodMetric
            label="검색 유입"
            value={traffic.searchSessions}
            suffix="명"
            change={traffic.changes.searchSessions}
          />
          <PeriodMetric
            label="문의 행동"
            value={traffic.contactClicks}
            suffix="회"
            change={traffic.changes.contactClicks}
          />
        </div>
        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#080d15] p-3 sm:p-5">
          <DailyTrafficChart points={traffic.daily} />
        </div>
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        <RankCard
          icon={<Search size={18} />}
          eyebrow="Search queries"
          title="유입 검색어"
          description="실제로 홈페이지 방문으로 이어진 검색어 순위입니다."
          rows={traffic.queries.map((item) => ({
            label: item.label,
            value: item.sessions,
            sub: `${item.views}회 조회`,
          }))}
          empty="아직 검색 유입이 기록되지 않았습니다."
        />
        <RankCard
          icon={<Eye size={18} />}
          eyebrow="Popular pages"
          title="인기 방문 페이지"
          description="방문자가 가장 많이 본 홈페이지와 게시글입니다."
          rows={traffic.pages.map((item) => ({
            label: pageLabel(item.label),
            value: item.views,
            sub: `${item.sessions}명 방문`,
          }))}
          empty="방문 데이터가 쌓이면 인기 페이지가 표시됩니다."
        />
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        <SimpleTable
          icon={<Route size={18} />}
          eyebrow="Acquisition"
          title="유입 경로"
          description="네이버·구글·직접 방문 중 어디에서 들어왔는지 보여줍니다."
          headers={["경로", "방문", "조회"]}
          rows={traffic.sources.map((item) => [item.label, item.sessions, item.views])}
          empty="아직 유입 경로 데이터가 없습니다."
        />
        <SimpleTable
          icon={<MousePointerClick size={18} />}
          eyebrow="Conversions"
          title="문의 전환 행동"
          description="전화·카카오·견적 신청 버튼을 누른 횟수입니다."
          headers={["행동", "횟수", ""]}
          rows={traffic.conversions.map((item) => [
            conversionLabel(item.eventName),
            item.count,
            "",
          ])}
          empty="아직 문의 전환 행동이 없습니다."
        />
      </section>

      <section className="mt-7 overflow-hidden rounded-3xl border border-blue-300/15 bg-gradient-to-br from-blue-400/[0.1] via-[#0d121d] to-[#0d121d]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2 text-blue-300">
              <TrendingUp size={18} />
              <p className="text-xs font-bold tracking-[0.14em] uppercase">Naver official report</p>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">네이버 공식 검색 성과</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              서치어드바이저에서 마지막으로 확인한 {officialReport.updatedAt} 집계입니다.
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
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
          <OfficialMetric label="30일 노출" value={officialReport.impressions} suffix="회" />
          <OfficialMetric label="30일 클릭" value={officialReport.clicks} suffix="회" />
          <OfficialMetric label="클릭률" value={officialReport.ctr} suffix="%" />
          <OfficialMetric
            label="첫 화면 확인"
            value={visibleCount}
            suffix={`/ ${state.trackedKeywords.length}`}
          />
        </div>
        <div className="overflow-x-auto border-t border-white/[0.08]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 sm:px-7">유입 검색어</th>
                <th className="px-5 py-3 text-right">노출</th>
                <th className="px-5 py-3 text-right">클릭</th>
                <th className="px-5 py-3 text-right">클릭률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {officialReport.keywords.map((item) => (
                <tr key={item.keyword}>
                  <td className="px-5 py-4 font-semibold text-slate-100 sm:px-7">{item.keyword}</td>
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
      </section>

      <details className="group mt-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d121d]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-7">
          <div>
            <h2 className="font-black text-white">현재 네이버 검색 결과 상세 확인</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              마지막 확인 {formatCheckedAt(publicSearch.checkedAt)} · 첫 화면 {visibleCount}개 ·
              오류 {errorCount}개
            </p>
          </div>
          <span className="text-sm font-bold text-blue-300 group-open:hidden">펼쳐보기</span>
          <span className="hidden text-sm font-bold text-blue-300 group-open:inline">접기</span>
        </summary>
        <div className="overflow-x-auto border-t border-white/[0.08]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3 sm:px-7">검색어</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3">확인 주소</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {rows.map((item) => (
                <tr key={item.keyword} className="align-top">
                  <td className="px-5 py-4 font-bold text-slate-100 sm:px-7">{item.keyword}</td>
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
      </details>

      <p className="mt-5 text-xs leading-5 text-slate-600">
        방문 통계는 홈페이지에서 자동 누적됩니다. 네이버 공식 노출·클릭은 외부 API가 없어 마지막
        공식 확인값과 공개 검색 점검을 구분해 표시합니다. 최초 기준 데이터:{" "}
        {DEFAULT_NAVER_SEARCH_VISIBILITY.officialReport.updatedAt}
      </p>
    </div>
  );
}

type DailyPoint = {
  date: string;
  sessions: number;
  views: number;
  searchSessions: number;
  contacts: number;
};

function DailyTrafficChart({ points }: { points: DailyPoint[] }) {
  const width = 920;
  const height = 260;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(5, ...points.flatMap((point) => [point.views, point.sessions]));
  const coordinates = (key: "views" | "sessions") =>
    points.map((point, index) => ({
      x: left + (index / Math.max(1, points.length - 1)) * plotWidth,
      y: top + plotHeight - (point[key] / max) * plotHeight,
    }));
  const path = (key: "views" | "sessions") =>
    coordinates(key)
      .map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");
  const labelIndexes = [0, 7, 14, 21, points.length - 1].filter(
    (value, index, values) => value >= 0 && values.indexOf(value) === index,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="최근 30일 방문 및 조회 추이"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = top + plotHeight * ratio;
        return (
          <line
            key={ratio}
            x1={left}
            x2={width - right}
            y1={y}
            y2={y}
            stroke="rgba(148,163,184,.13)"
            strokeWidth="1"
          />
        );
      })}
      <path
        d={path("views")}
        fill="none"
        stroke="#34d399"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path("sessions")}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {labelIndexes.map((index) => {
        const x = left + (index / Math.max(1, points.length - 1)) * plotWidth;
        return (
          <text
            key={index}
            x={x}
            y={height - 10}
            textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
            fill="#64748b"
            fontSize="12"
          >
            {points[index]?.date.slice(5).replace("-", ".")}
          </text>
        );
      })}
      <text x={left - 10} y={top + 4} textAnchor="end" fill="#64748b" fontSize="11">
        {max}
      </text>
      <text x={left - 10} y={top + plotHeight + 4} textAnchor="end" fill="#64748b" fontSize="11">
        0
      </text>
    </svg>
  );
}

function TodayMetric({
  icon,
  label,
  value,
  suffix,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="border-white/[0.08] p-5 sm:border-l sm:p-7 sm:first:border-l-0">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <p className="mt-3 text-4xl font-black tracking-tight text-white">
        {value.toLocaleString()}
        <span className="ml-1 text-base font-bold text-slate-400">{suffix}</span>
      </p>
    </div>
  );
}

function PeriodMetric({
  label,
  value,
  suffix,
  change,
}: {
  label: string;
  value: number;
  suffix: string;
  change: number | null;
}) {
  const improved = change !== null && change > 0;
  const declined = change !== null && change < 0;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-black text-white">
          {value.toLocaleString()}
          <span className="ml-1 text-xs text-slate-500">{suffix}</span>
        </p>
        <span
          className={`flex items-center text-xs font-bold ${improved ? "text-emerald-300" : declined ? "text-rose-300" : "text-slate-500"}`}
        >
          {improved ? <ArrowUpRight size={14} /> : declined ? <ArrowDownRight size={14} /> : null}
          {change === null ? "신규" : `${Math.abs(change).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}

function RankCard({
  icon,
  eyebrow,
  title,
  description,
  rows,
  empty,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  rows: Array<{ label: string; value: number; sub: string }>;
  empty: string;
}) {
  const visible = rows.slice(0, 8);
  const max = Math.max(1, ...visible.map((row) => row.value));
  return (
    <article className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0d121d]">
      <div className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
        <div className="flex items-center gap-2 text-blue-300">
          {icon}
          <p className="text-xs font-bold tracking-[0.14em] uppercase">{eyebrow}</p>
        </div>
        <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {visible.length ? (
        <ol className="divide-y divide-white/[0.06] px-5 sm:px-7">
          {visible.map((row, index) => (
            <li
              key={`${row.label}-${index}`}
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-4"
            >
              <span className="text-sm font-black text-slate-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-100" title={row.label}>
                  {row.label}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                    style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white">{row.value}</p>
                <p className="text-[11px] text-slate-500">{row.sub}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-5 py-12 text-center text-sm text-slate-500 sm:px-7">{empty}</p>
      )}
    </article>
  );
}

function SimpleTable({
  icon,
  eyebrow,
  title,
  description,
  headers,
  rows,
  empty,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  headers: [string, string, string];
  rows: Array<[string, string | number, string | number]>;
  empty: string;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0d121d]">
      <div className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
        <div className="flex items-center gap-2 text-blue-300">
          {icon}
          <p className="text-xs font-bold tracking-[0.14em] uppercase">{eyebrow}</p>
        </div>
        <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs font-bold text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header || "blank"} className="px-5 py-3 first:sm:px-7">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.slice(0, 10).map((row, index) => (
                <tr key={`${row[0]}-${index}`}>
                  <td className="max-w-sm truncate px-5 py-3.5 font-semibold text-slate-200 first:sm:px-7">
                    {row[0]}
                  </td>
                  <td className="px-5 py-3.5 font-black text-white">{row[1]}</td>
                  <td className="px-5 py-3.5 text-slate-500">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-12 text-center text-sm text-slate-500 sm:px-7">{empty}</p>
      )}
    </article>
  );
}

function OfficialMetric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">
        {value.toLocaleString()}
        <span className="ml-1 text-sm text-blue-300">{suffix}</span>
      </p>
    </div>
  );
}

function conversionLabel(eventName: string) {
  return (
    (
      {
        click_call: "전화 버튼",
        click_kakao: "카카오 상담 버튼",
        submit_quote: "견적 신청 완료",
        click_post_cta: "게시글 상담 버튼",
      } as Record<string, string>
    )[eventName] ?? eventName
  );
}

function pageLabel(path: string) {
  if (path === "/") return "홈페이지";
  if (path === "/posts") return "누수 정보 전체보기";
  if (path.startsWith("/posts/")) return path.replace("/posts/", "게시글 · ");
  return path;
}

function Status({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "error" | "visible" | "hidden";
}) {
  const colors = {
    neutral: "bg-slate-400/10 text-slate-300",
    error: "bg-rose-400/10 text-rose-300",
    visible: "bg-emerald-400/10 text-emerald-300",
    hidden: "bg-amber-400/10 text-amber-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${colors[tone]}`}>
      {label}
    </span>
  );
}
