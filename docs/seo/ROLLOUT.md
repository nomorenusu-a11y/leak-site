# 도봉구 SEO 파일럿 적용 계획

범위: `/seoul`, `/seoul/dobong-gu`, 그 아래 `chang-dong`, `ssangmun-dong`, `banghak-dong`, `dobong-dong`의 6개 URL만 추가한다. `/posts`, `/posts/region/[region]`, `/posts/[slug]` 경로와 기존 저장 데이터를 보존한다. 서울 전체·지역×누수유형 조합 페이지는 별도 승인 전 금지한다.

## 현재 구현과 운영 적용의 구분

- 새 스키마·도봉구 지역 안내·31개 분류 항목은 migration 파일로만 준비했다.
- 운영 DB 접속, SQL 적용, 기존 글 변환, 게시글 작성, 배포는 수행하지 않았다.
- 지역 안내 fallback은 동일한 검토된 파일럿 데이터다. DB 테이블이 없을 때만 사용한다. 테이블이 존재하나 행이 비공개/삭제된 경우 fallback으로 재공개하지 않는다.
- 사례 조회 실패와 실제 0건을 구분해 표시한다. 법정동에 다른 동 사례나 데모 현황판을 채우지 않는다.
- 운영 데이터가 확인되지 않아 실제 글의 도봉구·법정동 배정은 하지 않았다. 관리자에게 실제 주소 확인 후 기존 글 편집 → `실제 시공 지역·SEO 분류 관리`에서 연결하도록 한다.

## 적용 순서 (운영에서 아직 실행하지 않음)

1. 운영 DB의 스키마·정책·테이블/컬럼 권한과 Realtime 사용처를 읽기 전용으로 확인한다. 기존 카테고리 값·태그·게시글 수를 집계한다. 서비스 키는 출력하거나 문서에 남기지 않는다.
2. 백업/복구 지점을 확보한 후 additive migration 두 개를 검토한다.
   - `20260907000001_seo_pilot.sql`: 5개 신규 테이블과 관계, 6개 지역 안내, 분류 31개, 공개 조회 함수와 서비스 전용 원자적 저장 함수. 기존 게시글·견적·카테고리를 바꾸지 않는다.
   - `20260907000002_public_board_view.sql`: `leak_request_board`에 마스킹 이름, 지역, 상태, 시간, ID만 투영. 기존 정책을 변경하지 않는 전환용 view다.
3. 운영 적용 승인 후 두 migration을 먼저 적용하고 새 앱을 배포한다. 공개 현황판 조회가 view를 사용하고, 관리자/견적 신청은 service_role 서버 경로로 동작하는지 확인한다.
4. 아래 개인정보 차단 변경은 영향 확인 및 승인 후 별도로 실행한다. **일반 `db push`에 포함하지 않았다.**
   `supabase/manual/after_approval_harden_leak_requests.sql`
5. 기존 실제 사례의 주소를 운영자가 확인해 법정동을 지정한다. 구만 확인되면 도봉구로 남긴다. 분류에서 실제 사용한 장비/수행한 작업만 선택한다. 미확인 값은 미선택으로 둔다.
6. 생산 환경변수로 새로 빌드하고 6개 경로·기존 홈페이지·게시판·관리자·견적 신청을 확인한 뒤 공개한다. 테스트 API로 만든 `.next` 빌드는 운영에 배포하지 않는다.

## 개인정보 변경의 위험과 차단 범위

현재 저장소 초기 SQL의 공개 SELECT는 `visible_on_board` 행 필터일 뿐이므로 전화번호·원래 고객명을 보호하지 않는다. 공개 INSERT도 `with check(true)`이다. 실운영이 같은지는 별도 확인해야 한다.

안전한 전환: 공개 읽기를 전용 projection view로 옮긴 후 base table의 PUBLIC/anon/authenticated 권한 및 공개 정책을 제거한다. 민감 테이블의 Realtime publication도 해제한다. 구형 LiveBoardClient는 개인정보 테이블 구독 대신 safe view를 15초 간격으로 조회하도록 변경했다. 새 view는 의도적인 owner-rights projection이며 `visible_on_board=true`를 명시한다. `security_invoker`로 바꾸면 base table 권한이 다시 필요하므로 기계적으로 변경하지 않는다.

예상 영향: 외부에서 base table을 직접 읽거나 anon INSERT 하던 비공식 클라이언트, 옛 Realtime 소비자는 중단된다. 현 저장소의 견적 Server Action·관리자는 service_role을 사용하므로 유지되지만 실제 소비자를 먼저 확인해야 한다. 추가 컬럼별 grant, 커스텀 역할, 다른 public RPC/view가 있다면 수동 차단 SQL만으로 충분하다고 판단하지 않는다.

request-images는 기존 공개 버킷이다. 이번 SQL은 파일 공개 URL의 접근권한을 해결하지 않는다. private bucket/signed URL 전환은 기존 첨부 접근에 영향을 주므로 별도 검토 대상으로 남긴다.

문제 발생 시 새 SEO 라우트 진입 링크를 제거하고 이전 앱으로 되돌릴 수 있다. 개인정보 차단 이후에는 이전의 base-table 읽기 앱으로 단순 롤백하지 말고 safe-view 읽기를 유지한 앱으로 되돌린다. 개인정보 공개 권한을 자동 복원하는 롤백은 제공하지 않는다. 신규 테이블/연결은 삭제하지 않고 보존한다.

## 분류체계

