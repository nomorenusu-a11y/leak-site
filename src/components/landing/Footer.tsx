import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { MapPin } from "@/components/icons";
import { BUSINESS } from "@/lib/business";

const REGIONS = ["서울특별시", "경기도", "인천광역시"];

/**
 * 푸터 — IMG_1320 레퍼런스 (NJ 누수장인 스타일).
 *
 * 구성:
 *   1) 로고 (중앙 큰 사이즈)
 *   2) 푸터 메뉴 — | 구분
 *   3) 서비스 지역 배지 3종 (서울·경기·인천)
 *   4) 사업자 정보 한 줄
 *   5) 주소 한 줄
 *   6) 카피라이트
 *   7) 디스클레이머
 */
export function Footer() {
  const bizSegments: string[] = [];
  if (BUSINESS.legalName) bizSegments.push(BUSINESS.legalName);
  if (BUSINESS.ownerName) bizSegments.push(`대표자: ${BUSINESS.ownerName}`);
  if (BUSINESS.contact.phone) bizSegments.push(`전화: ${BUSINESS.contact.phone.display}`);
  if (BUSINESS.businessRegNo) bizSegments.push(`사업자정보: ${BUSINESS.businessRegNo}`);
  if (BUSINESS.email) bizSegments.push(`이메일: ${BUSINESS.email}`);

  const menu = [
    { href: "/#about", label: "회사소개" },
    { href: "/#services", label: "서비스안내" },
    { href: "/posts", label: "작업사례" },
    { href: "/#quote-form", label: "문의하기" },
    { href: "/privacy", label: "개인정보처리방침" },
    { href: "/terms", label: "이용약관" },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <Container className="py-12 sm:py-16">
        <div className="flex justify-center">
          <Logo size="lg" textClass="text-white" />
        </div>

        <nav
          aria-label="푸터 메뉴"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-200 sm:gap-x-6"
        >
          {menu.map((m, i) => (
            <span key={m.href} className="inline-flex items-center gap-x-3 sm:gap-x-6">
              <Link href={m.href} className="font-semibold hover:text-white">
                {m.label}
              </Link>
              {i < menu.length - 1 && (
                <span aria-hidden className="text-slate-600">
                  |
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* 서비스 지역 배지 — 신뢰감 표시 (지자체 로고는 저작권상 미사용, 자체 배지로 대체) */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Service Area
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {REGIONS.map((r) => (
              <li
                key={r}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-200 ring-1 ring-white/10 ring-inset sm:text-sm"
              >
                <MapPin aria-hidden className="text-highlight-400 size-3.5" strokeWidth={2.5} />
                {r === "서울특별시" ? (
                  <Link href="/seoul" className="hover:underline">
                    {r}
                  </Link>
                ) : (
                  r
                )}
              </li>
            ))}
          </ul>
        </div>

        {bizSegments.length > 0 && (
          <p className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:text-sm">
            {bizSegments.map((seg, i) => (
              <span key={seg} className="inline-flex items-center gap-x-3">
                <span>{seg}</span>
                {i < bizSegments.length - 1 && (
                  <span aria-hidden className="text-slate-600">
                    |
                  </span>
                )}
              </span>
            ))}
          </p>
        )}

        {BUSINESS.address && (
          <p className="mt-2 text-center text-xs text-slate-400 sm:text-sm">
            주소: {BUSINESS.address}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          COPYRIGHT © {BUSINESS.name}. ALL RIGHTS RESERVED.
        </p>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] text-slate-600">
          * 게시된 출동 시간·시공 결과는 작업환경과 상황에 따라 달라질 수 있습니다.
        </p>
      </Container>
    </footer>
  );
}
