import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;