| 축 | 의미 | 예시 |
| --- | --- | --- |
| building_type | 현장 건물 유형 | 아파트, 연립·다세대, 단독주택, 오피스텔, 상가·업무시설 |
| leak_type | 확인된 배관·설비/발생 부위 분류. 모든 항목이 인과적 원인이라는 뜻은 아님 | 수도배관, 온수배관, 난방배관, 보일러, 매립배관, 욕실, 주방, 천장, 베란다, 외벽/빗물 |
| symptom | 관찰된 증상/검색 의도 | 계량기 회전, 요금 급증, 천장 물자국, 벽지 젖음 등 |
| detection_method | 기록으로 확인된 탐지 행위 | 공압검사, 가스탐지, 청음탐지, 열화상 |
| work_type | 기록으로 확인된 실제 작업 | 배관 보수, 부분 굴착, 배관 교체, 복구 |

`seo_terms`의 ID/axis를 함께 외래키로 참조하므로 `symptom:meter-running`을 leak_type으로 저장할 수 없다. 한 글은 여러 축·여러 항목을 가진다. `post_locations`는 한 글의 대표 실제 현장 1곳을 연결한다. 복수 현장 글을 지원하려면 향후 명시적 확장한다. 상세 주소/고객 개인정보를 지역 테이블에 저장하지 않는다.

`set_post_seo`는 글을 잠그고 지역·분류 관계를 한 트랜잭션에서 교체한다. 오류 시 기존 관계를 보존한다. anon/authenticated에게 실행 권한이 없고, 관리자 Server Action이 세션을 검증한 후 service_role로 호출한다. 기존 `posts.category`와 `region_tags`는 SEO 축으로 추정·변환하지 않는다.

## 기존 카테고리 호환

신규 관리자 선택지는 홈과 동일한 영문 코드를 사용한다. 과거 한글 값은 그대로 보존하며 폼에 기존 값을 표시한다. 누수 탐지·누수 시공은 조회 시 leak의 호환값으로 읽는다. 방수·배관은 각각 독립 분류로 유지해 난방이나 변기 등으로 추정하지 않는다. 분류별 조회에서 기존 값도 포함하되 DB UPDATE 일괄 변환은 수행하지 않는다. 데이터 변환 승인은 이번 작업에 포함되지 않는다.

## 검색엔진/링크

- 지역 metadata/H1/canonical/FAQ/breadcrumb은 같은 지역 콘텐츠를 기준으로 생성한다.
- 구→법정동 카드와 동→구 breadcrumb, 상세사례→확인된 지역 breadcrumb을 제공한다.
- 원문은 `/posts/[slug]` 하나만 유지한다.
- `published=false` 지역 콘텐츠는 404이고 sitemap에 없다. 부모가 비공개이면 하위도 노출하지 않는다. `indexable=false`는 noindex 및 sitemap 제외다.
- 새로운 지역 DB 행만으로 라우트가 생기지 않는다. 명시적 파일럿 allowlist 검증으로 나머지 경로를 `notFound()` 처리한다. 정적 생성 대상도 같은 6개로 제한한다. `force-static` 및 blocking ISR로 기존 URL의 저장 후 재생성을 허용한다. Next.js 16.2.6에서 `dynamicParams=false`와 수동 재검증을 함께 쓸 때 관찰한 404 회귀를 피한다.
- 기존 목록은 `?page=`를 읽고 잘못된/범위 밖 페이지는 404, 카테고리 필터를 다음 페이지에도 유지한다. 필터 페이지는 noindex/follow, 각 유효 페이지 canonical은 자신이다.
- 전체 공개 slug 조회는 안정적인 ID 정렬 및 분할 조회를 사용한다. 서버가 요청보다 작은 상한을 적용해도 빈 배치까지 계속 읽는다. 오류를 부분 sitemap 성공으로 숨기지 않는다.
- Preview 환경은 `VERCEL_ENV`를 우선하여 robots 차단한다. 운영은 `NEXT_PUBLIC_SITE_URL=https://nomorenusu.com`으로 확인한다.
- 근거 없는 aggregateRating을 제거하고 JSON-LD 이미지 경로를 실제 `/og-image.png`로 맞췄다.

## 법정동 자료 근거

- 공식 지역 코드 참조: https://www.code.go.kr/stdcode/regCodeL.do?menuNo=101010100010
- 서울시 공개 자료의 도봉구 코드 교차확인: https://sema.seoul.go.kr/semaaa/data/upload/attach/10000/17455/20210917105609506.pdf (도봉동 1132010800, 방학동 1132010600, 쌍문동 1132010500, 창동 1132010700)
- 도봉구 도로명주소 안내: https://www.dobong.go.kr/Contents.asp?code=10009972

`source_checked_on`은 이번 자료 열람일이며 자료 자체의 발행일을 뜻하지 않는다. 서울시 코드 자료는 2021년 자료다. 서울 전체 확대 전에 당시 최신 공식 현존 목록과 변경 이력을 다시 확인한다. 행정동(창1동 등)은 이번 URL/지역 마스터에 넣지 않는다.

## 검증 명령

- `npm test`: 실제 PostgreSQL 엔진(PGlite)의 migration/RLS/원자성 및 TS 단위 테스트. 운영 연결 없음.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- `LOCAL_SEO_TEST_SERVER=1 node tests/local-supabase.mjs`: 루프백 한정, 메모리 DB의 테스트 API. 테스트 사례에 `[로컬 검증용]`을 명시한다. 종료하면 소멸한다.
- 브라우저: 6개 URL, 모바일 390px/데스크톱, FAQ, 구↔동, 사례↔동, CTA, 게시판 2페이지, 분류 저장 검증.
