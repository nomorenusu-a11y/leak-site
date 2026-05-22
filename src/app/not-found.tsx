import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PhoneButton, KakaoButton } from "@/components/landing/CtaButtons";

export const metadata = {
  title: "찾을 수 없음 (404)",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <>
      <Header showBack />
      <main className="flex-1">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-6xl font-extrabold text-brand-600 sm:text-7xl">404</p>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              찾으시는 페이지가 사라졌나봐요.
            </h1>
            <p className="mt-3 text-slate-600">
              주소가 변경됐거나 잘못 입력됐을 수 있어요. 홈으로 돌아가서 다시 찾아보세요.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-brand-700 sm:w-auto"
              >
                홈으로
              </Link>
              <Link
                href="/posts"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50 sm:w-auto"
              >
                시공 사례 보기
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:max-w-md sm:mx-auto">
              <PhoneButton block />
              <KakaoButton block />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
