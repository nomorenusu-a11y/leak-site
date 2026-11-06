# 노모어누수 적용·검증 기록 — 2026-11-06

배포 버전: `0a98830d-3bc1-4cdd-9a76-1ea05119004e`

## 적용 결과

- 관리자 글별 접속·사이트맵·검색 링크·유입·전화·카카오 추적 표 추가. 수동 업데이트에서 공개 글6개와 검색어3개를 순환 검사.
- 대표 글5개를 증상 비교·점검 범위·상담 중심으로 개선하고 사진17개의 설명을 실제 보이는 내용에 맞춰 수정. 예약 글270개에 관련 허브 연결.
- 오래된 네이버 공식 통계는 보관자료로 표시. 최신 공식 노출·클릭·순위 변화는 이번 작업으로 확인하지 못함.
- KV 일일 쓰기 한도 초과 로그를 확인하여 페이지 응답을 공식 Workers Cache로 분리. KV 데이터 어댑터·도메인·예약 시각 유지. 반복 CLI검사 기본20개 제한.
- 테스트31개, 타입 검사, 빌드, 실제 운영 검증 통과. 관리자 화면200 및 업데이트API200.
- 공개 글 555개 저장된 점검 결과 정상 555개, 남은 오류 0개. 각 글의 개별 검사 시각 기준이며 동시에 전부 측정한 결과가 아님.
- 미래 예약262개 사이트맵 누출0개. 익명 DB표본10개 공개0개. 미래 공개URL 직접 요청0개.
- 대표 글5개 IndexNow 접수200. 접수는 색인·상위노출 보장이 아님.

## 증거의 범위

100페이지 최종 단일 동시요청 크롤링: HTTP200 100개, 실패0개, high0/medium0. 전체 사이트 완전 크롤링이 아님. 최대100페이지 및 발견URL 경계로 일부URL이 미검사됨. GSC/GA 연결 자료와 최신 네이버 공식 검색 성과는 없음. 현재 검색 링크 관찰과 공식 색인 상태를 혼동하지 않음.

## 반환된 모든 finding의 판정

| 보고서 | ID / 정확한 제목 | 판정 | 근거 및 검증 |
|---|---|---|---|
| 수정 전 | `crawl:connection_error` / connection_error: Connection error (1 URL) | fixed | 페이지 캐시 분리 후 최종 단일 요청100페이지 실패0; 공개 글 저장 점검555개 오류0. 과거 부하 오류와 현재 결과 구분. |
| 수정 전 | `crawl:canonical_outside_head` / canonical_outside_head: Canonical appears outside the HTML head (26 URLs) | fixed | 메타데이터를 초기head로 출력. 최종100페이지 해당 규칙0건; 대표 글5개 실제head검증. |
| 수정 전 | `crawl:hsts_missing` / hsts_missing: HSTS header missing (100 URLs) | deferred | HSTS는 장기HTTPS 정책 변경이므로 운영 안정화 범위에서 별도 검토. 이번에 새 정책을 추가하지 않음. |
| 수정 전 | `crawl:image_oversized_candidate` / image_oversized_candidate: Oversized image candidates (61 URLs) | deferred | 휴리스틱 후보로 기기별 전송 크기·화질 검증이 추가로 필요. 이번에 사진 설명은 개선했으나 이미지 크기 최적화 완료로 주장하지 않음. |
| 수정 전 | `crawl:slow_response` / slow_response: Slow response in this crawl (32 URLs) | changed | KV 저장 한도 오류 로그에 근거해 페이지 캐시 변경. 실제HIT확인, 최종 단일요청 평균1651ms; 느린응답27건은 남음. 현장Core Web Vitals와 동일하지 않음. |
| 수정 전 | `crawl:orphan_page` / orphan_page: No observed internal links (14 URLs) | deferred | 100페이지 제한 표본의 미관측 링크만으로 진짜 고립 페이지 확정 불가. 허브 연결285개를 보강했으나 해당 표본 전체 해소로 주장하지 않음. |
| 중간 부하 점검 | `crawl:server_error` / server_error: Server error (9 URLs) | fixed | 페이지 캐시 분리 후 최종 단일 요청100페이지 실패0; 공개 글 저장 점검555개 오류0. 과거 부하 오류와 현재 결과 구분. |
| 중간 부하 점검 | `crawl:broken_internal_link` / broken_internal_link: Broken internal link (5 URLs) | fixed | 페이지 캐시 분리 후 최종 단일 요청100페이지 실패0; 공개 글 저장 점검555개 오류0. 과거 부하 오류와 현재 결과 구분. |
| 중간 부하 점검 | `crawl:hsts_missing` / hsts_missing: HSTS header missing (91 URLs) | deferred | HSTS는 장기HTTPS 정책 변경이므로 운영 안정화 범위에서 별도 검토. 이번에 새 정책을 추가하지 않음. |
| 중간 부하 점검 | `crawl:slow_response` / slow_response: Slow response in this crawl (90 URLs) | changed | KV 저장 한도 오류 로그에 근거해 페이지 캐시 변경. 실제HIT확인, 최종 단일요청 평균1651ms; 느린응답27건은 남음. 현장Core Web Vitals와 동일하지 않음. |
| 중간 부하 점검 | `crawl:image_oversized_candidate` / image_oversized_candidate: Oversized image candidates (71 URLs) | deferred | 휴리스틱 후보로 기기별 전송 크기·화질 검증이 추가로 필요. 이번에 사진 설명은 개선했으나 이미지 크기 최적화 완료로 주장하지 않음. |
| 중간 부하 점검 | `crawl:orphan_page` / orphan_page: No observed internal links (13 URLs) | deferred | 100페이지 제한 표본의 미관측 링크만으로 진짜 고립 페이지 확정 불가. 허브 연결285개를 보강했으나 해당 표본 전체 해소로 주장하지 않음. |
| 최종 보고서 | `crawl:hsts_missing` / hsts_missing: HSTS header missing (100 URLs) | deferred | HSTS는 장기HTTPS 정책 변경이므로 운영 안정화 범위에서 별도 검토. 이번에 새 정책을 추가하지 않음. |
| 최종 보고서 | `crawl:image_oversized_candidate` / image_oversized_candidate: Oversized image candidates (61 URLs) | deferred | 휴리스틱 후보로 기기별 전송 크기·화질 검증이 추가로 필요. 이번에 사진 설명은 개선했으나 이미지 크기 최적화 완료로 주장하지 않음. |
| 최종 보고서 | `crawl:orphan_page` / orphan_page: No observed internal links (14 URLs) | deferred | 100페이지 제한 표본의 미관측 링크만으로 진짜 고립 페이지 확정 불가. 허브 연결285개를 보강했으나 해당 표본 전체 해소로 주장하지 않음. |
| 최종 보고서 | `crawl:slow_response` / slow_response: Slow response in this crawl (13 URLs) | changed | KV 저장 한도 오류 로그에 근거해 페이지 캐시 변경. 실제HIT확인, 최종 단일요청 평균1651ms; 느린응답27건은 남음. 현장Core Web Vitals와 동일하지 않음. |

