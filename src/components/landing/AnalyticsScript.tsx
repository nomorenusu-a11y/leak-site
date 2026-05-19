"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureUtmFromUrl } from "@/lib/utm";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * GA4 스크립트 로딩 — `/admin/*`에서는 렌더 안 함 (관리자 트래픽 분리).
 * 동시에 URL의 utm_*을 sessionStorage에 저장.
 */
export function AnalyticsScript() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    captureUtmFromUrl();
  }, [pathname]);

  if (!GA_ID) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: true });`}
      </Script>
    </>
  );
}
