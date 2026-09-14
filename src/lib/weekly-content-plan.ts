export type ScheduledGuide = {
  district: string;
  dong: string;
  building: string;
  leak: string;
  symptom: string;
  location: string;
  check: string;
  repair: string;
  slugKey: string;
  keywords: string[];
};

export const WEEKLY_GUIDES: ScheduledGuide[] = [
  { district: "강남구", dong: "대치동", building: "아파트", leak: "난방배관 누수", symptom: "보일러 압력이 반복해서 떨어짐", location: "거실 바닥과 아랫집 천장", check: "보일러 압력 변화와 난방 계통별 반응을 비교", repair: "원인 구간을 확인한 뒤 필요한 범위만 부분 보수", slugKey: "daechi-heating-pressure", keywords: ["난방배관", "보일러", "배관", "탐지장비"] },
  { district: "노원구", dong: "상계동", building: "빌라", leak: "수도계량기 누수", symptom: "물을 쓰지 않아도 계량기가 돌아감", location: "계량기함과 세대 직수관", check: "모든 수전을 잠근 상태에서 계량기와 밸브를 구간별 확인", repair: "밸브·연결부와 매립 직수관을 구분해 보수 범위 결정", slugKey: "sanggye-water-meter", keywords: ["수도계량기", "수도배관", "배관"] },
  { district: "마포구", dong: "연남동", building: "오피스텔", leak: "싱크대 누수", symptom: "주방 하부장이 젖고 냄새가 남", location: "싱크볼 아래 급수호스와 배수트랩", check: "물을 받을 때와 흘려보낼 때를 나눠 연결부 확인", repair: "문제가 확인된 호스·트랩·배수 연결부를 선택 보수", slugKey: "yeonnam-kitchen-cabinet", keywords: ["싱크대", "배수관", "주방", "배관"] },
  { district: "성북구", dong: "길음동", building: "아파트", leak: "천장 누수", symptom: "아랫집 천장 물자국이 점점 넓어짐", location: "욕실 아래 천장과 배관 경로", check: "위층 물 사용 조건과 수분 분포를 함께 비교", repair: "급수·배수·방수 원인을 구분한 뒤 해당 부위만 보수", slugKey: "gireum-ceiling-stain", keywords: ["천장", "욕실", "배관", "탐지장비"] },
  { district: "도봉구", dong: "창동", building: "아파트", leak: "온수배관 누수", symptom: "온수를 쓸 때 바닥 습기가 심해짐", location: "보일러실에서 욕실로 이어지는 바닥", check: "냉수·온수 사용 조건과 압력 변화를 분리 점검", repair: "온수 계통의 손상 구간 확인 후 최소 범위로 보수", slugKey: "changdong-hot-water-floor", keywords: ["온수배관", "보일러", "바닥", "배관"] },
  { district: "송파구", dong: "문정동", building: "아파트", leak: "분배기 누수", symptom: "보일러실 바닥에 물이 고임", location: "난방 분배기 밸브와 연결부", check: "분배기 각 밸브와 난방 회로의 압력 변화를 확인", repair: "패킹·밸브·연결부 중 원인이 확인된 부위 보수", slugKey: "munjeong-manifold-water", keywords: ["분배기", "난방배관", "보일러", "배관"] },
  { district: "은평구", dong: "불광동", building: "단독주택", leak: "직수관 누수", symptom: "수도요금이 갑자기 크게 증가함", location: "계량기 이후 마당과 실내 인입 배관", check: "계량기 변화와 구간 차단으로 실내외 배관을 구분", repair: "누수 구간을 좁힌 뒤 굴착 범위와 복구 방법 안내", slugKey: "bulgwang-water-bill", keywords: ["수도계량기", "직수관", "수도배관", "배관"] },
  { district: "영등포구", dong: "여의도동", building: "사무실", leak: "천장 누수", symptom: "업무공간 천장에서 물이 떨어짐", location: "천장 텍스 위 배관과 윗층 설비", check: "발생 시간과 윗층 급수·배수 사용 조건을 확인", repair: "영업 피해를 줄이도록 점검·보수 순서를 나눠 진행", slugKey: "yeouido-office-ceiling", keywords: ["천장", "배관", "탐지장비"] },
  { district: "광진구", dong: "자양동", building: "빌라", leak: "변기 누수", symptom: "변기 주변 바닥이 계속 젖음", location: "변기 급수호스·물탱크·배수 연결부", check: "물을 내릴 때와 사용하지 않을 때의 물기를 비교", repair: "급수 또는 배수 원인에 맞춰 연결부 재시공 여부 결정", slugKey: "jayang-toilet-floor", keywords: ["변기", "화장실", "욕실", "배수관"] },
  { district: "강서구", dong: "마곡동", building: "오피스텔", leak: "세면대 누수", symptom: "욕실장 아래로 물이 번짐", location: "세면대 수전호스와 배수트랩", check: "급수 사용과 배수 사용을 나눠 물이 생기는 시점 확인", repair: "노후 호스·트랩·벽체 연결부 가운데 원인 부위 보수", slugKey: "magok-basin-cabinet", keywords: ["세면대", "욕실", "배수관", "배관"] },
  { district: "동작구", dong: "사당동", building: "다세대주택", leak: "욕실 누수", symptom: "샤워 후 아랫집 천장에 물기가 생김", location: "욕실 바닥 배수와 방수 경계", check: "샤워·바닥배수·급수 사용 조건을 나눠 재현", repair: "배관과 방수 문제를 구분해 필요한 범위만 보수", slugKey: "sadang-shower-downstairs", keywords: ["욕실", "배수관", "바닥", "천장"] },
  { district: "관악구", dong: "봉천동", building: "빌라", leak: "매립배관 누수", symptom: "방 장판이 들뜨고 습기가 남", location: "방 바닥 아래 급수·난방 배관", check: "표면 수분과 압력 반응을 비교해 배관 계통을 구분", repair: "탐지된 지점을 기준으로 최소 굴착·배관 보수", slugKey: "bongcheon-lifted-floor", keywords: ["매립배관", "바닥", "난방배관", "탐지장비"] },
  { district: "서초구", dong: "반포동", building: "아파트", leak: "샤워부스 누수", symptom: "샤워 뒤 욕실 밖 문턱이 젖음", location: "샤워부스 문틀·실리콘·바닥 배수", check: "살수 방향과 배수 속도를 달리해 유출 경로 확인", repair: "실리콘·문틀·배수·방수 중 확인된 원인에 맞춰 보수", slugKey: "banpo-shower-threshold", keywords: ["샤워부스", "욕실", "바닥", "배수관"] },
  { district: "종로구", dong: "평창동", building: "단독주택", leak: "외벽 누수", symptom: "비 온 뒤 벽지에 얼룩이 생김", location: "외벽 균열·창호 접합부와 실내 벽체", check: "강우 방향과 외벽 균열·코킹 상태를 함께 확인", repair: "유입 경로가 확인된 외벽·창호 접합부 방수 보수", slugKey: "pyeongchang-rain-wall", keywords: ["외벽", "창틀", "벽체"] },
  { district: "중랑구", dong: "면목동", building: "다가구주택", leak: "보일러배관 누수", symptom: "보충수를 자주 채워야 함", location: "보일러 연결부와 세대 난방배관", check: "보일러 본체와 난방 회로의 압력 저하를 분리 확인", repair: "본체·연결부·매립배관 중 확인된 구간을 보수", slugKey: "myeonmok-boiler-refill", keywords: ["보일러", "난방배관", "배관"] },
  { district: "용산구", dong: "한남동", building: "빌라", leak: "베란다 누수", symptom: "비가 오면 베란다 안쪽에 물이 고임", location: "창틀 하부·외벽 접합부·배수구", check: "강우 방향과 배수 상태, 창틀 코킹을 순서대로 확인", repair: "외부 유입 경로와 배수 문제를 구분해 보수", slugKey: "hannam-veranda-rain", keywords: ["베란다", "창틀", "외벽", "배수관"] },
  { district: "동대문구", dong: "장안동", building: "상가", leak: "하수관 누수", symptom: "천장 얼룩과 하수 냄새가 함께 남", location: "상가 천장 위 공용 배수관", check: "윗층 배수 사용 시간과 냄새·수분 발생을 비교", repair: "배수관 이음부와 균열 위치를 확인해 보수", slugKey: "jangan-shop-drain", keywords: ["하수관", "배수관", "천장"] },
  { district: "구로구", dong: "구로동", building: "아파트", leak: "급수배관 누수", symptom: "벽 안에서 물 흐르는 소리가 남", location: "욕실과 주방 사이 벽체 배관", check: "수전 차단과 압력 변화를 이용해 급수 계통 확인", repair: "배관 경로와 반응 지점을 기준으로 부분 보수", slugKey: "guro-wall-sound", keywords: ["급수배관", "벽체", "배관", "탐지장비"] },
  { district: "금천구", dong: "독산동", building: "다세대주택", leak: "화장실 누수", symptom: "욕실을 쓴 날만 아래층이 젖음", location: "욕실 바닥·배수구·변기 주변", check: "세면대·샤워·변기 사용을 나눠 누수 조건 확인", repair: "배수 연결부와 방수층 중 원인에 맞춘 보수", slugKey: "doksan-bathroom-use", keywords: ["화장실", "욕실", "배수관", "변기"] },
  { district: "강동구", dong: "천호동", building: "아파트", leak: "온수배관 누수", symptom: "욕실 앞 마루가 따뜻하고 들뜸", location: "욕실 앞 바닥 매립 온수관", check: "온수 사용 전후 표면 온도와 압력 변화를 비교", repair: "온수관 손상 지점 확인 후 바닥 부분 보수", slugKey: "cheonho-warm-floor", keywords: ["온수배관", "바닥", "욕실", "탐지장비"] },
  { district: "서대문구", dong: "연희동", building: "단독주택", leak: "옥상 누수", symptom: "비가 많이 오면 최상층 천장이 젖음", location: "옥상 방수층·배수구·파라펫", check: "균열과 배수 정체, 벽체 접합부를 함께 확인", repair: "유입 범위를 확인한 뒤 부분 또는 구간 방수 보수", slugKey: "yeonhui-rooftop-rain", keywords: ["옥상", "천장", "외벽", "배수관"] },
  { district: "성동구", dong: "성수동", building: "상가", leak: "주방 배수관 누수", symptom: "물을 많이 쓰면 바닥으로 물이 나옴", location: "싱크대 배수관과 바닥 배수 연결부", check: "소량·대량 배수 조건을 나눠 역류와 누수 확인", repair: "막힘·이음부·배수관 손상을 구분해 보수", slugKey: "seongsu-shop-kitchen-drain", keywords: ["싱크대", "주방", "배수관", "바닥"] },
  { district: "양천구", dong: "목동", building: "아파트", leak: "난방배관 누수", symptom: "특정 방만 난방이 약하고 압력이 떨어짐", location: "방 바닥 난방 회로와 분배기", check: "분배기 회로별 압력과 난방 반응을 비교", repair: "문제 회로와 손상 구간 확인 후 부분 보수", slugKey: "mokdong-weak-heating", keywords: ["난방배관", "분배기", "바닥", "배관"] },
  { district: "중구", dong: "신당동", building: "빌라", leak: "수도배관 누수", symptom: "현관 쪽 벽면이 젖고 곰팡이가 생김", location: "현관 벽체와 인접 세대 급수관", check: "수분 분포와 계량기·급수 압력 변화를 비교", repair: "결로·외부 유입과 배관 누수를 구분한 뒤 보수", slugKey: "sindang-entry-wall", keywords: ["수도배관", "벽체", "수도계량기", "탐지장비"] },
  { district: "강북구", dong: "미아동", building: "다가구주택", leak: "계량기 밸브 누수", symptom: "계량기함 안에 물이 계속 참", location: "계량기 전후 밸브와 연결 소켓", check: "세대 사용을 멈춘 뒤 밸브 전후 물기와 회전을 확인", repair: "관리 주체를 구분하고 해당 밸브·연결부를 보수", slugKey: "mia-meter-box-water", keywords: ["수도계량기", "밸브", "수도배관"] },
  { district: "부평구", dong: "부평동", building: "아파트", leak: "욕실 누수", symptom: "아랫집 욕실 천장에 물방울이 맺힘", location: "위층 욕실 배수관과 방수 경계", check: "샤워·세면대·변기 사용을 나눠 증상 재현", repair: "배수 연결부와 방수층의 원인을 구분해 보수", slugKey: "bupyeong-bathroom-drop", keywords: ["욕실", "천장", "배수관", "변기"] },
  { district: "남동구", dong: "구월동", building: "오피스텔", leak: "보일러 누수", symptom: "보일러 아래에 물이 고이고 에러가 남", location: "보일러 본체·응축수·연결 밸브", check: "난방과 온수 운전 시 물이 생기는 위치 확인", repair: "본체 서비스와 배관 연결부 보수 범위를 구분", slugKey: "guwol-boiler-bottom", keywords: ["보일러", "밸브", "배관"] },
  { district: "미추홀구", dong: "주안동", building: "빌라", leak: "싱크대 누수", symptom: "싱크대를 쓸 때 아래층 천장이 젖음", location: "주방 급수호스·배수관과 바닥 관통부", check: "급수와 배수를 따로 사용해 누수 조건 확인", repair: "호스·트랩·매립 배관 중 원인 부위 보수", slugKey: "juan-sink-downstairs", keywords: ["싱크대", "주방", "배수관", "천장"] },
  { district: "연수구", dong: "송도동", building: "아파트", leak: "창틀 누수", symptom: "비바람 뒤 창가 바닥이 젖음", location: "창틀 코킹·배수홀·외벽 접합부", check: "풍향과 강우량에 따른 유입 흔적을 확인", repair: "배수홀과 코킹, 외벽 접합부 중 원인 구간 보수", slugKey: "songdo-window-rain", keywords: ["창틀", "외벽", "바닥"] },
  { district: "서구", dong: "청라동", building: "아파트", leak: "배수관 누수", symptom: "세탁기 사용 뒤 다용도실 바닥이 젖음", location: "세탁기 호스·바닥 배수구·공용 배수관", check: "급수와 탈수 배수를 나눠 누수·역류 여부 확인", repair: "호스·배수구·관 연결부 중 확인된 원인 보수", slugKey: "cheongna-laundry-drain", keywords: ["배수관", "바닥", "배관"] },
  { district: "수원시 영통구", dong: "영통동", building: "아파트", leak: "온수배관 누수", symptom: "욕실 앞 바닥에 습기가 반복됨", location: "욕실 앞 매립 온수관과 문턱", check: "온수 사용 전후 수분·온도·압력 변화를 비교", repair: "배관과 방수 원인을 구분해 필요한 부위 보수", slugKey: "yeongtong-hot-water-moisture", keywords: ["온수배관", "욕실", "바닥", "탐지장비"] },
  { district: "성남시 분당구", dong: "정자동", building: "아파트", leak: "난방배관 누수", symptom: "보일러 압력이 떨어지고 마루가 변색됨", location: "거실 마루 아래 난방 회로", check: "회로별 압력과 바닥 수분·온도 분포를 확인", repair: "손상 지점 확인 후 최소 범위 굴착과 배관 보수", slugKey: "jeongja-heating-floor", keywords: ["난방배관", "보일러", "바닥", "탐지장비"] },
  { district: "고양시 일산동구", dong: "백석동", building: "오피스텔", leak: "세면대 누수", symptom: "욕실장 안쪽에 곰팡이와 물기가 생김", location: "세면대 수전호스·트랩·벽체 급수관", check: "급수와 배수 사용을 나눠 젖는 위치 확인", repair: "호스·트랩·벽체 연결부 중 원인에 맞춰 보수", slugKey: "baekseok-basin-mold", keywords: ["세면대", "욕실", "배수관", "벽체"] },
  { district: "용인시 수지구", dong: "죽전동", building: "아파트", leak: "분배기 누수", symptom: "분배기함 안에서 녹물과 물기가 보임", location: "난방 분배기 밸브·연결 소켓", check: "각 회로 운전과 밸브 주변 누수 흔적을 확인", repair: "부식된 밸브·연결부와 배관 상태에 맞춰 보수", slugKey: "jukjeon-manifold-rust", keywords: ["분배기", "난방배관", "밸브", "배관"] },
  { district: "부천시 원미구", dong: "중동", building: "빌라", leak: "화장실 누수", symptom: "변기 사용 뒤 아래층 천장에 흔적이 생김", location: "변기 배수 연결부와 욕실 바닥", check: "변기 물내림과 샤워 사용을 분리해 재현", repair: "변기 배수와 방수 문제를 구분해 보수", slugKey: "jungdong-toilet-ceiling", keywords: ["변기", "화장실", "욕실", "천장"] },
  { district: "강남구", dong: "논현동", building: "상가", leak: "천장 누수", symptom: "영업 중 천장 조명 주변으로 물이 번짐", location: "천장 내부 급수관과 윗층 배수 설비", check: "윗층 물 사용 시간과 천장 수분 분포를 비교", repair: "전기 안전을 확보하고 확인된 배관 구간만 보수", slugKey: "nonhyeon-shop-ceiling-light", keywords: ["천장", "급수배관", "배수관", "탐지장비"] },
  { district: "노원구", dong: "월계동", building: "아파트", leak: "베란다 누수", symptom: "세탁기 탈수 뒤 베란다 바닥에 물이 고임", location: "세탁기 배수호스와 바닥 배수구", check: "급수·세탁·탈수 단계를 나눠 물이 생기는 시점 확인", repair: "호스와 배수구 연결 상태에 맞춰 필요한 부위 보수", slugKey: "wolgye-laundry-veranda", keywords: ["베란다", "배수관", "바닥", "배관"] },
  { district: "마포구", dong: "망원동", building: "빌라", leak: "벽체 누수", symptom: "비가 오지 않아도 벽지가 젖고 들뜸", location: "주방과 욕실 사이 벽체 급수관", check: "강우 영향과 계량기·급수 압력 변화를 분리 확인", repair: "결로와 배관 누수를 구분한 뒤 원인 구간 보수", slugKey: "mangwon-wallpaper-moisture", keywords: ["벽체", "급수배관", "수도계량기", "탐지장비"] },
  { district: "성북구", dong: "정릉동", building: "단독주택", leak: "마당 수도관 누수", symptom: "마당 한쪽이 계속 젖고 계량기가 돌아감", location: "계량기 이후 실외 매립 직수관", check: "실내외 밸브를 나눠 차단하고 계량기 반응 확인", repair: "누수 지점을 좁힌 뒤 최소 범위 굴착과 배관 보수", slugKey: "jeongneung-yard-water-pipe", keywords: ["수도계량기", "직수관", "매립배관", "탐지장비"] },
  { district: "송파구", dong: "잠실동", building: "아파트", leak: "욕조 누수", symptom: "목욕물을 뺄 때 아래층 천장이 젖음", location: "욕조 배수구와 트랩 연결부", check: "급수와 욕조 배수를 분리해 누수 조건을 재현", repair: "배수 연결부 또는 방수 경계 중 확인된 원인 보수", slugKey: "jamsil-bathtub-drain", keywords: ["욕조", "욕실", "배수관", "천장"] },
  { district: "구로구", dong: "개봉동", building: "다가구주택", leak: "공용배관 누수", symptom: "여러 세대가 물을 쓸 때 계단 벽이 젖음", location: "계단 벽체 내부 공용 급수·배수관", check: "세대별 사용 시간과 공용관 압력·배수 반응을 비교", repair: "전용·공용 구간을 구분하고 관리 주체와 보수 범위 결정", slugKey: "gaebong-shared-pipe-stair", keywords: ["공용배관", "벽체", "급수배관", "배수관"] },
  { district: "서초구", dong: "양재동", building: "사무실", leak: "에어컨 배수 누수", symptom: "냉방할 때만 천장에 물방울이 생김", location: "천장형 에어컨 드레인 호스와 배수관", check: "냉방 운전 시간과 드레인 배수 상태를 확인", repair: "막힘·기울기·이음부 중 확인된 원인에 맞춰 정비", slugKey: "yangjae-aircon-drain", keywords: ["천장", "배수관", "에어컨"] },
  { district: "인천 계양구", dong: "작전동", building: "아파트", leak: "세탁실 누수", symptom: "세탁하지 않아도 세탁실 벽 아래가 젖음", location: "세탁기 급수밸브와 벽체 매립 급수관", check: "급수밸브 차단 전후 수분과 계량기 변화를 비교", repair: "밸브·호스·매립관 중 확인된 원인 부위 보수", slugKey: "jakjeon-laundry-wall", keywords: ["밸브", "급수배관", "벽체", "수도계량기"] },
  { district: "인천 중구", dong: "운서동", building: "오피스텔", leak: "천장 배관 누수", symptom: "새벽에만 욕실 천장에서 물이 떨어짐", location: "윗층 욕실 배수관과 공용 수직관", check: "발생 시간과 윗층·공용관 사용 조건을 대조", repair: "전용 배수와 공용 수직관을 구분해 보수 주체 결정", slugKey: "unseo-night-ceiling-drip", keywords: ["천장", "욕실", "배수관", "공용배관"] },
  { district: "고양시 덕양구", dong: "화정동", building: "아파트", leak: "보일러 분배기 누수", symptom: "분배기함 주변 마루가 검게 변색됨", location: "분배기 밸브와 난방관 연결부", check: "회로별 운전과 압력·수분 반응을 비교", repair: "노후 밸브나 연결부를 확인해 해당 부분만 보수", slugKey: "hwajeong-manifold-floor", keywords: ["분배기", "난방배관", "바닥", "밸브"] },
  { district: "안양시 동안구", dong: "평촌동", building: "아파트", leak: "주방 온수관 누수", symptom: "싱크대 앞 마루가 따뜻하고 부풀어 오름", location: "주방 바닥 매립 온수관", check: "온수 사용 전후 바닥 온도·수분·압력 변화를 확인", repair: "온수관 손상 위치를 찾은 뒤 최소 범위로 바닥 보수", slugKey: "pyeongchon-kitchen-hot-water", keywords: ["온수배관", "싱크대", "바닥", "탐지장비"] },
  { district: "의정부시", dong: "민락동", building: "아파트", leak: "화장실 방수 누수", symptom: "샤워를 오래 한 날만 아래층 벽이 젖음", location: "욕실 바닥 방수층과 벽체 모서리", check: "짧은 급수와 장시간 살수 조건을 나눠 확인", repair: "배관 이상 여부를 먼저 제외하고 방수 보수 범위 결정", slugKey: "minrak-shower-waterproof", keywords: ["욕실", "화장실", "벽체", "바닥"] },
  { district: "남양주시", dong: "다산동", building: "아파트", leak: "실외기실 누수", symptom: "비 온 뒤 실외기실 벽과 바닥이 젖음", location: "외벽 관통부·창호 코킹·바닥 배수구", check: "강우 방향과 관통부·배수 상태를 함께 확인", repair: "외부 유입 지점을 확인해 코킹 또는 방수 구간 보수", slugKey: "dasan-outdoor-unit-rain", keywords: ["외벽", "창틀", "바닥", "배수관"] },
  { district: "광명시", dong: "철산동", building: "아파트", leak: "수전 누수", symptom: "물을 잠가도 욕실 수전 벽면에서 물이 맺힘", location: "수전 편심과 벽체 내부 급수 연결부", check: "냉수·온수 밸브를 나눠 차단하고 물기 변화를 확인", repair: "수전 연결부와 벽체 배관 중 원인 부위 보수", slugKey: "cheolsan-faucet-wall", keywords: ["수전", "욕실", "벽체", "급수배관"] },
];

