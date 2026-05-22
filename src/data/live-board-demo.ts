/**
 * LiveBoard 더미 풀 — 운영 초기 화면이 비어 보이지 않도록 노출.
 *
 * 동작 원리:
 *   - 풀은 32건의 정적 상수. DB에 INSERT 되지 않음.
 *   - 노출 시점에 `selectDemoItems()`가 KST 일자 시드로 6~8건을 결정적으로 추출.
 *   - 각 행의 birth_time / status는 `live-board-lifecycle.ts`에서 시드 기반으로 계산.
 *
 * 안전 장치:
 *   - 모든 이름은 이미 마스킹된 형태("김o수")로 박혀 있음. 본명 0건.
 *   - phone / customer_name 등 마스킹 전 식별정보 0건.
 *   - 환경변수 NEXT_PUBLIC_LIVE_BOARD_DEMO=false 로 즉시 OFF 가능.
 */

export type DemoCategory = "leak" | "sink" | "toilet" | "heating" | "frozen";

export type DemoRequest = {
  /** "d001" ~ "d032". 진짜 uuid와 형식이 달라 Realtime 충돌 0. */
  id: string;
  /** DB의 masked_name generated column과 동일 형태 (첫글자+o+마지막글자) */
  masked_name: string;
  /** "서울 강남구" / "경기 성남시 분당구" / "인천 부평구" — 영업 권역 내 정식 행정구역만 */
  region: string;
  /** 광역 단위 (지역 다양성 검사용). 영업 권역(서울·경기·인천)만 허용. */
  metro: "서울" | "경기" | "인천";
  /** 카테고리 (현재 UI 미노출, 향후 필터 확장용) */
  category: DemoCategory;
  /** 증상 메타 (현재 UI 미노출, 향후 카드 확장용) */
  symptom: string;
};

export const DEMO_POOL: readonly DemoRequest[] = [
  // === 서울 14건 ===
  { id: "d001", masked_name: "김o수", region: "서울 강남구",   metro: "서울", category: "leak",    symptom: "천장 누수" },
  { id: "d002", masked_name: "이o훈", region: "서울 서초구",   metro: "서울", category: "leak",    symptom: "베란다 외벽 누수" },
  { id: "d003", masked_name: "박o영", region: "서울 송파구",   metro: "서울", category: "toilet",  symptom: "변기 막힘" },
  { id: "d004", masked_name: "정o현", region: "서울 강동구",   metro: "서울", category: "sink",    symptom: "싱크대 배수 막힘" },
  { id: "d005", masked_name: "최o서", region: "서울 관악구",   metro: "서울", category: "leak",    symptom: "화장실 천장 누수" },
  { id: "d006", masked_name: "강o윤", region: "서울 마포구",   metro: "서울", category: "heating", symptom: "보일러 가동 불량" },
  { id: "d007", masked_name: "조o빈", region: "서울 종로구",   metro: "서울", category: "toilet",  symptom: "변기 물 안 내려감" },
  { id: "d008", masked_name: "윤o준", region: "서울 용산구",   metro: "서울", category: "leak",    symptom: "주방 싱크 하부 누수" },
  { id: "d021", masked_name: "오o연", region: "서울 강북구",   metro: "서울", category: "toilet",  symptom: "변기 누수" },
  { id: "d022", masked_name: "류o석", region: "서울 광진구",   metro: "서울", category: "heating", symptom: "분배기 누수" },
  { id: "d023", masked_name: "도o윤", region: "서울 영등포구", metro: "서울", category: "leak",    symptom: "베란다 외벽 누수" },
  { id: "d024", masked_name: "양o지", region: "서울 성동구",   metro: "서울", category: "leak",    symptom: "화장실 천장 누수" },
  { id: "d027", masked_name: "진o아", region: "서울 노원구",   metro: "서울", category: "frozen",  symptom: "외부 수도 동파" },
  { id: "d029", masked_name: "봉o석", region: "서울 동작구",   metro: "서울", category: "leak",    symptom: "옥상 방수 손상" },

  // === 경기 12건 ===
  { id: "d009", masked_name: "한o아", region: "경기 성남시",          metro: "경기", category: "leak",    symptom: "윗집 누수 의심" },
  { id: "d010", masked_name: "임o호", region: "경기 성남시 분당구",   metro: "경기", category: "sink",    symptom: "주방 배수 역류" },
  { id: "d011", masked_name: "서o진", region: "경기 용인시",          metro: "경기", category: "leak",    symptom: "베란다 결로 + 누수" },
  { id: "d012", masked_name: "신o경", region: "경기 수원시",          metro: "경기", category: "toilet",  symptom: "변기 누수" },
  { id: "d013", masked_name: "황o민", region: "경기 고양시",          metro: "경기", category: "heating", symptom: "온수 안 나옴" },
  { id: "d014", masked_name: "안o석", region: "경기 고양시 일산동구", metro: "경기", category: "leak",    symptom: "천장 얼룩 + 물방울" },
  { id: "d015", masked_name: "송o환", region: "경기 안양시",          metro: "경기", category: "frozen",  symptom: "배관 동파 의심" },
  { id: "d016", masked_name: "권o지", region: "경기 하남시",          metro: "경기", category: "leak",    symptom: "화장실 슬라브 누수" },
  { id: "d025", masked_name: "차o호", region: "경기 시흥시",          metro: "경기", category: "heating", symptom: "보일러 가동 불량" },
  { id: "d028", masked_name: "남o훈", region: "경기 의정부시",        metro: "경기", category: "leak",    symptom: "아랫집 천장 누수 컴플레인" },
  { id: "d030", masked_name: "변o영", region: "경기 부천시",          metro: "경기", category: "leak",    symptom: "방수공사 후 재누수" },
  { id: "d032", masked_name: "마o진", region: "경기 김포시",          metro: "경기", category: "toilet",  symptom: "변기 후레쉬 고장" },

  // === 인천 6건 ===
  { id: "d017", masked_name: "장o훈", region: "인천 부평구",   metro: "인천", category: "leak",    symptom: "다용도실 누수" },
  { id: "d018", masked_name: "노o석", region: "인천 연수구",   metro: "인천", category: "toilet",  symptom: "변기 막힘 재발" },
  { id: "d019", masked_name: "백o현", region: "인천 서구",     metro: "인천", category: "sink",    symptom: "싱크 호스 누수" },
  { id: "d020", masked_name: "유o빈", region: "인천 남동구",   metro: "인천", category: "leak",    symptom: "외벽 크랙 누수" },
  { id: "d026", masked_name: "표o윤", region: "인천 동구",     metro: "인천", category: "frozen",  symptom: "외부 수도 동파" },
  { id: "d031", masked_name: "라o민", region: "인천 미추홀구", metro: "인천", category: "sink",    symptom: "세면대 배수 누수" },
];
