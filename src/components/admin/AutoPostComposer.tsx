"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/app/admin/posts/actions";
import { attachMediaAssetToPost } from "@/app/admin/media/actions";
import allRegionData from "@/data/seo/seoul-regions.json";
import type { Region } from "@/types/seo";
import type { MediaAsset } from "@/types/database";

type LeakType = { group: string; value: string; slug: string; clue: string };
type GroupedValue = { group: string; value: string };

const LEAK_TYPES: LeakType[] = [
  { group: "급수·온수·난방 배관", value: "수도배관 누수", slug: "water-pipe", clue: "계량기 움직임과 급수 배관의 압력 변화를 함께 확인합니다." },
  { group: "급수·온수·난방 배관", value: "온수배관 누수", slug: "hot-water-pipe", clue: "온수를 사용할 때 변화가 생기는지와 온수 배관의 압력 상태를 구분해 봅니다." },
  { group: "급수·온수·난방 배관", value: "난방배관 누수", slug: "heating-pipe", clue: "보일러 압력 저하 여부와 난방 배관 계통의 상태를 우선 확인합니다." },
  { group: "급수·온수·난방 배관", value: "직수관 누수", slug: "direct-water-pipe", clue: "물을 사용하지 않는 시간에도 계량기 변화가 있는지 확인하는 것이 출발점입니다." },
  { group: "급수·온수·난방 배관", value: "매립배관 누수", slug: "buried-pipe", clue: "보이는 물기만으로 굴착 범위를 정하지 않고 배관 경로와 반응을 함께 살핍니다." },
  { group: "급수·온수·난방 배관", value: "급수배관 누수", slug: "supply-pipe", clue: "사용 조건과 압력 변화를 비교해 어느 배관 계통인지 좁혀 갑니다." },
  { group: "보일러·계량기 설비", value: "보일러 누수", slug: "boiler", clue: "보일러 본체·연결부·압력계 변화를 나누어 확인합니다." },
  { group: "보일러·계량기 설비", value: "보일러 배관 누수", slug: "boiler-pipe", clue: "보일러 주변 물기와 난방 계통의 압력 변화를 함께 점검합니다." },
  { group: "보일러·계량기 설비", value: "분배기 누수", slug: "manifold", clue: "분배기 연결부와 밸브 주변의 물기, 배관 계통별 반응을 확인합니다." },
  { group: "보일러·계량기 설비", value: "수도계량기 누수", slug: "water-meter", clue: "계량기함 내부와 연결 밸브에서 새는지, 배관 누수 신호인지 구분합니다." },
  { group: "보일러·계량기 설비", value: "계량기 밸브 누수", slug: "meter-valve", clue: "밸브 패킹·연결부의 물기와 계량기 회전 상태를 함께 살핍니다." },
  { group: "욕실·주방·배수", value: "화장실 누수", slug: "toilet-room", clue: "급수·배수·방수층 가운데 어떤 조건에서 물이 나타나는지 구분합니다." },
  { group: "욕실·주방·배수", value: "욕실 누수", slug: "bathroom", clue: "샤워 사용, 바닥 배수, 벽체와 배관 주변을 나누어 점검합니다." },
  { group: "욕실·주방·배수", value: "변기 누수", slug: "toilet-fixture", clue: "변기 급수 연결부·배수 연결부·바닥 밀착부의 상태를 구분해 봅니다." },
  { group: "욕실·주방·배수", value: "세면대 누수", slug: "sink-fixture", clue: "수전, 배수 트랩, 벽체 연결부 중 물이 생기는 조건을 확인합니다." },
  { group: "욕실·주방·배수", value: "샤워부스 누수", slug: "shower-booth", clue: "사용 중 누수인지, 실리콘·문틀·배수 문제인지 분리해 확인합니다." },
  { group: "욕실·주방·배수", value: "싱크대 누수", slug: "kitchen-sink", clue: "급수 호스, 배수관, 싱크볼 주변과 하부장 내부 상태를 살핍니다." },
  { group: "욕실·주방·배수", value: "주방 배수관 누수", slug: "kitchen-drain", clue: "물을 흘려보낼 때만 생기는지와 배수 연결부 상태를 확인합니다." },
  { group: "욕실·주방·배수", value: "하수관 누수", slug: "drain-pipe", clue: "배수 사용 조건, 악취, 역류 여부를 기준으로 배수 계통을 점검합니다." },
  { group: "건물 부위·외부 유입", value: "천장 누수", slug: "ceiling", clue: "물자국 위치가 곧 원인 위치는 아니므로 위층 설비·배관 경로를 함께 확인합니다." },
  { group: "건물 부위·외부 유입", value: "베란다 누수", slug: "veranda", clue: "배수구·창호·외벽·방수층 가운데 비나 사용 조건과 관계있는지 확인합니다." },
  { group: "건물 부위·외부 유입", value: "외벽 누수", slug: "exterior-wall", clue: "강우 시점과 균열·코킹·창호 주변 상태를 함께 살핍니다." },
  { group: "건물 부위·외부 유입", value: "옥상 누수", slug: "rooftop", clue: "방수층·배수·파라펫 주변을 점검해 유입 경로를 구분합니다." },
  { group: "건물 부위·외부 유입", value: "창틀 누수", slug: "window-frame", clue: "창틀 코킹, 배수홀, 외벽 접합부와 강우 시점을 함께 확인합니다." },
];

