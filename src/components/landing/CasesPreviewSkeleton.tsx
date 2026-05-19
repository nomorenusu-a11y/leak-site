import { Container } from "@/components/ui/Container";

/**
 * 시공사례 그리드의 자리 표시자. 4단계에서 Supabase posts 테이블 데이터로 교체.
 */
export function CasesPreviewSkeleton() {
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">시공 사례</h2>
            <p className="mt-2 text-slate-600">실제 진행한 누수 시공 사례를 지역별로 확인하세요.</p>
          </div>
          <span className="hidden sm:inline-block text-sm text-slate-500">
            준비 중 — 곧 공개됩니다
          </span>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] w-full animate-pulse bg-slate-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
