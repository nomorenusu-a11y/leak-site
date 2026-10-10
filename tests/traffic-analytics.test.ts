import assert from "node:assert/strict";
import test from "node:test";
import { deriveAcquisition } from "../src/lib/traffic-analytics";

test("네이버 검색 유입과 전달된 검색어를 구분한다", () => {
  const result = deriveAcquisition(
    "https://search.naver.com/search.naver?query=%EC%A0%95%EC%9E%90%EB%8F%99+%EC%98%A5%EC%83%81+%EB%88%84%EC%88%98",
    "https://nomorenusu.com/posts/jungja-roof-leak",
  );

  assert.deepEqual(result, {
    source: "naver",
    referrerHost: "search.naver.com",
    searchQuery: "정자동 옥상 누수",
    utmSource: null,
    utmCampaign: null,
    isSearch: true,
  });
});

test("검색 사이트가 검색어를 숨겨도 검색 유입으로 집계한다", () => {
  const result = deriveAcquisition(
    "https://www.google.com/",
    "https://nomorenusu.com/posts/example",
  );

  assert.equal(result.source, "google");
  assert.equal(result.searchQuery, null);
  assert.equal(result.isSearch, true);
});

test("UTM 캠페인과 외부 추천·직접 방문을 안전하게 분류한다", () => {
  const campaign = deriveAcquisition(
    "",
    "https://nomorenusu.com/?utm_source=naver-blog&utm_campaign=october",
  );
  assert.equal(campaign.source, "naver-blog");
  assert.equal(campaign.utmCampaign, "october");

  const referral = deriveAcquisition(
    "https://community.example.kr/post/1",
    "https://nomorenusu.com/",
  );
  assert.equal(referral.source, "community.example.kr");
  assert.equal(referral.isSearch, false);

  const direct = deriveAcquisition("", "https://nomorenusu.com/");
  assert.equal(direct.source, "direct");
});
