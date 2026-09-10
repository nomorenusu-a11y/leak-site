import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import type {
  HeroSlideData,
  HeroBannerData,
  TestimonialData,
  FaqItemData,
  AboutCardData,
  MasterSectionData,
  TimeSectionData,
  ServiceData,
  EquipmentData,
  DemoRequestData,
} from "@/types/database";

// ============================================================
// 기본값 (DB에 데이터가 없을 때 사용)
// ============================================================

export const DEFAULT_HERO_BANNER: HeroBannerData = {
  highlight: "✨ 신속함과 정직함으로",
  text: "수도권 365일 24시간 누수 출동 전문업체",
};

export const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    src: "/about/dispatch.png",
    alt: "긴급 출동 중인 누수탐지 전문기사",
    tag: "24시간 긴급출동",
    tagColor: "bg-cyan-500/30 text-cyan-200",
    line1: "365일 24시간",
    line2: "긴급 출동",
    line2Color: "text-yellow-300",
    sub: "서울·경기·인천 수도권 전지역 | 접수 후 30분 내 출동",
    hashtags: ["24시간출동", "수도권전지역", "긴급누수", "야간출동"],
  },
  {
    src: "/about/rescue.png",
    alt: "작업 완료 후 OK 사인을 보내는 전문가",
    tag: "실패현장 전문",
    tagColor: "bg-rose-500/30 text-rose-200",
    line1: "타업체 실패현장",
    line2: "해결 전문",
    line2Color: "text-emerald-300",
    sub: "다른 업체에서 못 찾은 누수도 끝까지 찾아냅니다",
    hashtags: ["실패현장해결", "베테랑전문가", "완벽시공", "비파괴탐지"],
  },
  {
    src: "/about/estimate.png",
    alt: "현장에서 견적서를 설명하는 모습",
    tag: "정직한 시공",
    tagColor: "bg-amber-500/30 text-amber-200",
    line1: "정직한 견적",
    line2: "확실한 A/S",
    line2Color: "text-amber-300",
    sub: "미해결 시 비용 0원 · 보험서류 무상 제공 · 1년 무상 A/S",
    hashtags: ["정직견적", "비용0원", "1년무상AS", "보험서류무상"],
  },
  {
    src: "/about/consult.png",
    alt: "전문 상담센터에서 상담 중",
    tag: "무료 상담",
    tagColor: "bg-blue-500/30 text-blue-200",
    line1: "전화 한 통이면",
    line2: "전문가가 찾아갑니다",
    line2Color: "text-cyan-300",
    sub: "사진과 증상만 보내주세요 · 현장 도착 전 사전 진단 완료",
    hashtags: ["무료상담", "30분내회신", "비파괴탐지", "누수보험"],
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialData[] = [
  { author: "이o훈 님", region: "서울 강남구", category: "toilet", ko: "변기 누수", body: "변기 바닥에서 며칠 동안 물이 새서 마감재까지 손상이 시작됐어요. 다른 곳에서는 변기 통째로 교체해야 한다고 했는데, 와서 보시더니 왁스링·부품만 교체하면 된다고 정확히 짚어주셨습니다. 1시간 안에 마무리되고 누수 테스트까지 보여주셔서 안심이 됐어요." },
  { author: "박o영 님", region: "경기 성남시", category: "sink", ko: "싱크대 누수", body: "주방 싱크대 하부장이 매번 젖어 있어서 한참 곰팡이로 고생했어요. 사진 미리 보내드리니 하부 호스·트랩 누수 가능성이 크다고 짚어주셨고 두 군데 한 번에 처리해주셨습니다. 견적도 처음 말씀하신 금액 그대로였습니다." },
  { author: "정o현 님", region: "서울 마포구", category: "leak", ko: "누수탐지", body: "안방 천장에 얼룩이 점점 커져서 윗집인지 우리집 배관인지 헷갈렸어요. 청음 장비랑 열화상 카메라로 정확한 부위 한 곳만 콕 짚어주셨습니다. 벽 전체를 뜯지 않아도 되어서 비용이 정말 많이 절약됐어요." },
  { author: "최o서 님", region: "경기 고양시", category: "heating", ko: "난방배관", body: "겨울에 방마다 온도 차가 너무 심해서 보일러를 계속 돌리는데도 추웠어요. 분배기 점검 + 슬러지 청소 한 번으로 거짓말처럼 모든 방이 따뜻해졌습니다. 보일러 가동 시간도 짧아져서 난방비도 줄었어요." },
  { author: "김o진 님", region: "서울 송파구", category: "leak", ko: "외벽 누수", body: "베란다 외벽 쪽에서 비만 오면 물이 스며들었는데, 어디가 원인인지 못 찾고 있었어요. 비파괴로 정확히 외벽 균열 지점을 찾아주시고 실리콘·코킹 작업까지 한 번에 마무리해주셔서 이번 장마는 무사히 넘겼습니다." },
  { author: "윤o아 님", region: "인천 부평구", category: "toilet", ko: "변기 막힘", body: "휴지 막힘으로 변기 물이 역류했는데 직접 뚫어보려다 더 심해진 상황이었어요. 야간이었는데도 1시간 안에 도착해서 깔끔하게 뚫어주시고 향후 주의사항까지 친절히 설명해주셨습니다. 비용도 합리적이었어요." },
  { author: "한o석 님", region: "서울 노원구", category: "frozen", ko: "동파 복구", body: "한파에 외부 수도관이 얼어서 터졌어요. 안전하게 해빙해주시고 파열 부위 배관 교체까지 같은 날 다 마무리해주셨습니다. 보온재까지 새로 감아주셔서 다음 겨울은 걱정 없을 것 같습니다." },
  { author: "장o민 님", region: "경기 수원시", category: "sink", ko: "하수구 막힘", body: "주방 싱크대 배수가 너무 느려서 의뢰드렸는데, 고압세척으로 한 번 시원하게 뚫어주시니까 물 빠짐이 새것처럼 돌아왔습니다. 작업 영역 마무리도 깔끔해서 다시 청소할 필요가 없었어요." },
];

export const DEFAULT_FAQ_ITEMS: FaqItemData[] = [
  { question: "누수 탐지비는 얼마인가요?", answer: "현장마다 상황과 케이스가 달라 정확한 금액은 현장 견적으로 안내드립니다. 방문 진단 후 사진과 함께 견적을 확정해 드리며, 동의 없이 추가 청구는 발생하지 않습니다." },
  { question: "누수 흔적만 보고 원인을 알 수 있나요?", answer: "천장 얼룩이나 벽지 젖음만으로는 배관, 욕실 방수, 외벽·창호 등 원인을 단정하기 어렵습니다. 물이 보이는 위치와 사용 패턴을 함께 확인해 점검 범위를 좁혀갑니다." },
  { question: "욕실 방수층 문제와 배관 누수는 어떻게 구분하나요?", answer: "샤워나 바닥 물 사용 때만 아래층에 영향이 생기는지, 급수·온수 사용과 관계없이 증상이 이어지는지 등을 먼저 확인합니다. 현장 점검으로 방수 문제와 배관 문제를 구분한 뒤 필요한 방식으로 안내합니다." },
  { question: "수도계량기가 계속 돌아가면 누수인가요?", answer: "모든 수도 사용을 멈춘 뒤에도 계량기 표시가 계속 움직이면 수도계량기 이후 급수관 누수 가능성을 확인해볼 수 있습니다. 다만 변기 물탱크나 보일러·정수기 등 연결 설비도 함께 점검해야 합니다." },
  { question: "아랫집 천장에 물자국이 생겼는데 우리 집이 원인인가요?", answer: "물자국이 보이는 위치와 실제 누수 원인은 다를 수 있습니다. 위층 욕실·주방 사용, 난방·온수 사용, 공용 배관 여부 등을 함께 확인해야 하므로 성급히 원인을 단정하기보다 먼저 상황을 기록해 두는 것이 좋습니다." },
  { question: "보일러 압력이 계속 떨어지면 난방배관 누수일 수 있나요?", answer: "반복적으로 압력이 떨어질 때 난방 배관이나 보일러 연결부를 점검할 필요가 있습니다. 단순 보충 문제인지 실제 누수인지 구분하려면 압력 변화와 주변 습기·누수 흔적을 함께 확인합니다." },
  { question: "누수 탐지 전에는 벽이나 바닥을 꼭 열어야 하나요?", answer: "처음부터 넓게 철거하지 않습니다. 증상과 배관 상태를 점검해 의심 범위를 좁힌 뒤, 보수가 필요한 위치가 확인되었을 때 필요한 범위만 협의하여 진행합니다." },
  { question: "청음·열화상·가스탐지는 각각 언제 사용하나요?", answer: "배관 종류와 현장 조건에 따라 점검 방법이 달라집니다. 한 가지 장비 결과만으로 단정하지 않고, 현장 상황에 맞는 확인 과정을 조합해 원인 범위를 살핍니다." },
  { question: "누수 탐지할 때 소음이나 먼지는 어느 정도 생기나요?", answer: "점검 단계에서는 비교적 소음과 먼지가 적지만, 보수가 필요한 위치를 열 때는 소음과 분진이 생길 수 있습니다. 작업 전 범위와 보호 방법을 설명드리고, 필요한 구간만 진행합니다." },
  { question: "누수 후 벽지·바닥 복구와 건조는 어떻게 하나요?", answer: "누수 원인을 먼저 정리한 뒤 젖은 범위와 자재 상태를 확인합니다. 건조와 복구 범위는 습기 정도, 마감재, 현장 환기 조건에 따라 달라지므로 현장 상태를 보고 안내합니다." },
  { question: "누수보험 접수를 위해 수리 전에 무엇을 준비해야 하나요?", answer: "보험사와 상품마다 필요 서류가 다를 수 있으므로 접수 전 약관과 담당자 안내를 먼저 확인하세요. 물자국·젖은 부위·발생 시점은 사진으로 남겨 두고, 작업 전 필요한 사진이나 서류를 안내받는 것이 좋습니다." },
  { question: "아파트·빌라·단독주택 모두 점검 가능한가요?", answer: "건물 유형에 따라 배관 구조와 확인할 지점이 달라집니다. 아파트·빌라·단독주택 모두 증상과 구조를 먼저 듣고, 해당 현장에 맞는 점검 방향을 안내합니다." },
  { question: "24시간 출동이 가능한가요?", answer: "야간·휴일 상담은 항상 가능하고, 긴급 누수 출동은 인력 일정에 따라 우선 배정해 드립니다. 먼저 전화 또는 카톡으로 상황을 알려주세요." },
  { question: "출장은 어느 지역까지 가능한가요?", answer: "서울 전 지역과 성남 분당 등 수도권 일부까지 출동합니다. 그 외 지역은 일정에 따라 조율 가능하니 카톡으로 문의 주세요." },
  { question: "보증 기간은 어떻게 되나요?", answer: "시공 부위에 대해 1년 무상 사후 보증을 제공합니다. 동일 부위 누수 재발 시 추가 비용 없이 재시공합니다." },
];

export const DEFAULT_ABOUT_CARDS: AboutCardData[] = [
  { src: "/about/consult.png", alt: "전문 상담센터에서 헤드셋을 끼고 상담 중인 모습", icon: "Headset", line1: "365일 무료상담", line2: "친절 견적상담" },
  { src: "/about/dispatch.png", alt: "야간 긴급 출동을 위해 운전 중인 누수탐지 전문기사", icon: "Truck", line1: "365일 24시간", line2: "신속! 긴급출동" },
  { src: "/about/estimate.png", alt: "현장에서 태블릿으로 누수 견적서를 보여주며 설명하는 모습", icon: "FileText", line1: "정직한 견적!", line2: "확실한 A/S" },
  { src: "/about/rescue.png", alt: "탐지 장비와 함께 작업을 마치고 OK 사인을 보내는 마스터", icon: "BicepsFlexed", line1: "타업체 실패현장", line2: "해결 전문가!" },
];

export const DEFAULT_MASTER_SECTION: MasterSectionData = {
  title: "아무나 장인이라 불리지 않습니다\n오직 전문가만이 장인이라 할 수 있습니다",
  subtitle: "을 선택해주신 고객님들께서 후회하지 않도록",
  cta: "깔끔하게! 100%! 해결해드리겠습니다.",
  cards: [
    { key: "dispatch", icon: "Truck", body: "서울·경기·인천 전지역 어디라도\n긴급출동하여 해결해드립니다.", highlight: "수도권 전지역!\n365일 긴급출동!" },
    { key: "zero", icon: "none", visualText: "0원", body: "해결하지 못한 현장에 대한 청구비용 0원\n보험서류 제공 및 기타 서비스 0원", highlight: "미해결시 비용 0원!\n누수보험서류 비용 0원" },
    { key: "expert", icon: "BicepsFlexed", body: "고가의 최신장비들을 보유중이며\n베테랑 전문가들이 항시 대기중입니다", highlight: "최신장비 보유!\n최고의 인력 상시대기!" },
  ],
};

export const DEFAULT_TIME_SECTION: TimeSectionData = {
  preTitle: "누수, 아직도 고민만 하고 계신가요?",
  title: "24시간 출동 가능",
  description: "전화 한 통이면 충분합니다. 사진과 함께 증상을 보내주시면,\n현장 도착 전부터 진단 방향을 잡아 빠르게 해결해드립니다.",
  footer: "맡겨주시면 책임지고 해결해드립니다.",
  cards: [
    { icon: "Phone", big: "간편", caption: "전화 또는 사진 문의 1회" },
    { icon: "Clock", big: "24/365", caption: "휴일·새벽 상담 가능" },
    { icon: "ShieldCheck", big: "1년", caption: "동일 부위 무상 A/S" },
  ],
};

export const DEFAULT_EQUIPMENT: EquipmentData[] = [
  { name: "청음기", caption: "벽·바닥 속 누수 소리 정밀 청취" },
  { name: "가스탐지기", caption: "도시가스·LPG 누설 위치 탐지" },
  { name: "열화상 카메라", caption: "온도차로 배관·누수 위치 시각화" },
  { name: "배관 내시경", caption: "관 내부 직접 영상 검사 (소형 카메라)" },
  { name: "고압세척기", caption: "하수구·배수관 막힘 강력 분사 해소" },
  { name: "배관 세척기", caption: "난방배관 슬러지·이물질 순환 청소" },
  { name: "수압 측정기", caption: "급수 압력 정밀 측정 및 진단" },
  { name: "수분 침투 감지기", caption: "벽체·바닥 내부 수분 함수율 측정" },
];

export const DEFAULT_SERVICES_LEAK: ServiceData[] = [
  { cat: "leak", ko: "누수탐지", desc: "비파괴 정밀 장비로 누수 위치를 찾아 최소 시공으로 해결", icon: "Droplets" },
  { cat: "toilet", ko: "변기 누수·교체", desc: "변기 바닥 누수·물탱크 누수·부품 교체까지", icon: "Bath" },
  { cat: "sink", ko: "싱크대 누수·막힘", desc: "하부장 누수와 배수 막힘 동시 해결", icon: "Wrench" },
  { cat: "frozen", ko: "동파·해빙", desc: "겨울 한파로 얼고 파열된 배관 안전 복구", icon: "Snowflake" },
];

export const DEFAULT_SERVICES_PIPE: ServiceData[] = [
  { cat: "heating", ko: "난방배관 청소", desc: "방마다 온도 차가 나면 슬러지 청소 시점", icon: "Thermometer" },
  { cat: null, ko: "하수구 막힘", desc: "주방·욕실 하수구·배수관 막힘 해소 (고압세척)", icon: "Wrench", href: "/posts", image: "/about/rescue.png" },
  { cat: null, ko: "배관 고압세척", desc: "오래된 배관·배수구 누적 이물질 강력 세척", icon: "Droplets", href: "/posts", image: "/about/dispatch.png" },
];

// ============================================================
// 읽기 (공개 — anon 클라이언트 사용)
// ============================================================

export async function getSiteContent<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabase = createSupabaseAnonClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data?.value) return data.value as T;
  } catch {
    // DB 오류 시 기본값 사용
  }
  return fallback;
}

