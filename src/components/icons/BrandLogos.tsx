/**
 * 외부 서비스 브랜드 로고 — 모바일 하단 바·푸터 등에서 사용.
 *
 * 공식 브랜드 컬러 + 단순화된 워드마크 형태.
 * 정확한 워드마크 SVG가 필요하면 각 서비스의 브랜드 가이드를 따로 추가.
 */

type IconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

/** 네이버 그린(#03C75A) 박스 + 흰색 N. 네이버 블로그 진입점 시각 식별용. */
export function NaverLogo({ className = "", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <rect width="24" height="24" rx="4" fill="#03C75A" />
      <path
        d="M7.5 6.5h2.6L14 12.3V6.5h2.5v11h-2.6L9.9 11.7v5.8H7.5v-11z"
        fill="#fff"
      />
    </svg>
  );
}

/** 카카오 옐로우(#FEE500) 말풍선 + 검정 표정. 카카오톡 상담 진입점 시각 식별용. */
export function KakaoLogo({ className = "", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <path
        d="M12 3.5C6.85 3.5 2.5 6.7 2.5 10.7c0 2.55 1.7 4.8 4.3 6.1l-.95 3.45c-.1.35.27.62.57.4l4.1-2.7c.5.05.97.05 1.48.05 5.15 0 9.5-3.2 9.5-7.3S17.15 3.5 12 3.5z"
        fill="#FEE500"
      />
      <circle cx="8.6" cy="11" r="1" fill="#3C1E1E" />
      <circle cx="15.4" cy="11" r="1" fill="#3C1E1E" />
      <path
        d="M9 13.5c.7.7 1.8 1.1 3 1.1s2.3-.4 3-1.1"
        stroke="#3C1E1E"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
