import Link from "next/link";
import {
  isPublicPost,
  type TrackedPost,
  type PostTrackingState,
  type PostMetric,
} from "@/lib/post-tracking";

const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value))
    : "아직 확인 전";
export function PostTrackingTable({
  posts,
  state,
  metrics,
  page = 1,
  mode = "public",
}: {
  posts: TrackedPost[];
  state: PostTrackingState;
  metrics: Record<string, PostMetric>;
  page?: number;
  mode?: string;
}) {
  const now = new Date();
  const published = posts.filter((p) => isPublicPost(p, now));
  const future = posts.filter((p) => p.published && !isPublicPost(p, now));
  const filtered = mode === "scheduled" ? future : published;
  const pages = Math.max(1, Math.ceil(filtered.length / 25));
  const current = Math.max(1, Math.min(pages, Number.isFinite(page) ? page : 1));
  const rows = filtered.slice((current - 1) * 25, current * 25);
  const issues = published.filter((p) => {
    const c = state.checks[p.slug];
    return c?.error || c?.sitemap === false || c?.canonicalInHead === false;
  }).length;
  const checked = published.filter((p) => state.checks[p.slug]?.checkedAt).length;
  return (
    <section
      className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#0d121d]"
      id="post-tracking"
    >
      <div className="border-b border-white/10 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">게시글별 발행·유입 추적</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          새 글은 공개 시각에 자동으로 목록에 편입됩니다. 접속·사이트맵 확인과 네이버 검색 결과
          확인을 구분합니다. 검색 결과에 없다는 사실만으로 색인 실패로 판단하지 않습니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["공개 글", published.length],
            ["접속 검사 완료", checked],
            ["접속·구조 확인 필요", issues],
            ["미래 예약", future.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-black text-white">{value}개</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2 text-sm font-bold">
          <Link
            href="/admin/search-visibility?postMode=public#post-tracking"
            className={`rounded-lg px-4 py-2 ${mode !== "scheduled" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-300"}`}
          >
            공개 글 {published.length}
          </Link>
          <Link
            href="/admin/search-visibility?postMode=scheduled#post-tracking"
            className={`rounded-lg px-4 py-2 ${mode === "scheduled" ? "bg-blue-500 text-white" : "bg-white/5 text-slate-300"}`}
          >
            예약 글 {future.length}
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <caption className="sr-only">
            게시글의 공개 상태, 기술 검사, 검색 결과, 최근 30일 유입과 상담 행동
          </caption>
          <thead className="bg-white/5 text-xs text-slate-400">
            <tr>
              {[
                "게시글·공개 시각",
                "접속·사이트맵",
                "네이버 해당 글 링크",
                "최근 검사",
                "30일 조회 / 검색",
                "전화 / 카카오",
                "견적 완료",
              ].map((x) => (
                <th key={x} scope="col" className="px-4 py-3">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((post) => {
              const c = state.checks[post.slug];
              const m = metrics[post.slug];
              const live = isPublicPost(post, now);
              return (
                <tr key={post.id} className="align-top">
                  <td className="max-w-[340px] px-4 py-4">
                    <Link
                      href={live ? `/posts/${post.slug}` : `/admin/posts/${post.id}/edit`}
                      className="leading-6 font-bold text-blue-200 hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {live ? "공개" : "예약"} · {date(post.published_at)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs leading-6 text-slate-300">
                    {!live ? (
                      "공개 시각 전 검사하지 않음"
                    ) : !c?.checkedAt ? (
                      "검사 전"
                    ) : c.error ? (
                      `확인 오류: ${c.error}`
                    ) : (
                      <>
                        {`HTTP ${c.status}`}
                        <br />
                        {c.sitemap ? "사이트맵 포함" : "사이트맵 미포함"}
                        <br />
                        {c.canonicalInHead ? "대표 주소 정상" : "대표 주소 위치 확인 필요"}
                      </>
                    )}
                  </td>
                  <td className="max-w-[200px] px-4 py-4 text-xs leading-6">
                    {!live ? (
                      <span className="text-slate-500">공개 후 확인</span>
                    ) : c?.search?.error ? (
                      <span className="text-amber-300">확인 오류 · {c.search.error}</span>
                    ) : c?.search ? (
                      <>
                        <span
                          className={
                            c.search.found ? "font-bold text-emerald-300" : "text-slate-400"
                          }
                        >
                          {c.search.found ? "해당 글 링크 확인" : "검사 결과에서 미확인"}
                        </span>
                        <p className="text-slate-500">{c.search.keyword}</p>
                      </>
                    ) : (
                      <span className="text-slate-500">검색 검사 전</span>
                    )}
                    <p className="mt-1 text-[11px] text-slate-600">공식 색인 상태: 미확인</p>
                  </td>
                  <td className="px-4 py-4 text-xs whitespace-nowrap text-slate-400">
                    <p>접속 {date(c?.checkedAt)}</p>
                    <p className="mt-1">검색 {date(c?.search?.checkedAt)}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-white">
                    {live ? `${m?.views ?? 0} / ${m?.searchViews ?? 0}` : "—"}
                    {live ? (
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        네이버 조회 {m?.naverViews ?? 0}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 font-bold text-cyan-200">
                    {live ? `${m?.phone ?? 0} / ${m?.kakao ?? 0}` : "—"}
                  </td>
                  <td className="px-4 py-4 font-bold text-emerald-300">
                    {live ? (m?.quote ?? 0) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs text-slate-400">
        <p>
          전화·카카오는 버튼 클릭이며 실제 통화나 상담 완료 건수가 아닙니다. 내부 점검 기록은
          집계에서 제외합니다.
        </p>
        <nav aria-label="게시글 추적 페이지" className="flex items-center gap-3">
          {current > 1 ? (
            <Link
              href={`?postMode=${mode}&postPage=${current - 1}#post-tracking`}
              className="text-blue-300"
            >
              이전
            </Link>
          ) : null}
          <span>
            {current} / {pages}
          </span>
          {current < pages ? (
            <Link
              href={`?postMode=${mode}&postPage=${current + 1}#post-tracking`}
              className="text-blue-300"
            >
              다음
            </Link>
          ) : null}
        </nav>
      </div>
    </section>
  );
}