const SYMPTOMS: GroupedValue[] = [
  { group: "계량·요금·압력", value: "계량기가 계속 돌아감" }, { group: "계량·요금·압력", value: "수도요금이 갑자기 증가함" }, { group: "계량·요금·압력", value: "보일러 압력이 계속 떨어짐" }, { group: "계량·요금·압력", value: "보일러 보충수가 자주 필요함" },
  { group: "눈에 보이는 물기", value: "천장 물자국이 생김" }, { group: "눈에 보이는 물기", value: "천장에서 물이 떨어짐" }, { group: "눈에 보이는 물기", value: "벽지나 벽면이 젖음" }, { group: "눈에 보이는 물기", value: "바닥 습기가 계속됨" }, { group: "눈에 보이는 물기", value: "장판이나 마루가 들뜸" }, { group: "눈에 보이는 물기", value: "욕실 바닥 물고임이 계속됨" },
  { group: "냄새·곰팡이·생활 불편", value: "곰팡이와 습기가 심해짐" }, { group: "냄새·곰팡이·생활 불편", value: "하수구 냄새가 올라옴" }, { group: "냄새·곰팡이·생활 불편", value: "변기 주변 바닥이 젖음" },
  { group: "이웃·공용부 영향", value: "아랫집 천장에 누수가 생김" }, { group: "이웃·공용부 영향", value: "윗집 누수 여부 확인이 필요함" }, { group: "이웃·공용부 영향", value: "공용배관 누수 여부가 의심됨" },
];

const BUILDINGS = ["아파트", "빌라", "오피스텔", "다세대·다가구", "단독주택", "상가·사무실", "기타 건물"];
const DAMAGE_LOCATIONS = ["아랫집 천장", "거실·방 바닥", "욕실 바닥·벽체", "주방 싱크대 주변", "보일러실·다용도실", "베란다·창틀 주변", "계량기함·공용부"];
const DETECTION_METHODS = ["육안·수분 상태 점검", "계량기·압력 검사", "열화상 점검", "가스탐지", "청음탐지", "배수·통수 검사", "현장 상태에 맞춰 결정"];
const WORK_DIRECTIONS = ["원인 확인 후 부분 보수 여부 안내", "밸브·연결부 보수 여부 안내", "배관 부분 굴착·보수 여부 안내", "배수·방수 보수 여부 안내", "피해 복구 범위 상담"];

type Draft = { title: string; excerpt: string; content: string; imageStages: string[] };
type Props = { assets: MediaAsset[] };
type DraftMode = "guide" | "case";
type DraftInput = { place: string; building: string; buildingName: string; leak: LeakType; symptom: string; damageLocation: string; method: string; workDirection: string; mode: DraftMode; caseMemo: string; imageCount: number };
type TopicRecommendation = {
  building: string;
  damageLocation: string;
  leakSlug: string;
  symptom: string;
  method: string;
  workDirection: string;
};
const regions = allRegionData as Region[];
const districts = regions.filter((item) => item.level === "district");
const dongs = regions.filter((item) => item.level === "dong");

