import { readFile, writeFile } from "node:fs/promises";

const [dataPath, pilotPath, outputPath] = process.argv.slice(2);
if (!dataPath || !pilotPath || !outputPath) {
  throw new Error("Usage: node scripts/generate-seoul-region-migration.mjs <regions.json> <pilot.json> <migration.sql>");
}

const regions = JSON.parse(await readFile(dataPath, "utf8"));
const pilotIds = new Set(JSON.parse(await readFile(pilotPath, "utf8")).map((region) => region.id));
const additions = regions.filter((region) => !pilotIds.has(region.id));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const regionRows = additions.map((region) =>
  `(${quote(region.id)},${region.parent_id ? quote(region.parent_id) : "null"},${quote(region.level)},${quote(region.slug)},${quote(region.name)},${quote(region.source_url)},${quote(region.source_checked_on)})`,
);
const sql = `-- Generated from the Ministry of the Interior and Safety legal-dong code list.
-- Adds Seoul's remaining official regions without modifying reviewed Dobong pilot rows or posts.
begin;
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values
${regionRows.join(",\n")}
on conflict (id) do nothing;
commit;
`;
await writeFile(outputPath, sql);
console.log(`Generated ${additions.length} regions: ${outputPath}`);
