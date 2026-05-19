/**
 * 연락처 정규화 + null fallback.
 *
 * 핵심: 잘못된 값일 때 절대 `href="#"` 같은 무효 링크를 만들지 않는다.
 * 검증 실패면 null을 반환하고, UI는 그 자체로 버튼을 미렌더한다.
 *
 * Phone 정규화는 E.164 표준 (`tel:+82...`) 준수.
 */

export type PhoneInfo = {
  /** 숫자만 (예: 01012345678) */
  raw: string;
  /** tel: URI (E.164, 예: +821012345678) */
  tel: string;
  /** 사용자에게 보일 형식 (예: 010-1234-5678) */
  display: string;
};

export type KakaoInfo = {
  url: string;
};

export type ContactInfo = {
  phone: PhoneInfo | null;
  kakao: KakaoInfo | null;
};

/**
 * 한국 모바일 번호를 정규화. 형식 무관하게 숫자만 추출 후 검증.
 *
 * 허용 패턴: 010/011/016/017/018/019 + 7~8자리.
 * - 입력: "010-1234-5678", "010 1234 5678", "01012345678" 모두 OK
 * - 잘못된 형식(빈 값/외국 번호/일반 전화) → null
 *
 * E.164 변환: 앞 `0` 제거 후 `+82` prefix → `+821012345678`
 */
export function normalizePhone(raw: string | null | undefined): PhoneInfo | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (!/^01[016-9]\d{7,8}$/.test(digits)) return null;
  const tel = `+82${digits.slice(1)}`;
  const display =
    digits.length === 10
      ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
      : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return { raw: digits, tel, display };
}

/**
 * 카카오 채널 URL 검증. 빈 값·`#`·잘못된 URL은 null.
 * https://pf.kakao.com/_xxx 만 허용 (다른 외부 도메인 거부).
 */
export function normalizeKakao(raw: string | null | undefined): KakaoInfo | null {
  if (!raw || raw === "#") return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:") return null;
    if (!/^pf\.kakao\.com$/i.test(u.host)) return null;
    return { url: u.toString() };
  } catch {
    return null;
  }
}

/**
 * 환경변수 → 정규화된 연락처 묶음.
 * 신/구 KAKAO 변수명 모두 fallback (`NEXT_PUBLIC_KAKAO_CHANNEL_URL` 우선, 옛 `NEXT_PUBLIC_KAKAO_CHANNEL`도 인식).
 */
export function getContactInfo(): ContactInfo {
  const phoneRaw = process.env.NEXT_PUBLIC_PHONE;
  const kakaoRaw =
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? process.env.NEXT_PUBLIC_KAKAO_CHANNEL;
  return {
    phone: normalizePhone(phoneRaw),
    kakao: normalizeKakao(kakaoRaw),
  };
}