const TOPIC_RECIPES: TopicRecommendation[] = [
  { building: "아파트", damageLocation: "아랫집 천장", leakSlug: "hot-water-pipe", symptom: "보일러 압력이 계속 떨어짐", method: "계량기·압력 검사", workDirection: "배관 부분 굴착·보수 여부 안내" },
  { building: "빌라", damageLocation: "욕실 바닥·벽체", leakSlug: "toilet-fixture", symptom: "변기 주변 바닥이 젖음", method: "배수·통수 검사", workDirection: "배수·방수 보수 여부 안내" },
  { building: "오피스텔", damageLocation: "주방 싱크대 주변", leakSlug: "kitchen-sink", symptom: "벽지나 벽면이 젖음", method: "육안·수분 상태 점검", workDirection: "밸브·연결부 보수 여부 안내" },
  { building: "다세대·다가구", damageLocation: "계량기함·공용부", leakSlug: "water-meter", symptom: "계량기가 계속 돌아감", method: "계량기·압력 검사", workDirection: "밸브·연결부 보수 여부 안내" },
  { building: "아파트", damageLocation: "보일러실·다용도실", leakSlug: "manifold", symptom: "보일러 보충수가 자주 필요함", method: "계량기·압력 검사", workDirection: "밸브·연결부 보수 여부 안내" },
  { building: "단독주택", damageLocation: "베란다·창틀 주변", leakSlug: "window-frame", symptom: "곰팡이와 습기가 심해짐", method: "육안·수분 상태 점검", workDirection: "배수·방수 보수 여부 안내" },
  { building: "아파트", damageLocation: "거실·방 바닥", leakSlug: "heating-pipe", symptom: "장판이나 마루가 들뜸", method: "가스탐지", workDirection: "배관 부분 굴착·보수 여부 안내" },
  { building: "상가·사무실", damageLocation: "천장", leakSlug: "ceiling", symptom: "천장에서 물이 떨어짐", method: "열화상 점검", workDirection: "원인 확인 후 부분 보수 여부 안내" },
  { building: "빌라", damageLocation: "욕실 바닥·벽체", leakSlug: "bathroom", symptom: "욕실 바닥 물고임이 계속됨", method: "배수·통수 검사", workDirection: "배수·방수 보수 여부 안내" },
  { building: "아파트", damageLocation: "아랫집 천장", leakSlug: "water-pipe", symptom: "수도요금이 갑자기 증가함", method: "청음탐지", workDirection: "배관 부분 굴착·보수 여부 안내" },
  { building: "오피스텔", damageLocation: "보일러실·다용도실", leakSlug: "boiler", symptom: "보일러 압력이 계속 떨어짐", method: "계량기·압력 검사", workDirection: "원인 확인 후 부분 보수 여부 안내" },
  { building: "다세대·다가구", damageLocation: "베란다·창틀 주변", leakSlug: "exterior-wall", symptom: "벽지나 벽면이 젖음", method: "육안·수분 상태 점검", workDirection: "배수·방수 보수 여부 안내" },
];

function groupedOptions(items: GroupedValue[]) {
  return [...new Set(items.map((item) => item.group))].map((group) => ({ group, items: items.filter((item) => item.group === group) }));
}
function randomPick<T>(items: T[], count: number) { return [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length)); }

