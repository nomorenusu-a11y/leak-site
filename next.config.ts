import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 호스트는 명시적 allowlist로만 허용.
    remotePatterns: [
      // 모든 Supabase Storage public 객체 URL
      { protocol: "https", hostname: "*.supabase.co" },
      // (P0-01: 외부 placehold.co 의존성 제거. 자체 SVG placeholder는 public/placeholder-post.svg)
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
