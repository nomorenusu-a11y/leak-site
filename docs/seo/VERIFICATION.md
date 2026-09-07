# 도봉구 파일럿 검증 결과

2026-09-07. 기준 커밋 `ac2ab170f4a2bafd48840cf3afd64e0afd14874d`에서 작업. 운영 데이터·계정·Supabase·배포에 접근하지 않고 로컬 복제본에서 구현했다.

## 구현 범위

- 신규 공개 페이지 6개: 서울 허브, 도봉구, 창동, 쌍문동, 방학동, 도봉동.
- 신규 데이터: regions / region_pages / post_locations / seo_terms / post_terms.
- 분류 축 5개, 항목 31개. 위치를 더하면 지역+건물유형+누수유형+증상+탐지방법+실제작업을 표현한다.
- 기존 `/posts` URL·본문·이미지·지역 태그·저장된 category 유지. 신규 분류는 별도 관리자 화면과 트랜잭션으로 저장한다.
- 조합 페이지, 타 구 랜딩페이지, 타 법정동, 자동 사례·후기 생성 기능 없음.

## 자동 검사

| 검사 | 결과 | 증거/범위 |
| --- | --- | --- |
| npm test | 6개 테스트 통과 | PGlite PostgreSQL migration, RLS, 외래키, 원자성, 지역 계층, 31개 분류, 1,203행 분할 조회, query 파싱, Preview robots, 평점 제거 |
| npm run typecheck | 통과 | 최종 빌드 완료 후 단독 재실행 |
| npm run lint | 오류 0, 기존 경고 2 | HeroV2 `_props`, StickyBottomCTA `BUSINESS` 미사용 경고 |
| npm run build -- --webpack | 통과 | Next.js 16.2.6 프로덕션 빌드, 새 지역 경로 6개만 정적 생성 |
| node tests/http-pilot.mjs | 통과 | 6개 경로의 200, title/description/canonical/H1/breadcrumb/FAQ/CTA, 범위 밖 404, 실제 2페이지, 필터 유지, 6개 지역 sitemap |
| git diff --check | 통과 | 공백 오류 없음 |

병렬로 build와 typecheck를 실행한 중간 검사에서는 build가 `.next/types`를 재생성하는 순간 파일 누락 오류가 있었다. 빌드 완료 후 typecheck를 단독으로 다시 실행해 통과했다. 재현 명령은 병렬 실행하지 않는다.

## 브라우저 검증

agent-browser + 격리 Chromium, 데스크톱 및 390×844 모바일.

- 도봉구 → 쌍문동 이동, 동 → 도봉구 breadcrumb 확인.
- 빈 동에서 `공개 시공사례가 아직 없습니다` 표시. 다른 동 사례를 대신 채우지 않음.
- 지역별 H1 1개, 정확한 canonical, meta description 확인.
- FAQ 열림, 상담 CTA → `/?city=Dobong#quote-form` 이동. 기존 폼의 hidden city_code=Dobong 확인. 견적은 제출하지 않음.
- 모바일 가로 overflow 없음. 기존 헤더·푸터·하단 상담 메뉴 유지, 기존 홈이 렌더되고 견적 폼 접근 가능.
- 관리자 분류 경로 비로그인 접근 시 로그인으로 이동. 로컬 테스트 암호로 로그인한 뒤 입력 UI 확인.
- 실제 PostgreSQL을 사용하는 로컬 fixture API에서 사례 위치·분류 저장 성공.
- 테스트 사례를 창동→쌍문동으로 변경: 창동에서는 제외, 쌍문동에서 표시, `/posts/local-test-1`의 breadcrumb도 쌍문동으로 갱신.
- 검증 뒤 동일 UI로 창동에 복원하고 HTTP 회귀검사를 다시 통과.
- 브라우저 page errors 없음. 이미지·글은 명시적으로 `[로컬 검증용]`이라고 표시된 메모리 fixture이며 실제 시공사례가 아니다.

## 발견하여 수정한 재검증 문제

초기 `dynamicParams=false` 설정에서 revalidatePath로 캐시를 비우면 지역 페이지가 `NoFallbackError`/404를 반환했다. `force-static` + blocking ISR로 수정하고, **명시적 파일럿 resolver의 notFound 검증으로 범위 제한을 유지**했다. 수정 후 관리자 저장→DB→페이지 재생성→상세 backlink 전 과정을 통과했다.

## 운영 적용 전 남은 일

1. 운영 스키마/정책/권한/외부 소비자 확인 및 신규 migration 적용 승인.
2. 실제 사례 주소·작업기록 검토 후 운영자가 분류 연결. 기존 구 태그를 근거로 법정동을 자동 배정하지 않는다.
3. 공개 view/readers 전환 확인 후 개인정보 차단 SQL 별도 승인/적용.
4. 운영 환경변수로 새 빌드, 기존 견적 제출·첨부 업로드·관리자 기능의 운영 환경 확인, 배포 승인.

로컬 테스트는 Supabase의 실제 PostgREST 서비스·Storage·Realtime 인프라를 대체 검증한 것이 아니다. DB 권한/함수는 PostgreSQL 엔진에서 검증했고, 앱 HTTP 흐름은 루프백 fixture adapter로 검증했다. 실제 운영 페이지나 DB의 변경 완료를 의미하지 않는다. 적용 순서와 위험은 ROLLOUT.md를 따른다.
