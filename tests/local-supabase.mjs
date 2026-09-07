// Isolated development fixture adapter, NOT a production server or a Supabase replacement.
// Only binds loopback; all data lives in an in-memory PostgreSQL database.
import { createServer } from "node:http";
import { createDatabase } from "./database.mjs";
if (process.env.LOCAL_SEO_TEST_SERVER !== "1") throw new Error("Requires explicit local test mode");
const db = await createDatabase();
for (let i = 1; i <= 15; i++) {
  const id = `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
  await db.query(
    `insert into posts(id,title,slug,content,excerpt,region_tags,category,published,published_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      id,
      `[로컬 검증용] 도봉구 사례 ${i}`,
      `local-test-${i}`,
      "이 글은 격리된 로컬 테스트 데이터입니다. 실제 시공사례가 아니며 운영 DB에 저장되지 않습니다.",
      "로컬 화면·페이지 이동 검증용 데이터",
      ["도봉구"],
      i % 2 === 0 ? "누수 탐지" : "leak",
      true,
      new Date(Date.UTC(2026, 8, 7, 0, 0, 16 - i)).toISOString(),
    ],
  );
}
await db.exec(
  `select set_post_seo('00000000-0000-4000-8000-000000000001','1132010700',array['symptom:meter-running']);`,
);
const allowed = new Set([
  "posts",
  "post_images",
  "post_locations",
  "post_terms",
  "region_pages",
  "regions",
  "site_content",
  "leak_request_board",
]);
const ident = (s) => {
  if (!/^[a-z_]+$/.test(s)) throw new Error("Invalid identifier");
  return '"' + s + '"';
};
let queue = Promise.resolve();
createServer((req, res) => {
  queue = queue
    .then(async () => {
      try {
        const url = new URL(req.url, "http://127.0.0.1:54339");
        const endpoint = url.pathname.replace("/rest/v1/", "");
        const body = await new Promise((resolve, reject) => {
          let s = "";
          req.on("data", (c) => (s += c));
          req.on("end", () => resolve(s ? JSON.parse(s) : {}));
          req.on("error", reject);
        });
        const admin = req.headers.apikey === "local-service-role-key-for-tests-only";
        const result = await db.transaction(async (tx) => {
          await tx.exec(`set local role ${admin ? "service_role" : "anon"}`);
          if (endpoint === "rpc/set_post_seo") {
            if (!admin) throw new Error("Forbidden");
            await tx.query("select public.set_post_seo($1,$2,$3)", [
              body.p_post_id,
              body.p_region_id,
              body.p_term_ids,
            ]);
            return { rows: null, count: 0 };
          }
          const values = [];
          let source;
          if (endpoint === "rpc/get_region_posts") {
            source = "public.get_region_posts($1)";
            values.push(body.p_region_id);
          } else {
            if (!allowed.has(endpoint)) throw new Error("Unknown resource");
            source = "public." + ident(endpoint);
          }
          if (req.method !== "GET" && req.method !== "HEAD" && endpoint !== "rpc/get_region_posts")
            throw new Error("Read-only fixture endpoint");
          const clauses = [];
          for (const [k, v] of url.searchParams) {
            if (["select", "order", "offset", "limit"].includes(k)) continue;
            const col = ident(k);
            if (v === "not.is.null") {
              clauses.push(`${col} is not null`);
              continue;
            }
            if (v === "is.null") {
              clauses.push(`${col} is null`);
              continue;
            }
            let val = v.slice(v.indexOf(".") + 1),
              operator;
            if (v.startsWith("eq.")) operator = "=";
            else if (v.startsWith("neq.")) operator = "<>";
            else if (v.startsWith("gte.")) operator = ">=";
            else if (v.startsWith("cs.")) operator = "@>";
            else if (v.startsWith("ov.")) operator = "&&";
            else if (v.startsWith("in.")) {
              const members =
                val
                  .slice(1, -1)
                  .match(/"[^"]*"|[^,]+/g)
                  ?.map((x) => x.replace(/^"|"$/g, "")) ?? [];
              const slots = members.map((x) => {
                values.push(x);
                return "$" + values.length;
              });
              clauses.push(`${col} in (${slots.join(",")})`);
              continue;
            } else throw new Error("Unsupported filter " + v);
            values.push(val);
            clauses.push(`${col} ${operator} $${values.length}`);
          }
          const where = clauses.length ? " where " + clauses.join(" and ") : "";
          const total = (await tx.query("select count(*)::int as n from " + source + where, values))
            .rows[0].n;
          const sel = url.searchParams.get("select") ?? "*";
          const columns = sel === "*" ? "*" : sel.split(",").map(ident).join(",");
          const order = url.searchParams.get("order");
          const orderSql = order
            ? " order by " +
              order
                .split(",")
                .map((x) => {
                  const [k, dir] = x.split(".");
                  return ident(k) + (dir === "desc" ? " desc" : " asc");
                })
                .join(",")
            : "";
          const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
          const limit = Math.min(1000, Math.max(0, Number(url.searchParams.get("limit") ?? 1000)));
          return {
            rows: (
              await tx.query(
                `select ${columns} from ${source}${where}${orderSql} limit ${limit} offset ${offset}`,
                values,
              )
            ).rows,
            count: total,
          };
        });
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Range",
          `0-${Math.max(0, (result.rows?.length ?? 0) - 1)}/${result.count}`,
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        const single = String(req.headers.accept).includes("vnd.pgrst.object");
        if (single && result.rows?.length !== 1) {
          res.statusCode = 406;
          res.end(
            JSON.stringify({
              code: "PGRST116",
              details: "The result contains 0 rows",
              message: "No rows",
            }),
          );
          return;
        }
        res.end(req.method === "HEAD" ? "" : JSON.stringify(single ? result.rows[0] : result.rows));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ code: "LOCAL_TEST_ERROR", message: e.message }));
      }
    })
    .catch((e) => {
      console.error(e);
      res.end();
    });
}).listen(54339, "127.0.0.1", () =>
  console.log("Isolated fixture API ready at 127.0.0.1:54339; no production data"),
);
