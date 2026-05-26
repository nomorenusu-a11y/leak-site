import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/business";
import { getEquipment } from "@/lib/site-content";

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

const EQUIPMENT_ICONS: React.ReactNode[] = [
  <EquipmentIcon key="0"><circle cx="6" cy="14" r="2.5" /><circle cx="18" cy="14" r="2.5" /><path d="M6 11.5V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4.5" /><path d="M12 16.5v3" /><circle cx="12" cy="20.5" r="1.3" /></EquipmentIcon>,
  <EquipmentIcon key="1"><path d="M5 6h12l2 4v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6z" /><path d="M9 11h6" /><path d="M9 14h4" /><circle cx="17" cy="15" r="1.3" /></EquipmentIcon>,
  <EquipmentIcon key="2"><rect x="3" y="5" width="18" height="13" rx="2" /><circle cx="12" cy="11.5" r="3.5" /><path d="M9 11.5h6" /><path d="M12 8.5v6" /><path d="M7 5V3h3" /></EquipmentIcon>,
  <EquipmentIcon key="3"><path d="M3 18c0-3 2-4 4-4h3" /><path d="M10 14c2 0 4-1 5-3l4-4" /><rect x="17" y="3" width="4" height="4" rx="0.5" /><circle cx="6" cy="18" r="2" /></EquipmentIcon>,
  <EquipmentIcon key="4"><rect x="4" y="9" width="9" height="9" rx="1" /><path d="M13 12h2l3-3" /><path d="M18 9l3 3" /><path d="M4 18h9" /><circle cx="7" cy="20" r="1" /><circle cx="11" cy="20" r="1" /></EquipmentIcon>,
  <EquipmentIcon key="5"><rect x="6" y="4" width="12" height="14" rx="2" /><path d="M9 9h6" /><path d="M9 12h6" /><path d="M9 15h4" /><path d="M10 18v2h4v-2" /></EquipmentIcon>,
  <EquipmentIcon key="6"><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /><path d="M5 21l2-3" /><path d="M19 21l-2-3" /></EquipmentIcon>,
  <EquipmentIcon key="7"><path d="M12 3c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z" /><path d="M12 17a2 2 0 0 1-2-2" /></EquipmentIcon>,
];

export async function EquipmentSection() {
  const equipment = await getEquipment();

  return (
    <section id="equipment" className="scroll-mt-20 bg-white py-8 md:py-12">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">EQUIPMENT</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {BUSINESS.name}의 장비 현황
          </h2>
          <p className="mt-3 text-slate-600">
            정확한 탐지와 깔끔한 공사를 위한 최신 장비를 보유하고 있습니다.
          </p>
        </Reveal>

        <RevealGroup stagger={0.08} className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {equipment.map((e, i) => (
            <RevealItem key={e.name} variant="scale">
              <article className="flex h-full flex-col items-center text-center">
                <div className="flex size-28 items-center justify-center rounded-full border-4 border-brand-400 bg-brand-50 sm:size-32">
                  {EQUIPMENT_ICONS[i % EQUIPMENT_ICONS.length]}
                </div>
                <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{e.name}</h3>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">{e.caption}</p>
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
