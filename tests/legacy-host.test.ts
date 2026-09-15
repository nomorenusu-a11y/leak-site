import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

test("legacy Vercel host returns 404 and blocks indexing", async () => {
  const response = await proxy(
    new NextRequest("https://leak-site.vercel.app/posts/old-case"),
  );

  assert.equal(response.status, 404);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.match(await response.text(), /이전 주소의 게시물은 삭제되었습니다/);
});
