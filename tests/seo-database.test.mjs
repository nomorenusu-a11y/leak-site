import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createDatabase } from "./database.mjs";
test("PostgreSQL: pilot hierarchy, taxonomy, RLS, atomic classification and safe board rollout", async () => {
  const db = await createDatabase();
  try {
    const scalar = async (sql) => Object.values((await db.query(sql)).rows[0])[0];
    assert.equal(await scalar("select count(*)::int from regions"), 6);
    assert.equal(await scalar("select count(*)::int from seo_terms"), 31);
    await assert.rejects(
      db.exec(
        "insert into regions(id,parent_id,level,slug,name,source_url,source_checked_on) values('9999999999','1132010700','dong','bad','bad','test','2026-09-07')",
      ),
    );
    await db.exec(`insert into posts(id,title,slug,content,published,region_tags) values
    ('00000000-0000-4000-8000-000000000001','TEST published','test-public','TEST ONLY',true,array['도봉구']),
    ('00000000-0000-4000-8000-000000000002','TEST draft','test-draft','TEST ONLY',false,array['도봉구']);`);
    await db.exec(`set role service_role;
    select set_post_seo('00000000-0000-4000-8000-000000000001','1132010700',array['symptom:meter-running','detection_method:acoustic']);
    select set_post_seo('00000000-0000-4000-8000-000000000002','1132010700',array['work_type:pipe-repair']); reset role;`);
    await assert.rejects(
      db.exec(
        "select set_post_seo('00000000-0000-4000-8000-000000000001','1132010500',array['leak_type:meter-running'])",
      ),
    );
    assert.equal(
      await scalar(
        "select region_id from post_locations where post_id='00000000-0000-4000-8000-000000000001'",
      ),
      "1132010700",
    );
    await assert.rejects(
      db.exec(
        "insert into post_terms values('00000000-0000-4000-8000-000000000001','symptom:meter-running','leak_type')",
      ),
    );
    await db.exec("set role anon");
    assert.equal(await scalar("select count(*)::int from post_locations"), 1);
    assert.equal(await scalar("select count(*)::int from post_terms"), 2);
    assert.equal(await scalar("select count(*)::int from get_region_posts('1132010700')"), 1);
    assert.equal(await scalar("select count(*)::int from get_region_posts('1132010500')"), 0);
    assert.equal(await scalar("select count(*)::int from get_region_posts('1132000000')"), 1);
    assert.equal(await scalar("select count(*)::int from get_region_posts('1100000000')"), 1);
    await assert.rejects(
      db.exec("select set_post_seo('00000000-0000-4000-8000-000000000001',null,array[]::text[])"),
    );
    await assert.rejects(db.exec("delete from post_locations"));
    await db.exec("reset role");
    // District-only tags never populate a dong; unpublish removes case relations from public reads.
    await db.exec(
      "delete from post_locations where post_id='00000000-0000-4000-8000-000000000001'",
    );
    await db.exec("set role anon");
    assert.equal(await scalar("select count(*)::int from get_region_posts('1132010700')"), 0);
    assert.equal(await scalar("select count(*)::int from get_region_posts('1132000000')"), 1);
    await db.exec("reset role");
    await db.exec("update region_pages set published=false where region_id='1132010700'");
    await db.exec("set role anon");
    assert.equal(
      await scalar("select count(*)::int from region_pages where region_id='1132010700'"),
      0,
    );
    await db.exec("reset role");
    await db.exec(
      "insert into leak_requests(customer_name,phone,symptom,visible_on_board) values('TEST 이름','010-0000-0000','TEST symptom',true),('TEST 비공개','010-0000-0001','TEST symptom',false)",
    );
    // Apply the explicitly deferred hardening ONLY in the isolated database.
    await db.exec(
      await readFile(
        new URL("../supabase/manual/after_approval_harden_leak_requests.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec("set role anon");
    const board = await db.query("select * from leak_request_board");
    assert.equal(board.rows.length, 1);
    assert.deepEqual(
      Object.keys(board.rows[0]).sort(),
      ["id", "masked_name", "region", "status", "created_at", "updated_at"].sort(),
    );
    await assert.rejects(db.query("select phone from leak_requests"));
    await assert.rejects(
      db.exec(
        "insert into leak_requests(customer_name,phone,symptom) values('TEST','test','test')",
      ),
    );
    await db.exec("reset role; set role service_role");
    assert.equal(await scalar("select count(*)::int from leak_requests"), 2);
    await db.exec(
      "insert into leak_requests(customer_name,phone,symptom) values('TEST server','test','test')",
    );
  } finally {
    await db.close();
  }
});