function buildDraft(input: DraftInput): Draft {
  const { place, building, buildingName, leak, symptom, damageLocation, method, workDirection, mode, caseMemo, imageCount } = input;
  const property = buildingName.trim() ? `${buildingName} ${building}` : building;
  const subject = `${place} ${property}`;
  const stages = ["피해 위치와 범위 확인", `${method} 진행`, `${leak.value} 원인 범위 구분`, workDirection, "작업 후 확인과 상담"].slice(0, imageCount);
  const opening = mode === "case"
    ? `${caseMemo.trim()} 이 글은 확인된 현장 메모를 바탕으로 정리한 시공사례 초안입니다.`
    : `${subject}에서 ${symptom}이 보일 때의 점검 순서를 정리한 상담 안내입니다. 증상만으로 원인이나 공사 범위를 단정하지 않고, 현장 확인 뒤 안내합니다.`;
  const sections = [
    `## 1. ${symptom}이 보일 때 먼저 확인할 점\n\n${damageLocation}에 물기나 얼룩이 보이면 물이 드러난 위치와 실제 원인이 같은지부터 확인해야 합니다. 사용 시간, 비가 온 날, 보일러 작동 여부처럼 증상이 달라지는 조건을 함께 기록하면 점검 범위를 좁히는 데 도움이 됩니다.\n\n[[AUTO_IMAGE_0]]`,
    `## 2. ${leak.value} 의심 시 점검 방향\n\n${leak.clue} ${method}은(는) 겉으로 보이는 피해와 설비 상태를 비교해 원인 범위를 좁히기 위한 과정입니다. 한 가지 반응만으로 결론을 내리지 않고, 건물 구조와 사용 조건을 함께 봐야 합니다.\n\n[[AUTO_IMAGE_1]]`,
    `## 3. ${damageLocation}에서 원인을 구분하는 과정\n\n${subject}처럼 ${damageLocation}에 증상이 나타난 경우에는 급수·온수·난방·배수·방수·외부 유입 가능성을 순서대로 살핍니다. ${leak.value}로 확인될 경우에도 손상 위치와 주변 마감 상태에 따라 작업 범위가 달라질 수 있습니다.\n\n[[AUTO_IMAGE_2]]`,
    `## 4. ${workDirection}\n\n원인이 확인되기 전에는 불필요하게 넓은 철거나 공사 범위를 정하지 않습니다. 확인된 위치, 배관 경로, 마감재 상태를 기준으로 ${workDirection}을(를) 설명드리고, 필요한 경우 피해 부위의 복구 순서도 함께 상담합니다.\n\n[[AUTO_IMAGE_3]]`,
    `## 5. 작업 뒤 재확인과 복구 상담\n\n보수 뒤에는 사용 조건에서 같은 증상이 다시 나타나는지 확인하는 과정이 필요합니다. ${symptom}이 계속되거나 피해 범위가 넓어지는 경우에는 지체하지 말고 현재 상태를 사진과 함께 알려 주세요.\n\n[[AUTO_IMAGE_4]]`,
  ].slice(0, imageCount);
  const title = mode === "case" ? `${place} ${buildingName ? `${buildingName} ` : ""}${leak.value} ${symptom} 점검·보수 사례` : `${place} ${buildingName ? `${buildingName} ` : ""}${leak.value} | ${symptom} 점검 안내`;
  return { title, excerpt: `${subject}에서 ${symptom}이 보일 때 ${leak.value} 가능성을 어떻게 구분하고 상담하는지 안내합니다.`, imageStages: stages, content: `## ${place} ${leak.value} 상담 안내\n\n${opening}\n\n${sections.join("\n\n")}\n\n## ${place} 누수 상담\n\n${place} ${property}에서 ${symptom}이 보이거나 ${leak.value} 점검이 필요하면 **010-5700-4026**으로 전화해 주세요. 피해 위치와 발생 조건을 알려 주시면 점검 방향부터 안내해 드립니다.` };
}

