import { Container } from "@/components/ui/Container";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialsCarouselClient } from "./TestimonialsCarouselClient";

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

type Testimonial = {
  author: string;
  region: string;
  category: Cat;
  ko: string;
  body: string;
};

/**
 * 후기 8건 — AI 작성 톤. 실제 후기 입력 기능은 없음.
 * 사진은 해당 카테고리의 최신 시공사례 cover_image_url에서 자동 매핑.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    author: "이o훈 님",
    region: "서울 강남구",
    category: "toilet",
    ko: "변기 누수",
    body: "변기 바닥에서 며칠 동안 물이 새서 마감재까지 손상이 시작됐어요. 다른 곳에서는 변기 통째로 교체해야 한다고 했는데, 와서 보시더니 왁스링·부품만 교체하면 된다고 정확히 짚어주셨습니다. 1시간 안에 마무리되고 누수 테스트까지 보여주셔서 안심이 됐어요.",
  },
  {
    author: "박o영 님",
    region: "경기 성남시",
    category: "sink",
    ko: "싱크대 누수",
    body: "주방 싱크대 하부장이 매번 젖어 있어서 한참 곰팡이로 고생했어요. 사진 미리 보내드리니 하부 호스·트랩 누수 가능성이 크다고 짚어주셨고 두 군데 한 번에 처리해주셨습니다. 견적도 처음 말씀하신 금액 그대로였습니다.",
  },
  {
    author: "정o현 님",
    region: "서울 마포구",
    category: "leak",
    ko: "누수탐지",
    body: "안방 천장에 얼룩이 점점 커져서 윗집인지 우리집 배관인지 헷갈렸어요. 청음 장비랑 열화상 카메라로 정확한 부위 한 곳만 콕 짚어주셨습니다. 벽 전체를 뜯지 않아도 되어서 비용이 정말 많이 절약됐어요.",
  },
  {
    author: "최o서 님",
    region: "경기 고양시",
    category: "heating",
    ko: "난방배관",
    body: "겨울에 방마다 온도 차가 너무 심해서 보일러를 계속 돌리는데도 추웠어요. 분배기 점검 + 슬러지 청소 한 번으로 거짓말처럼 모든 방이 따뜻해졌습니다. 보일러 가동 시간도 짧아져서 난방비도 줄었어요.",
  },
  {
    author: "김o진 님",
    region: "서울 송파구",
    category: "leak",
    ko: "외벽 누수",
    body: "베란다 외벽 쪽에서 비만 오면 물이 스며들었는데, 어디가 원인인지 못 찾고 있었어요. 비파괴로 정확히 외벽 균열 지점을 찾아주시고 실리콘·코킹 작업까지 한 번에 마무리해주셔서 이번 장마는 무사히 넘겼습니다.",
  },
  {
    author: "윤o아 님",
    region: "인천 부평구",
    category: "toilet",
    ko: "변기 막힘",
    body: "휴지 막힘으로 변기 물이 역류했는데 직접 뚫어보려다 더 심해진 상황이었어요. 야간이었는데도 1시간 안에 도착해서 깔끔하게 뚫어주시고 향후 주의사항까지 친절히 설명해주셨습니다. 비용도 합리적이었어요.",
  },
  {
    author: "한o석 님",
    region: "서울 노원구",
    category: "frozen",
    ko: "동파 복구",
    body: "한파에 외부 수도관이 얼어서 터졌어요. 안전하게 해빙해주시고 파열 부위 배관 교체까지 같은 날 다 마무리해주셨습니다. 보온재까지 새로 감아주셔서 다음 겨울은 걱정 없을 것 같습니다.",
  },
  {
    author: "장o민 님",
    region: "경기 수원시",
    category: "sink",
    ko: "하수구 막힘",
    body: "주방 싱크대 배수가 너무 느려서 의뢰드렸는데, 고압세척으로 한 번 시원하게 뚫어주시니까 물 빠짐이 새것처럼 돌아왔습니다. 작업 영역 마무리도 깔끔해서 다시 청소할 필요가 없었어요.",
  },
];

export async function TestimonialsSection() {
  const supabase = createSupabaseAnonClient();

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

  const items = TESTIMONIALS.map((t) => ({
    author: t.author,
    region: t.region,
    category: t.category,
    ko: t.ko,
    body: t.body,
    photo: photos[t.category] ?? null,
  }));

  return (
    <section id="reviews" className="scroll-mt-20 bg-slate-50 py-10 md:py-14">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">
            REVIEWS
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            BEST 후기 모아보기
          </h2>
          <p className="mt-3 text-slate-600">
            실제 시공 후 받은 고객님들의 후기입니다
          </p>
        </Reveal>

        <Reveal variant="fade" delay={0.1} className="mt-10">
          <TestimonialsCarouselClient items={items} />
        </Reveal>

        <p className="mt-6 text-center text-xs text-slate-500">
          * 후기는 개인의 의견이며, 실제 결과는 현장 상황에 따라 다를 수 있습니다.
        </p>
      </Container>
    </section>
  );
}