export const DAILY_PUBLISH_TIMES = [
  ["08:37", "10:16", "12:48", "15:23", "18:11", "20:42", "22:07"],
  ["07:54", "09:41", "12:22", "14:57", "17:36", "21:14"],
  ["08:13", "10:49", "13:06", "15:38", "18:27", "20:03", "21:46", "23:08"],
  ["09:07", "11:32", "14:18", "17:49", "20:26"],
  ["08:28", "10:57", "13:43", "16:09", "18:52", "21:31", "22:44"],
  ["07:46", "09:24", "11:53", "14:36", "17:17", "19:48", "21:22", "22:53"],
  ["08:09", "10:34", "13:19", "15:54", "18:33", "20:17", "22:29", "23:11"],
] as const;

export const DAILY_PUBLISH_COUNTS = DAILY_PUBLISH_TIMES.map((times) => times.length);

export function buildGuideContent(guide: ScheduledGuide) {
  const place = `${guide.district} ${guide.dong}`;
  return `## ${guide.symptom}, 먼저 이렇게 확인합니다\n\n${place} ${guide.building}에서 **${guide.symptom}**이 나타나면 보이는 물기만으로 ${guide.leak}이라고 단정하기 어렵습니다. 물을 사용한 시간, 비가 온 날, 보일러 작동 여부처럼 증상이 달라지는 조건을 먼저 기록해 주세요. 이 정보가 불필요한 철거를 줄이고 점검 순서를 정하는 데 도움이 됩니다.\n\n[[AUTO_IMAGE_0]]\n\n## ${place} ${guide.leak} 점검 순서\n\n현장에서는 ${guide.location}을 중심으로 **${guide.check}**합니다. 급수·온수·난방·배수·방수·외부 유입은 증상이 비슷할 수 있어 한 가지 반응만으로 공사 범위를 정하지 않습니다. 계량기, 압력, 수분 분포와 사용 조건을 서로 비교해 원인 가능성을 좁힙니다.\n\n[[AUTO_IMAGE_1]]\n\n## 지금 바로 할 수 있는 확인\n\n1. 모든 수전과 물 사용 기기를 잠시 멈춥니다.\n2. 계량기 또는 보일러 압력계 변화를 사진으로 남깁니다.\n3. 젖은 범위와 물이 나타난 시간을 기록합니다.\n4. 아래층 피해가 있다면 천장 전체와 가까운 사진을 함께 확보합니다.\n\n물을 억지로 더 사용해 증상을 재현하면 피해가 커질 수 있습니다. 전기 설비 주변까지 젖었다면 해당 공간 사용을 멈추고 먼저 안전을 확보해 주세요.\n\n[[AUTO_IMAGE_2]]\n\n## 확인 뒤 보수 범위를 결정합니다\n\n원인이 확인되면 **${guide.repair}**하는 방향을 설명드립니다. 점검 결과와 건물 구조, 마감재 상태에 따라 작업 범위는 달라질 수 있습니다. 원인을 찾기 전에 넓게 철거하거나 같은 증상만 보고 공사를 확정하지 않습니다.\n\n[[AUTO_IMAGE_3]]\n\n## 상담할 때 보내주시면 좋은 사진\n\n- 물자국이나 젖은 부위 전체가 보이는 사진\n- 가장 심한 부분을 가까이 찍은 사진\n- 계량기 또는 보일러 압력계 사진\n- 아래층 피해가 있다면 위·아래층 위치를 비교할 수 있는 사진\n\n사진과 함께 ${place}, 건물 형태, 처음 발견한 시점, 물 사용과의 관계를 알려주시면 현장 도착 전 점검 방향을 안내하기 쉽습니다. **서울·경기·인천 전 지역 출장 상담**이 가능하며 전화 **010-5700-4026** 또는 카카오 상담을 이용할 수 있습니다.\n\n## 자주 묻는 질문\n\n### ${guide.leak}이면 바로 공사를 해야 하나요?\n\n증상만으로 공사를 결정하지 않습니다. 먼저 원인 계통과 위치를 확인하고 필요한 보수 범위를 설명받는 것이 좋습니다.\n\n### 누수보험 서류도 준비할 수 있나요?\n\n보험 적용 여부는 계약마다 다릅니다. 가입 보험사에 보장 항목을 먼저 확인한 뒤, 현장 사진과 작업 내역 등 실제 진행 내용에 맞는 자료를 준비하세요.`;
}
