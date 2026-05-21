import { Clock, MapPin, ShieldCheck, Wallet } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import type { LucideIcon } from "lucide-react";

/**
 * LiveBoard 상단의 한 줄 운영 정보 배지.
 *
 * 무한 스크롤 보드가 메인 시각 요소라, 이 영역은 차분한 텍스트 라인으로 축소.
 * 4개 항목 · 구분점 `·` · 모바일에서 자연 wrap.
 */
function Item({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <Icon aria-hidden className="size-4 text-brand-600" strokeWidth={2} />
      <span>{text}</span>
    </span>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-slate-300">
      ·
    </span>
  );
}

export function StatsBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm font-medium">
      <Item Icon={Clock} text={BUSINESS.responseTime} />
      <Dot />
      <Item Icon={MapPin} text={BUSINESS.serviceArea} />
      <Dot />
      <Item Icon={ShieldCheck} text={BUSINESS.warranty} />
      <Dot />
      <Item Icon={Wallet} text={BUSINESS.pricing} />
    </div>
  );
}
