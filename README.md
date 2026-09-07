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
| `NEXT_PUBLIC_PHONE` | 전화 CTA (`tel:` 링크, E.164 자동 변환) | 권장 | 형식 무관, 예: `01012345678` / `010-1234-5678` — 잘못된 형식이면 버튼 미렌더 |
| `NEXT_PUBLIC_KAKAO_CHANNEL_URL` | 카카오 채널 URL (옛 `NEXT_PUBLIC_KAKAO_CHANNEL`도 fallback 인식) | 권장 | `https://pf.kakao.com/_xxx` |
| `NEXT_PUBLIC_SERVICE_AREA` | 운영 가능 지역 카피 (Hero·Footer·TrustPoints) | 선택 | 기본 `"서울·경기 일부 지역"` |
| `NEXT_PUBLIC_RESPONSE_TIME` | 평균 출동 시간 카피 (Hero·StatsBar) | 선택 | 기본 `"30분 이내"` |
| `NEXT_PUBLIC_EXPERIENCE` | 경력 카피 (TrustPoints 4번째 카드) | 선택 | 기본 `"오랜 경력의"` — 운영자 받으면 `"20년 경력의"` 등 |
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

## Vercel 배포

### 1. 프로젝트 연결

1. [vercel.com](https://vercel.com) → GitHub로 가입
2. New Project → 이 GitHub repo(`leak-site`) Import
3. Framework Preset은 자동으로 **Next.js** 감지. Build Command·Output 기본값 그대로
4. 첫 배포 직전 `Environment Variables` 섹션에서 아래 값들 등록 후 Deploy

### 2. 환경변수 (Vercel Dashboard → Project Settings → Environment Variables)

| 변수 | 등록 환경 | dev/prod 분리 | 비고 |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production / Preview / Development | 분리 | prod는 본 도메인, preview는 `vercel.app` URL |
| `NEXT_PUBLIC_SITE_NAME` | All | 동일 가능 | 상호명 |
| `NEXT_PUBLIC_PHONE` | All | 동일 | tel 링크 숫자만 |
| `NEXT_PUBLIC_KAKAO_CHANNEL` | All | 동일 | pf.kakao.com URL |
| `NEXT_PUBLIC_SUPABASE_URL` | All | 동일 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | 동일 | anon public 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | All | 동일 | **Sensitive** 체크 (Vercel UI) |
| `ADMIN_PASSWORD` | Production | **반드시 분리** | dev/local 값 절대 금지. 새로 생성 |
| `SESSION_SECRET` | Production | **반드시 분리** | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NEXT_PUBLIC_GA_ID` | Production | 보통 prod만 | G-XXXXXXXXXX |
| `GOOGLE_SITE_VERIFICATION` | Production | prod만 | Google Search Console |
| `NAVER_SITE_VERIFICATION` | Production | prod만 | Naver Webmaster Tools |

> Vercel UI에서 `Sensitive` 토글: `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`는 반드시 켜두기. 한 번 저장 후에는 값이 마스킹돼 다시 볼 수 없음.

### 3. 도메인 연결 (가비아 등 외부 도메인)

1. Vercel Dashboard → Domains → Add → 도메인 입력
2. Vercel이 안내하는 DNS 레코드를 도메인 등록기관(가비아/후이즈 등)에 등록:
   - **루트 도메인** (`example.com`): `A` 레코드 → Vercel이 제공하는 IP
   - **www 서브도메인** (`www.example.com`): `CNAME` → `cname.vercel-dns.com`
3. DNS 전파(보통 수 분~수 시간) 후 Vercel이 자동으로 SSL(Let's Encrypt) 발급
4. `NEXT_PUBLIC_SITE_URL`을 새 도메인으로 교체 후 **재배포 트리거** (Vercel Dashboard → Deployments → Redeploy)

### 4. 첫 배포 후 체크리스트

- [ ] 도메인 접속 → 홈 정상 노출
- [ ] `?city=Gangnam` 진입 → 헤드라인이 "강남 누수 전문"으로 변경
- [ ] 견적 폼 제출 → Supabase Table Editor에서 행 생성 확인
- [ ] `/admin/login` → 새 prod 비번으로 로그인 → 대시보드
- [ ] 게시판에서 글 1건 작성·발행 → `/posts/{slug}` 접속 확인
- [ ] `/sitemap.xml` 도메인 반영 (모든 URL이 `https://본도메인/...`)
- [ ] `/robots.txt`에 sitemap URL 정확히 표시
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)에서 모바일 LCP < 3s, CLS < 0.1
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results)에서 LocalBusiness/Article/FAQ 모두 감지

### 5. Google·Naver 검색 등록

- **Google Search Console**: 속성 추가 → 도메인 또는 URL prefix → HTML 메타 태그 방법 → `GOOGLE_SITE_VERIFICATION` 등록
- **Naver Webmaster Tools (서치어드바이저)**: 사이트 추가 → 메타 태그 → `NAVER_SITE_VERIFICATION` 등록
- 두 곳 모두 `https://본도메인/sitemap.xml` 제출

> 검증 메타 태그는 `NEXT_PUBLIC_*_VERIFICATION` 이름도 fallback으로 동작합니다.

---

## 클라이언트 운영 매뉴얼

비전문가용 사용 안내는 별도 파일에 있습니다: [`docs/CLIENT_MANUAL.md`](./docs/CLIENT_MANUAL.md)

## 도봉구 SEO 파일럿

서울 허브와 도봉구·4개 법정동만 구현한 SEO 확장이다. 기존 `/posts` URL은 유지한다.

- [데이터 모델·운영 적용 순서·개인정보 전환 계획](docs/seo/ROLLOUT.md)
- [로컬 검증 결과와 운영 적용 전 확인사항](docs/seo/VERIFICATION.md)
- `npm test`: 운영 연결 없이 지역·분류·PostgreSQL RLS 테스트

운영 DB 적용/배포와 서울 전체 확대는 자동 수행하지 않는다.
