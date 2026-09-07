import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
export async function createDatabase() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text);`);
  const init = (
    await readFile(
      new URL("../supabase/migrations/20260518000001_init.sql", import.meta.url),
      "utf8",
    )
  ).replace(
    "create extension if not exists pgcrypto;",
    "-- pgcrypto unnecessary: gen_random_uuid is built into PostgreSQL",
  );
  await db.exec(init);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/20260526000001_site_content.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(`grant usage on schema public to anon,authenticated,service_role;
    grant all on all tables in schema public to service_role;
    grant select,insert on public.leak_requests to anon,authenticated;
    grant select on public.posts,public.post_images,public.site_content to anon,authenticated;`);
  for (const name of ["20260907000001_seo_pilot.sql", "20260907000002_public_board_view.sql"]) {
    await db.exec(
      await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8"),
    );
  }
  return db;
}
