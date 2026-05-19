# leak-site

누수 탐지·시공 업체용 풀스택 사이트. **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase**.

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 "Supabase 연결" 참고)
npm run dev                  # http://localhost:3000
```

## 스크립트

- `npm run dev` — 로컬 개발 (Turbopack 기본)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 빌드 산출물 서빙
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` — Prettier 적용
- `npm run format:check` — Prettier 검사

## Supabase 연결

### 1. 프로젝트 생성

[supabase.com](https://supabase.com) → New Project. **Region: Seoul (Northeast Asia)** 권장, Free 플랜으로 시작.

### 2. 환경 변수 채우기

Dashboard → **Project Settings → API** 에서 세 값 복사:

| Dashboard 위치 | `.env.local` 키 |
|---|---|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `Project API Keys → anon public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `Project API Keys → service_role` (Reveal) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ `service_role` 키는 RLS를 모두 우회합니다. 브라우저로 새지 않도록 `NEXT_PUBLIC_` 접두사 절대 금지. 이 저장소의 `src/lib/supabase/admin.ts`에서만 읽습니다.

### 3. 마이그레이션 실행

Dashboard → **SQL Editor** → New query → `supabase/migrations/20260518000001_init.sql` 파일 전체 복붙 → **Run**.

> 모든 statement는 idempotent하게 작성돼 있어 다시 실행해도 안전합니다.

CLI 대안:
```bash
set -a; source .env.local; set +a
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

### 4. 셋업 확인

Dashboard에서 다음이 보이면 성공:

- **Table Editor**: `leak_requests`, `posts`, `post_images` 세 테이블
- **Storage**: `post-images`, `request-images` 두 버킷
- **Database → Replication**: `supabase_realtime` 퍼블리케이션에 `leak_requests` 포함

### 5. 로컬 테스트

```bash
npm run dev
```

`http://localhost:3000` 접속 후 견적 폼 제출 → SQL Editor에서 `select * from leak_requests order by created_at desc` 로 행 확인. 이미지 첨부 시 Storage의 `request-images` 버킷에 파일 생성 확인.

## 디렉토리 구조

```
src/
  app/
    actions/              Server Actions (submit-quote 등)
    layout.tsx            루트 레이아웃 (Pretendard, GA, 기본 메타)
    page.tsx              랜딩페이지 (Hero, 폼, 사례)
    robots.ts             robots.txt
    sitemap.ts            sitemap.xml
  components/
    landing/              Header, Hero, QuoteForm, Footer 등
    ui/                   Container 등 공통 프리미티브
  lib/
    env.ts                zod 기반 환경 변수 검증
    city.ts               도시 코드 → 한글 라벨 매핑 (허용 목록)
    seo/                  Metadata · Schema.org JSON-LD
    supabase/             client(브라우저) / server(SSR) / admin(service_role)
  types/
    database.ts           DB 테이블 타입 + Database 제네릭
supabase/
  migrations/             SQL 마이그레이션 (Dashboard에 복붙해 실행)
```

## 추적·SEO

- **광고 LP**: `?city=Gangnam` 같은 URL 파라미터로 헤드라인·title·메타 동적 변경 (`src/lib/city.ts` 허용 목록만)
- **UTM**: `utm_source`, `utm_campaign`은 폼 제출 시 `leak_requests` 행에 함께 저장
- **GA4**: `NEXT_PUBLIC_GA_ID` 설정 시 자동 로드, 폼 제출 시 `submit_quote` 이벤트
- **Schema.org**: 홈에 `LocalBusiness` JSON-LD 자동 삽입

## 배포

Vercel 권장. 환경 변수를 Vercel Project Settings에 동일하게 넣고 push.