export function AutoPostComposer({ assets }: Props) {
  const router = useRouter();
  const [districtId, setDistrictId] = useState(districts[0]?.id ?? "");
  const [dongId, setDongId] = useState("");
  const [building, setBuilding] = useState(BUILDINGS[0]);
  const [buildingName, setBuildingName] = useState("");
  const [leak, setLeak] = useState<LeakType>(LEAK_TYPES[0]);
  const [symptom, setSymptom] = useState(SYMPTOMS[0].value);
  const [damageLocation, setDamageLocation] = useState(DAMAGE_LOCATIONS[0]);
  const [method, setMethod] = useState(DETECTION_METHODS[0]);
  const [workDirection, setWorkDirection] = useState(WORK_DIRECTIONS[0]);
  const [mode, setMode] = useState<DraftMode>("guide");
  const [caseMemo, setCaseMemo] = useState("");
  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>(() => randomPick(TOPIC_RECIPES, 6));
  const [picked, setPicked] = useState<MediaAsset[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const district = districts.find((item) => item.id === districtId);
  const availableDongs = dongs.filter((item) => item.parent_id === districtId);
  const dong = availableDongs.find((item) => item.id === dongId);
  const place = dong?.name ?? district?.name ?? "서울";

  function generate() {
    setError(null);
    if (mode === "case" && caseMemo.trim().length < 20) { setError("사례형 글은 확인된 현장 메모를 20자 이상 입력해 주세요."); return; }
    const nextPicked = randomPick(assets, assets.length ? 5 : 0);
    setPicked(nextPicked);
    setDraft(buildDraft({ place, building, buildingName, leak, symptom, damageLocation, method, workDirection, mode, caseMemo, imageCount: nextPicked.length }));
  }
  function applyRecommendation(topic: TopicRecommendation) {
    const recommendedLeak = LEAK_TYPES.find((item) => item.slug === topic.leakSlug);
    if (!recommendedLeak) return;
    setBuilding(topic.building);
    setDamageLocation(topic.damageLocation);
    setLeak(recommendedLeak);
    setSymptom(topic.symptom);
    setMethod(topic.method);
    setWorkDirection(topic.workDirection);
    setMode("guide");
    setCaseMemo("");
    setDraft(null);
    setError(null);
  }
  function saveDraft() {
    if (!draft || !district) return;
    setError(null);
    startTransition(async () => {
      try {
        const slug = `auto-${district.slug}-${dong?.slug ?? "district"}-${leak.slug}-${Date.now().toString(36)}`;
        const created = await createPost({ title: draft.title, slug, content: draft.content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, ""), excerpt: draft.excerpt, category: "leak", region_tags: [district.name], published: false });
        if (!created.ok) return setError(created.error);
        const imageIds: string[] = [];
        for (let index = 0; index < picked.length; index += 1) {
          const attached = await attachMediaAssetToPost({ postId: created.postId, assetId: picked[index].id, workStage: draft.imageStages[index], altText: `${place} ${leak.value} ${draft.imageStages[index]} 현장 사진`, caption: `${leak.value} 점검 안내의 ${draft.imageStages[index]} 사진입니다.` });
          if (!attached.ok) return setError(`사진 ${index + 1} 연결 실패: ${attached.error}`);
          imageIds.push(attached.imageId);
        }
        const content = draft.content.replace(/\[\[AUTO_IMAGE_(\d+)\]\]/g, (_, raw) => imageIds[Number(raw)] ? `[[post-image:${imageIds[Number(raw)]}]]` : "");
        const updated = await updatePost(created.postId, { title: draft.title, slug, content, excerpt: draft.excerpt, category: "leak", region_tags: [district.name], published: false });
        if (!updated.ok) return setError(updated.error);
        router.push(`/admin/posts/${created.postId}/edit`); router.refresh();
      } catch { setError("임시저장 중 문제가 생겼습니다. 사진 파일 크기와 네트워크를 확인한 뒤 다시 시도해 주세요."); }
    });
  }
  const selectClass = "rounded-lg border border-slate-300 px-3 py-3 font-normal";
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"><div className="space-y-5">
    <label className="grid gap-2 text-sm font-bold text-slate-800">구 선택<select value={districtId} onChange={(event) => { setDistrictId(event.target.value); setDongId(""); }} className={selectClass}>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">법정동 선택 <span className="font-normal text-slate-500">(선택)</span><select value={dongId} onChange={(event) => setDongId(event.target.value)} className={selectClass}><option value="">구 전체</option>{availableDongs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-extrabold text-slate-900">오늘의 글 주제 추천</p><p className="mt-1 text-xs leading-5 text-slate-500">서로 다른 건물·증상·누수 유형을 섞어 제안합니다.</p></div><button type="button" onClick={() => setRecommendations(randomPick(TOPIC_RECIPES, 6))} className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">다른 6개</button></div><div className="mt-3 grid gap-2">{recommendations.map((topic, index) => { const topicLeak = LEAK_TYPES.find((item) => item.slug === topic.leakSlug); return <button key={`${topic.leakSlug}-${topic.symptom}-${index}`} type="button" onClick={() => applyRecommendation(topic)} className="rounded-lg border border-slate-200 p-3 text-left text-sm transition hover:border-brand-400 hover:bg-brand-50"><span className="font-bold text-slate-900">{place} {topic.building} {topicLeak?.value}</span><span className="mt-1 block text-xs text-slate-600">{topic.damageLocation} · {topic.symptom}</span></button>; })}</div><p className="mt-3 text-xs leading-5 text-slate-500">선택하면 아래 입력값이 자동으로 채워집니다. 실제 사례로 공개할 때는 현장 메모와 사진을 확인해 사례형으로 전환합니다.</p></div>
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4"><p className="text-sm font-extrabold text-slate-900">글 작성 기준</p><div className="mt-3 grid gap-2 text-sm text-slate-700"><label><input type="radio" checked={mode === "guide"} onChange={() => setMode("guide")} /> <span className="ml-2 font-bold">점검·상담 안내</span><span className="ml-1 text-slate-500">확인 전 정보 중심</span></label><label><input type="radio" checked={mode === "case"} onChange={() => setMode("case")} /> <span className="ml-2 font-bold">실제 시공사례</span><span className="ml-1 text-slate-500">확인 메모 필수</span></label></div>{mode === "case" && <textarea value={caseMemo} onChange={(event) => setCaseMemo(event.target.value)} placeholder="예: 아랫집 주방 천장 물자국 확인, 온수관 압력 저하 확인, 부분 굴착 후 배관 보수" className="mt-3 min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm font-normal" />}</div>
    <label className="grid gap-2 text-sm font-bold text-slate-800">건물 유형<select value={building} onChange={(event) => setBuilding(event.target.value)} className={selectClass}>{BUILDINGS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">건물명 <span className="font-normal text-slate-500">(선택)</span><input value={buildingName} maxLength={60} onChange={(event) => setBuildingName(event.target.value)} placeholder="예: 한신아파트" className={selectClass} /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">피해가 보이는 위치<select value={damageLocation} onChange={(event) => setDamageLocation(event.target.value)} className={selectClass}>{DAMAGE_LOCATIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">누수 유형<select value={leak.value} onChange={(event) => setLeak(LEAK_TYPES.find((item) => item.value === event.target.value) ?? LEAK_TYPES[0])} className={selectClass}>{groupedOptions(LEAK_TYPES).map(({ group, items }) => <optgroup key={group} label={group}>{items.map((item) => <option key={item.value}>{item.value}</option>)}</optgroup>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">대표 증상<select value={symptom} onChange={(event) => setSymptom(event.target.value)} className={selectClass}>{groupedOptions(SYMPTOMS).map(({ group, items }) => <optgroup key={group} label={group}>{items.map((item) => <option key={item.value}>{item.value}</option>)}</optgroup>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">점검 방법<select value={method} onChange={(event) => setMethod(event.target.value)} className={selectClass}>{DETECTION_METHODS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-800">보수 방향<select value={workDirection} onChange={(event) => setWorkDirection(event.target.value)} className={selectClass}>{WORK_DIRECTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-700"><p className="font-bold text-slate-800">사진 선택은 다음 단계에서 개선합니다</p><p className="mt-1">현재는 등록 사진 중 최대 5장을 무작위로 선택합니다. 사진 내용을 분석·태그화한 뒤 이 선택값과 맞는 사진을 우선 연결하도록 바꿉니다.</p></div>
    <button type="button" onClick={generate} className="bg-brand-600 hover:bg-brand-700 w-full rounded-lg px-4 py-3 font-bold text-white">자동 초안 만들기</button>
    {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
  </div><div className="rounded-xl border border-slate-200 bg-slate-50 p-5">{draft ? <><p className="text-brand-700 text-xs font-bold tracking-wider">임시저장 전 미리보기</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{draft.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{draft.excerpt}</p><p className="mt-5 rounded-lg bg-white p-3 text-sm font-semibold text-slate-700">선택 사진: {picked.length}장 · 저장 시 글 속 사진 위치와 ALT·캡션이 등록됩니다.</p><pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-white p-4 text-sm leading-6 whitespace-pre-wrap text-slate-700">{draft.content.replace(/\[\[AUTO_IMAGE_\d+\]\]/g, "[사진]")}</pre><button type="button" disabled={pending} onClick={saveDraft} className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-bold text-white disabled:bg-slate-400">{pending ? "사진과 초안을 저장 중..." : "임시저장하고 편집하기"}</button></> : <p className="text-sm leading-6 text-slate-500">왼쪽에서 현장 조건을 선택하면, 선택값에 맞춰 서로 다른 점검 흐름의 초안을 만듭니다. 발행은 하지 않으며 먼저 임시저장됩니다.</p>}</div></div>;
}
