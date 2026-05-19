import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 외부 이미지 호스트는 명시적 allowlist로만 허용.
    remotePatterns: [
      // 시드·플레이스홀더 이미지
      { protocol: "https", hostname: "placehold.co" },
      // 모든 Supabase Storage public 객체 URL
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
