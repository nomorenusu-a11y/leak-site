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

/** 카카오톡 공식 스타일 — 노란 라운드 사각 배경 + 갈색 말풍선 실루엣. */
export function KakaoLogo({ className = "", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...rest}
    >
      <rect width="24" height="24" rx="6" fill="#FEE500" />
      <path
        d="M12 4.8c-4.14 0-7.5 2.73-7.5 6.1 0 2.17 1.44 4.07 3.6 5.15l-.9 3.3c-.08.28.22.5.45.33l3.43-2.27c.28.03.6.04.92.04 4.14 0 7.5-2.73 7.5-6.1S16.14 4.8 12 4.8z"
        fill="#3C1E1E"
      />
    </svg>
  );
}
