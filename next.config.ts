import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 관리자 사진 업로드의 개별 파일 제한은 5MB다. Server Action 기본 본문 한도(1MB)를
  // 그대로 두면 사진을 선택한 자동 초안 저장이 중간에 끊긴다.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // 공개 화면의 최대 콘텐츠 폭은 1600px 이하다. 기본 3840px 후보를 만들지 않아
    // 크롤러와 브라우저가 불필요하게 큰 이미지를 선택하는 일을 막는다.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    // 외부 이미지 호스트는 명시적 allowlist로만 허용.
    remotePatterns: [
      // 모든 Supabase Storage public 객체 URL
      { protocol: "https", hostname: "*.supabase.co" },
      // 무료 스톡 이미지 — 보유 장비·후기 등 자체 자산 없는 섹션용
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  compiler: {
    // production 빌드에서만 console.log/info/debug 등 제거. console.error/warn은 유지.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
