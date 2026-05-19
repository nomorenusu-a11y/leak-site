# leak-site

누수 탐지·시공 업체용 풀스택 사이트. **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase**.

## 빠른 시작

```bash
npm install
cp .env.example .env.local
# 1) Supabase 키 채우기 (아래 "Supabase 연결" 참고)
# 2) 관리자 dev 키 자동 생성:
npx tsx scripts/seed-admin-env.ts
npm run dev                  # http://localhost:3000
```

## 스크립트

- `npm run dev` — 로컬 개발 (Turbopack 기본)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 빌드 산출물 서빙
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` / `npm run format:check` — Prettier

---

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

> 모든 statement는 idempotent하게 작성돼 다시 실행해도 안전합니다.

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

---

## 관리자 페이지

### 접근

- URL: **`/admin/login`**
- 비밀번호: `.env.local`의 `ADMIN_PASSWORD` 값
- 세션 유효기간: **7일** (HMAC 서명 쿠키, `httpOnly + sameSite=lax + secure(prod)`)
- 로그인 실패 rate limit: **5분 동안 5회 시도 시 일시 차단** (IP 기반 메모리)
- 로그아웃: 사이드바 "로그아웃" 또는 `/admin/logout` 직접 호출

### 운영 시나리오

| 상황 | 조작 |
|---|---|
| 새 견적이 들어왔을 때 | `/admin/requests` → 행 클릭으로 상세 → 상태 변경(접수/견적발송중/작업중/작업완료) → 관리자 메모 자동 저장 |
| 공개 보드에서 특정 신청 숨기기 | 견적 상세에서 **"공개 보드 노출"** 토글 OFF — 홈 실시간 보드에서 즉시 사라짐 |
| 손님에게 바로 연락 | 견적 상세의 **빠른 액션** 영역에서 📞전화 또는 💬카톡 채널 |
| 시공 사례 글 작성 | `/admin/posts/new` → 제목·슬러그(자동) → 카테고리·지역 태그 → Markdown 본문(좌우 분할 미리보기) → 대표 이미지 → 발행 |
| 글 수정·이미지 추가 | `/admin/posts/{id}/edit` — 추가 이미지(post_images)는 편집 화면에서 첨부 |
| 글 삭제 | 목록의 "삭제" — `posts` row + `post_images` (FK CASCADE) + Storage 파일 전부 정리 |

---

## ⚠️ Production 배포 전 필수 작업

다음 두 환경변수는 **반드시 새 값으로 교체**:

| 변수 | 이유 | 새 값 발급 방법 |
|---|---|---|
| `ADMIN_PASSWORD` | dev에서 사용한 임시값은 채팅·터미널 로그에 노출됐을 수 있음 | 최소 16자, 영문 대소문자 + 숫자 + 특수문자 권장 |
| `SESSION_SECRET` | HMAC 서명 키 누출 시 세션 위조 가능 | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

- Vercel 배포 시 Project Settings → Environment Variables에 위 값들을 새로 등록
- `.env.local`은 **로컬 전용**, 절대 git에 커밋되지 않음 (`.gitignore` 등재)
- production에서 `secure` 쿠키 자동 활성화 (HTTPS만 전송)
- `NODE_ENV=production`이면 `robots.txt`가 색인 허용, 그 외 환경은 색인 차단

---

## 환경변수 전체 목록

`.env.local`에 작성. `.env.example`이 템플릿.

| 변수 | 용도 | 필수/선택 | 발급/예시 |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 사이트 절대 URL (sitemap·canonical·OG) | 필수 | `https://leak-site.com` |
| `NEXT_PUBLIC_SITE_NAME` | 상호명 (Hero·Footer·메타) | 필수 | `"누수 시공"` |
| `NEXT_PUBLIC_PHONE` | 전화 CTA (`tel:` 링크) | 권장 | 숫자만, 예: `01012345678` |
| `NEXT_PUBLIC_KAKAO_CHANNEL` | 카카오 채널 URL | 권장 | `https://pf.kakao.com/_xxx` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 필수 | Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 read·realtime용 anon 키 | 필수 | Project Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 admin 키 (RLS 우회) | 필수 | Project Settings > API > service_role (Reveal) |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI / Management API용 PAT | CLI 사용 시 | Account > Access Tokens > Generate (sbp_…) |
| `ADMIN_PASSWORD` | `/admin` 단일 비밀번호 | 어드민 사용 시 | dev: `npx tsx scripts/seed-admin-env.ts` / prod: 강한 비번 직접 |
| `SESSION_SECRET` | HMAC 서명 시크릿 (32자+) | 어드민 사용 시 | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 측정 ID | 선택 | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_NAVER_VERIFICATION` | 네이버 서치어드바이저 검증 코드 | 선택 | Naver Webmaster Tools 발급 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | 구글 서치콘솔 검증 코드 | 선택 | Google Search Console 발급 |

---

## 디렉토리 구조

```
src/
  app/
    actions/              공개 Server Actions (submit-quote)
    admin/                관리자 영역 (proxy로 인증 보호)
      login/, logout/
      requests/, posts/   CRUD 페이지 + actions
    posts/                공개 시공 사례 (SSG + ISR)
      [slug]/             글 상세
      region/[region]/    지역별 목록
    layout.tsx, page.tsx
    robots.ts, sitemap.ts
  components/
    admin/                AdminShell · PostForm · MarkdownEditor · 등
    landing/              Header · Hero · LiveBoard · QuoteForm · 등
    posts/                PostCard · PostBody(react-markdown + sanitize) · 등
    ui/                   StatusBadge · Pagination · RelativeTime · Container
  lib/
    auth.ts               HMAC 세션 (Web Crypto, edge 호환)
    rate-limit.ts         메모리 Map (production: KV/Upstash 권장)
    env.ts                zod 기반 환경 변수 검증
    city.ts               도시 코드 ↔ 라벨/슬러그/region_tag 매핑
    posts.ts              공개 read 쿼리 헬퍼
    time.ts, markdown.ts, seo/
    supabase/             client(브라우저) / server(SSR) / anon(SSG) / admin(service_role)
  types/
    database.ts           DB 테이블 타입 + Database 제네릭
  proxy.ts                Next.js 16 proxy(=구 middleware). /admin/* 인증 보호.
supabase/
  migrations/             SQL (Dashboard SQL Editor에 복붙해 실행)
```

---

## 추적·SEO

- **광고 LP**: `?city=Gangnam` 같은 URL 파라미터로 헤드라인·title·메타 동적 변경 (`src/lib/city.ts` 허용 목록만)
- **UTM**: `utm_source`, `utm_campaign`은 폼 제출 시 `leak_requests` 행에 함께 저장
- **GA4**: `NEXT_PUBLIC_GA_ID` 설정 시 자동 로드, 폼 제출 시 `submit_quote` 이벤트
- **Schema.org**: 홈에 `LocalBusiness`, 글 상세에 `Article`, 지역 목록에 `CollectionPage` JSON-LD
- **sitemap.xml**: 글·지역 페이지 자동 포함 (글 추가 시 다음 빌드에 반영)

---

## 배포

Vercel 권장. 환경 변수를 Vercel Project Settings에 동일하게 넣고 push. **Production 배포 전 필수 작업** 섹션 반드시 확인.
