# 노모어누수 홈페이지 운영 안전수칙

이 문서는 `nomorenusu.com`의 검색 노출과 운영 장애를 막기 위한 고정 규칙입니다.

## 현재 정상 구성

- 운영 주소: `https://nomorenusu.com`
- 운영 서버: Cloudflare Workers
- 데이터베이스와 게시글: Supabase
- 검색 수집 주소: `https://nomorenusu.com/sitemap.xml`
- ISR 캐시: Cloudflare KV `nomorenusu-vinext-cache`
- Vercel 주소는 과거 주소이며 운영에 다시 연결하지 않습니다.

## 절대로 지켜야 하는 규칙

1. 가비아 DNS를 Vercel IP나 `cname.vercel-dns.com`으로 돌리지 않습니다.
2. `cloudflare.config.ts`의 두 도메인과 `VINEXT_KV_CACHE`를 삭제하지 않습니다.
3. `vite.config.ts`의 `kvDataAdapter()`를 삭제하지 않습니다.
4. 새 글과 수정 글은 제목·본문·canonical·대표 이미지 모두 `노모어누수`와 `nomorenusu.com`을 사용합니다.
5. `유레카`, `최태환`, `leak-site.vercel.app`은 공개 페이지에 다시 넣지 않습니다.
6. 미래 예약 글 주소는 발행 시각 전에 직접 열지 않습니다. 관리자 캘린더와 사이트맵 미포함 상태로만 확인합니다.
7. 홈페이지가 열리지 않을 때 글 발행이나 SEO 수정을 계속하지 않습니다. 사이트 복구가 먼저입니다.
8. 검색 순위는 배포 직후 단정하지 않습니다. 네이버 서치어드바이저의 노출·클릭·검색어로 확인합니다.

## 배포 순서

아래 네 단계 중 하나라도 실패하면 배포를 중단합니다.

```bash
npm test
npm run build:vinext
npm run deploy:vinext
npm run verify:production
```

정상 완료 기준:

- 홈페이지 HTTP 200
- `robots.txt` HTTP 200이며 전체 차단 없음
- `sitemap.xml` HTTP 200이며 최소 300개 URL 유지
- 핵심 게시글 HTTP 200
- 검색 제목·설명·canonical이 `nomorenusu.com` 기준
- 대표 이미지 HTTP 200, 이미지 형식 정상
- 공개 HTML에 `유레카`, `최태환`, `leak-site.vercel.app`, `noindex` 없음

## 장애가 발생했을 때

1. 글 발행과 SEO 작업을 멈춥니다.
2. `npm run verify:production`으로 실패 지점을 확인합니다.
3. Cloudflare 대시보드의 Workers 배포 기록에서 마지막 정상 버전으로 롤백합니다.
4. 홈페이지·robots·사이트맵·게시글·대표 이미지를 다시 검사합니다.
5. 사이트가 정상화된 뒤에만 수집 요청과 글 발행을 재개합니다.

## 검색 노출 판단 기준

검색 노출 개선 여부는 다음 네 가지로 판단합니다.

1. 네이버 수집 및 색인 페이지 수
2. 검색어별 노출 수
3. 검색어별 클릭 수와 클릭률
4. 홈페이지에서 전화·카카오 버튼이 실제로 눌린 횟수

글 개수만 늘어나는 것은 성공 기준이 아닙니다. 노출이 생기는 검색어와 페이지를 먼저 강화합니다.
