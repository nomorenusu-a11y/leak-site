import test from "node:test";
import assert from "node:assert/strict";
import { parseNaverSearchHtml } from "../src/lib/naver-search-visibility";

test("extracts only direct nomorenusu result links", () => {
  const html = `
    <a href="https://nomorenusu.com/posts/munjeong-guide">문정동 온수배관 누수</a>
    <a href='https://www.nomorenusu.com/'>노모어누수</a>
    <img src="https://search.pstatic.net/sunny?src=https%3A%2F%2Fnomorenusu.com%2Ffavicon.ico">
    <a href="https://example.com/?next=https://nomorenusu.com/posts/wrong">외부 링크</a>
    <a href="https://nomorenusu.com/posts/munjeong-guide">중복</a>
  `;
  assert.deepEqual(parseNaverSearchHtml(html), [
    "https://nomorenusu.com/posts/munjeong-guide",
    "https://www.nomorenusu.com/",
  ]);
});

test("decodes html entities and removes hashes", () => {
  const html = `<a href="https://nomorenusu.com/posts/example?from=naver&amp;view=1#section">결과</a>`;
  assert.deepEqual(parseNaverSearchHtml(html), [
    "https://nomorenusu.com/posts/example?from=naver&view=1",
  ]);
});
