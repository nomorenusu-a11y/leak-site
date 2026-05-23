/**
 * 사이트 전반에서 사용하는 영업 정보 상수.
 *
 * - env가 비어 있으면 안전한 기본값 fallback (사이트 빌드 깨지지 않음)
 * - 모든 영업 카피는 여기서 가져옴. 컴포넌트에 하드코딩 금지.
 * - service_role 의존 0 (퍼블릭 데이터)
 */

import { getContactInfo } from "./contact";
import { siteConfig } from "./env";

const SERVICE_AREA = process.env.NEXT_PUBLIC_SERVICE_AREA?.trim() || "서울·경기 일부 지역";
const RESPONSE_TIME = process.env.NEXT_PUBLIC_RESPONSE_TIME?.trim() || "30분 이내";
const EXPERIENCE = process.env.NEXT_PUBLIC_EXPERIENCE?.trim() || "오랜 경력의";

// 사업자 정보 (Footer + privacy/terms). 빈 값이면 해당 줄 미렌더.
const LEGAL_NAME = process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME?.trim() || undefined;
const OWNER = process.env.NEXT_PUBLIC_BUSINESS_OWNER?.trim() || undefined;
const REG_NO = process.env.NEXT_PUBLIC_BUSINESS_REG_NO?.trim() || undefined;
const ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim() || undefined;
const BIZ_TYPE = process.env.NEXT_PUBLIC_BUSINESS_BIZ_TYPE?.trim() || undefined;
const BIZ_CATEGORY = process.env.NEXT_PUBLIC_BUSINESS_BIZ_CATEGORY?.trim() || undefined;
const EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim() || undefined;

export const BUSINESS = {
  name: siteConfig.name,
  url: siteConfig.url,

  /** 정규화된 연락처 (phone·kakao 둘 다 null일 수 있음 → UI는 그때 fallback) */
  contact: getContactInfo(),

  /** "서울·경기 일부 지역" 같은 운영 가능 지역 표기 */
  serviceArea: SERVICE_AREA,

  /** "30분 이내" 같은 출동·응답 시간 카피. "24분" 같은 cnsolution 우연 일치 금지 */
  responseTime: RESPONSE_TIME,

  /** "오랜 경력의" 같은 경력 카피. 운영자 정보 받으면 "20년 경력의" 등으로 교체 */
  experience: EXPERIENCE,

  /** 고정 메시지 — 운영 정책 변경 시 여기만 수정 */
  warranty: "1년 무상 A/S",
  pricing: "가격 정찰제",

  /** 네이버 블로그 — 모바일 하단 바 및 푸터에서 사용 */
  blogUrl: "https://blog.naver.com/leakzero",

  /** 카카오톡 오픈채팅 — 모바일 하단 바 및 데스크탑 플로팅에서 사용 */
  kakaoChatUrl: "https://open.kakao.com/o/s6CAOcwi",

  /** 사업자 정보 (Phase 3에서 privacy/terms 페이지에서도 사용). 빈 값이면 표기 영역 자체 미렌더. */
  legalName: LEGAL_NAME,
  ownerName: OWNER,
  businessRegNo: REG_NO,
  address: ADDRESS,
  bizType: BIZ_TYPE,
  bizCategory: BIZ_CATEGORY,
  email: EMAIL,
} as const;
