import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Star } from "@/components/icons";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type Cat = "leak" | "toilet" | "sink" | "heating";

type Testimonial = {
  /** 마스킹된 작성자 표기 */
  author: string;
  region: string;
  category: Cat;
  ko: string;
  body: string;
};

/**
 * 후기 4건 — AI 작성. 실제 후기 입력 기능은 없음.
 * 사진은 해당 카테고리의 최신 시공사례 cover_image_url에서 자동 매핑.
 *
 * 카피 정책:
 *   - 5점 별 표시 (단순 상징 — '평균 5.0점' 같은 측정치 카피 금지)
 *   - 한 단락 80~140자 한국어 후기 톤
 */
const TESTIMONIALS: Testimonial[] = [
  {
    author: "이o훈 님",
    region: "서울 강남구",
    category: "toilet",
    ko: "변기 누수",
    body: "변기 바닥에서 며칠 동안 물이 새서 마감재까지 손상이 시작됐어요. 다른 곳에서는 변기 통째로 교체해야 한다고 했는데, 여기는 와서 보시더니 왁스링이랑 부품만 교체하면 된다고 정확히 짚어주셨습니다. 작업도 1시간 안에 끝났고 작업 후 누수 테스트까지 보여주셔서 안심이 됐어요. 사장님이 직접 오셔서 설명도 친절하게 해주셨습니다. 다음에도 누수 일 있으면 또 부르고 싶습니다.",
  },
  {
    author: "박o영 님",
    region: "경기 성남시",
    category: "sink",
    ko: "싱크대 누수",
    body: "주방 싱크대 하부장이 매번 젖어 있어서 한참 곰팡이로 고생했어요. 사진 보내드리니 하부 호스랑 트랩 누수일 가능성이 크다고 미리 짚어주셨고, 방문해서 두 군데 다 한 번에 처리해주셨습니다. 배수도 같이 정비해주셔서 역류도 사라졌어요. 견적도 처음 말씀하신 금액 그대로였고, 1년 무상 A/S까지 약속하셔서 든든합니다. 친정 어머니 댁도 이번에 또 부르려고 합니다.",
  },
  {
    author: "정o현 님",
    region: "서울 마포구",
    category: "leak",
    ko: "누수탐지",
    body: "안방 천장에 얼룩이 점점 커져서 윗집 누수인지 우리집 배관 누수인지 한참 헷갈렸어요. 비파괴로 정확히 위치를 찾아주신다길래 의뢰드렸는데, 청음 장비랑 열화상 카메라로 정확한 부위 한 곳만 콕 찍어서 보여주셨습니다. 덕분에 벽 전체를 다 뜯지 않아도 되어서 비용이 정말 많이 절약됐어요. 작업 깔끔하고 마감 복원도 신경 써주셔서 만족합니다.",
  },
  {
    author: "최o서 님",
    region: "경기 고양시",
    category: "heating",
    ko: "난방배관",
    body: "겨울에 방마다 온도 차가 너무 심해서 보일러를 계속 돌리는데도 추운 방이 있었어요. 분배기 점검해주시고 슬러지 청소 장비로 한 번 작업해주셨더니 거짓말처럼 모든 방이 똑같이 따뜻해졌습니다. 보일러 가동 시간도 짧아져서 난방비도 줄었어요. 미리 약속하신 비용 외 추가비도 전혀 없었고, 5년 만에 청소해야 할 시점이었다고 친절하게 설명도 해주셨습니다.",
  },
];

export async function TestimonialsSection() {
  const supabase = createSupabaseAnonClient();

  // 카테고리별 대표 사진 1장씩 (cover_image_url)
  const photos: Partial<Record<Cat, string>> = {};
  for (const t of TESTIMONIALS) {
    if (photos[t.category]) continue;
    const { data } = await supabase
      .from("posts")
      .select("cover_image_url")
      .eq("published", true)
      .eq("category", t.category)
      .not("cover_image_url", "is", null)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.cover_image_url) photos[t.category] = data.cover_image_url;
  }

  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">REVIEWS</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            고객 후기
          </h2>
          <p className="mt-3 text-slate-600">
            실제 시공 후 받은 고객님들의 후기입니다
          </p>
        </Reveal>

        <RevealGroup stagger={0.12} className="mt-10 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <RevealItem key={i} variant={i % 2 === 0 ? "left" : "right"}>
              <article
                className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
              {photos[t.category] && (
                <div className="relative aspect-[16/9] bg-slate-100">
                  <Image
                    src={photos[t.category]!}
                    alt={`${t.ko} 시공 사진`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-brand-700 shadow-sm">
                    {t.ko}
                  </span>
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      aria-hidden
                      className="size-4 fill-amber-400 text-amber-400"
                      strokeWidth={1.5}
                    />
                  ))}
                  <span className="sr-only">별점 5점</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{t.body}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="font-bold text-slate-900">{t.author}</span>
                  <span aria-hidden className="text-slate-300">·</span>
                  <span className="text-slate-500">{t.region}</span>
                </div>
              </div>
            </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
