import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

/**
 * 관리자 영역 레이아웃.
 * 인증은 proxy(미들웨어)가 보호하므로 여기선 별도 체크 안 함.
 * 단, /admin/login은 이 레이아웃의 children이지만 AdminShell 안에 들어가면 어색하므로
 * login 페이지는 자체 레이아웃을 가지도록 별도 처리할 수도 있다.
 * 일단 단순화: 로그인 페이지에서도 shell이 노출되어도 큰 문제 없음 (네비는 무용해도 OK).
 * 더 깔끔하게 가려면 (admin)/login 라우트 그룹으로 분리.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