## URL별 증거·처리 목록

별도 inventories 객체는 세 보고서 모두 없음. 아래는 모든 반환 affectedUrls 표본이며, returned < total인 항목의 전체URL 목록은 아님. 중복URL도 원래 finding별로 보존함.

| 보고서 / finding | 반환 URL | 처리·증거 |
|---|---|---|
| 수정 전 / crawl:connection_error | https://nomorenusu.com/posts/region/jongno | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/bundang | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/dobong | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/dongdaemun | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/dongjak | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/eunpyeong | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/gangbuk | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/gangdong | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/gangnam | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:canonical_outside_head | https://nomorenusu.com/posts/region/gangseo | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/ | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/faq | 최종100페이지 표본 외; 개별 최신 상태를 이 표만으로 확정하지 않음; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260916-cheonho-warm-floor | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:hsts_missing | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260916-cheonho-warm-floor | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-051 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-boost-010 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/ | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260916-cheonho-warm-floor | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20260923-september-060 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:slow_response | https://nomorenusu.com/posts/20261001-october-pilot-001 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20260928-september-095 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261005-october-pilot-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261006-october-pilot-055 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261006-october-pilot-060 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261014-october-pilot-147 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261014-october-pilot-153 | 최종100페이지 표본 외; 개별 최신 상태를 이 표만으로 확정하지 않음; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261017-october-extension-020 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261018-october-extension-027 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261019-october-extension-034 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 수정 전 / crawl:orphan_page | https://nomorenusu.com/posts/20261024-october-extension-098 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/20261015-october-pilot-160 | 최종100페이지 표본 외; 개별 최신 상태를 이 표만으로 확정하지 않음; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/20261018-october-extension-027 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/20261025-october-extension-109 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/20261026-october-extension-115 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/20261027-october-extension-132 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/bupyeong-toilet-case-2026 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/region/dongjak | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/region/guro | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:server_error | https://nomorenusu.com/posts/region/mapo | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:broken_internal_link | https://nomorenusu.com/posts/20261015-october-pilot-160 | 최종100페이지 표본 외; 개별 최신 상태를 이 표만으로 확정하지 않음; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:broken_internal_link | https://nomorenusu.com/posts/20261025-october-extension-109 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:broken_internal_link | https://nomorenusu.com/posts/region/dongjak | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:broken_internal_link | https://nomorenusu.com/posts/region/guro | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:broken_internal_link | https://nomorenusu.com/posts/region/mapo | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/ | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:hsts_missing | https://nomorenusu.com/posts/20260921-september-051 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/ | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:slow_response | https://nomorenusu.com/posts/20260921-september-051 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-051 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-boost-010 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260923-september-060 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20260928-september-095 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261005-october-pilot-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261006-october-pilot-060 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261015-october-pilot-165 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261017-october-extension-020 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261019-october-extension-034 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 중간 부하 점검 / crawl:orphan_page | https://nomorenusu.com/posts/20261024-october-extension-098 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/ | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260916-cheonho-warm-floor | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:hsts_missing | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-gireum-ceiling-stain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260914-munjeong-manifold-water | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260916-cheonho-warm-floor | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260916-hannam-veranda-rain | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260918-baekseok-basin-mold | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260919-jeongneung-yard-water-pipe | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260920-september-boost-006 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-051 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:image_oversized_candidate | https://nomorenusu.com/posts/20260921-september-boost-010 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20260928-september-095 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261005-october-pilot-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261006-october-pilot-060 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261014-october-pilot-147 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261017-october-extension-020 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261018-october-extension-027 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261019-october-extension-034 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261024-october-extension-098 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261027-october-extension-132 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:orphan_page | https://nomorenusu.com/posts/20261028-october-extension-137 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20260930-september-106 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261001-october-pilot-002 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261015-october-pilot-159 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261015-october-pilot-165 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261017-october-extension-013 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261017-october-extension-017 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261019-october-extension-034 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/20261020-october-extension-050 | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
| 최종 보고서 / crawl:slow_response | https://nomorenusu.com/posts/region/bundang | 최종 표본 HTTP200; canonical single; 위 finding 판정에 따라 보존·추적 |