// ============================================================
// 쓰기 (관리자 — admin 클라이언트 사용)
// ============================================================

export async function setSiteContent(key: string, value: unknown): Promise<void> {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) throw new Error(`site_content 저장 실패: ${error.message}`);
}

// ============================================================
// 콘텐츠 키별 getter (타입 안전)
// ============================================================

export const getHeroBanner = () => getSiteContent<HeroBannerData>("hero_banner", DEFAULT_HERO_BANNER);
export const getHeroSlides = () => getSiteContent<HeroSlideData[]>("hero_slides", DEFAULT_HERO_SLIDES);
export const getTestimonials = () => getSiteContent<TestimonialData[]>("testimonials", DEFAULT_TESTIMONIALS);
export async function getFaqItems(): Promise<FaqItemData[]> {
  const savedItems = await getSiteContent<FaqItemData[]>("faq_items", []);
  if (savedItems.length === 0) return DEFAULT_FAQ_ITEMS;

  // 기존 관리 화면에서 수정한 답변은 보존하고, 새 기본 질문을 그 사이에 채운다.
  const savedByQuestion = new Map(savedItems.map((item) => [item.question, item]));
  const knownQuestions = new Set(DEFAULT_FAQ_ITEMS.map((item) => item.question));
  const expandedItems = DEFAULT_FAQ_ITEMS.map(
    (item) => savedByQuestion.get(item.question) ?? item,
  );
  const customItems = savedItems.filter((item) => !knownQuestions.has(item.question));
  return [...expandedItems, ...customItems];
}
export const getAboutCards = () => getSiteContent<AboutCardData[]>("about_cards", DEFAULT_ABOUT_CARDS);
export const getMasterSection = () => getSiteContent<MasterSectionData>("master_section", DEFAULT_MASTER_SECTION);
export const getTimeSection = () => getSiteContent<TimeSectionData>("time_section", DEFAULT_TIME_SECTION);
export const getEquipment = () => getSiteContent<EquipmentData[]>("equipment", DEFAULT_EQUIPMENT);
export const getServicesLeak = () => getSiteContent<ServiceData[]>("services_leak", DEFAULT_SERVICES_LEAK);
export const getServicesPipe = () => getSiteContent<ServiceData[]>("services_pipe", DEFAULT_SERVICES_PIPE);
export const getDemoBoardData = () => getSiteContent<DemoRequestData[]>("live_board_demo", []);
