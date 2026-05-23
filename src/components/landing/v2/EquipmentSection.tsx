import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/business";

type Equipment = {
  name: string;
  caption: string;
  /** SVG path inside 24x24 viewBox — 단색 stroke 아이콘 */
  icon: React.ReactNode;
};

/**
 * 최신 장비 일러스트 — lucide 스타일 단색 SVG.
 * 무료 스톡 사진 라이선스 의존성을 피하기 위해 SVG 아이콘으로 일러스트.
 */
function EquipmentIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-12 text-brand-600"
    >
      {children}
    </svg>
  );
}

const EQUIPMENT: Equipment[] = [
  {
    name: "청음기",
    caption: "벽·바닥 속 누수 소리 정밀 청취",
    icon: (
      <EquipmentIcon>
        <circle cx="6" cy="14" r="2.5" />
        <circle cx="18" cy="14" r="2.5" />
        <path d="M6 11.5V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4.5" />
        <path d="M12 16.5v3" />
        <circle cx="12" cy="20.5" r="1.3" />
      </EquipmentIcon>
    ),
  },
  {
    name: "가스탐지기",
    caption: "도시가스·LPG 누설 위치 탐지",
    icon: (
      <EquipmentIcon>
        <path d="M5 6h12l2 4v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6z" />
        <path d="M9 11h6" />
        <path d="M9 14h4" />
        <circle cx="17" cy="15" r="1.3" />
      </EquipmentIcon>
    ),
  },
  {
    name: "열화상 카메라",
    caption: "온도차로 배관·누수 위치 시각화",
    icon: (
      <EquipmentIcon>
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <circle cx="12" cy="11.5" r="3.5" />
        <path d="M9 11.5h6" />
        <path d="M12 8.5v6" />
        <path d="M7 5V3h3" />
      </EquipmentIcon>
    ),
  },
  {
    name: "배관 내시경",
    caption: "관 내부 직접 영상 검사 (소형 카메라)",
    icon: (
      <EquipmentIcon>
        <path d="M3 18c0-3 2-4 4-4h3" />
        <path d="M10 14c2 0 4-1 5-3l4-4" />
        <rect x="17" y="3" width="4" height="4" rx="0.5" />
        <circle cx="6" cy="18" r="2" />
      </EquipmentIcon>
    ),
  },
  {
    name: "고압세척기",
    caption: "하수구·배수관 막힘 강력 분사 해소",
    icon: (
      <EquipmentIcon>
        <rect x="4" y="9" width="9" height="9" rx="1" />
        <path d="M13 12h2l3-3" />
        <path d="M18 9l3 3" />
        <path d="M4 18h9" />
        <circle cx="7" cy="20" r="1" />
        <circle cx="11" cy="20" r="1" />
      </EquipmentIcon>
    ),
  },
  {
    name: "배관 세척기",
    caption: "난방배관 슬러지·이물질 순환 청소",
    icon: (
      <EquipmentIcon>
        <rect x="6" y="4" width="12" height="14" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 12h6" />
        <path d="M9 15h4" />
        <path d="M10 18v2h4v-2" />
      </EquipmentIcon>
    ),
  },
  {
    name: "수압 측정기",
    caption: "급수 압력 정밀 측정 및 진단",
    icon: (
      <EquipmentIcon>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
        <path d="M5 21l2-3" />
        <path d="M19 21l-2-3" />
      </EquipmentIcon>
    ),
  },
  {
    name: "수분 침투 감지기",
    caption: "벽체·바닥 내부 수분 함수율 측정",
    icon: (
      <EquipmentIcon>
        <path d="M12 3c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z" />
        <path d="M12 17a2 2 0 0 1-2-2" />
      </EquipmentIcon>
    ),
  },
];

/**
 * 보유 장비 섹션 — "EQUIPMENT" 톤 (장인배관 참고).
 *
 * 원형 프레임 + 단색 SVG 일러스트 + 장비 이름 + 한 줄 설명.
 * 4열(lg) → 2열(sm) → 1열(모바일).
 */
export function EquipmentSection() {
  return (
    <section
      id="equipment"
      className="scroll-mt-20 bg-white py-16 md:py-24"
    >
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">
            EQUIPMENT
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {BUSINESS.name}의 장비 현황
          </h2>
          <p className="mt-3 text-slate-600">
            정확한 탐지와 깔끔한 공사를 위한 최신 장비를 보유하고 있습니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.08}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {EQUIPMENT.map((e) => (
            <RevealItem key={e.name} variant="scale">
              <article className="flex h-full flex-col items-center text-center">
                <div className="flex size-28 items-center justify-center rounded-full border-4 border-brand-400 bg-brand-50 sm:size-32">
                  {e.icon}
                </div>
                <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">
                  {e.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  {e.caption}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-10 text-center text-xs text-slate-500">
          * 장비 라인업은 운영 상황에 따라 일부 변동될 수 있습니다.
        </p>
      </Container>
    </section>
  );
}
