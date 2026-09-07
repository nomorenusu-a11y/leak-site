import { readFile, writeFile } from "node:fs/promises";

const [dataPath, pilotPath, outputPath] = process.argv.slice(2);
if (!dataPath || !pilotPath || !outputPath) {
  throw new Error("Usage: node scripts/generate-seoul-region-migration.mjs <regions.json> <pilot.json> <migration.sql>");
}

const regions = JSON.parse(await readFile(dataPath, "utf8"));
const pilotIds = new Set(JSON.parse(await readFile(pilotPath, "utf8")).map((region) => region.id));
const additions = regions.filter((region) => !pilotIds.has(region.id));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const genericContent = (region) => {
  const title = region.level === "district" ? `${region.name} 누수탐지 지역 안내` : `${region.name} 누수탐지 상담 안내`;
  return {
    title,
    description: `서울 ${region.name} 누수 상담과 지역 안내입니다. 실제 시공사례는 작업 지역이 확인된 경우에만 연결합니다.`,
    intro: `${region.name}에서 누수 증상이 보이면 주소, 건물 유형, 물이 보이는 위치와 발견 시점을 전화 상담에서 알려 주세요.`,
    faq: [
      {
        question: `${region.name} 누수 상담 전 무엇을 알려야 하나요?`,
        answer: "작업 주소, 건물 유형, 물이 보이는 위치와 처음 발견한 시점을 알려 주세요. 원인과 작업 범위는 현장 확인 전까지 단정하지 않습니다.",
      },
      {
        question: "사진만으로 누수 원인과 비용을 확정할 수 있나요?",
        answer: "사진과 증상은 상담을 위한 참고 정보입니다. 실제 원인, 탐지 방법, 보수 범위와 비용은 현장 상태를 확인한 뒤 안내합니다.",
      },
    ],
  };
};

const regionRows = additions.map((region) =>
  `(${quote(region.id)},${region.parent_id ? quote(region.parent_id) : "null"},${quote(region.level)},${quote(region.slug)},${quote(region.name)},${quote(region.source_url)},${quote(region.source_checked_on)})`,
);
const pageRows = additions.map((region) => {
  const content = genericContent(region);
  return `(${quote(region.id)},${quote(content.title)},${quote(content.description)},${quote(content.intro)},${quote(JSON.stringify(content.faq))}::jsonb,true,false,'2026-09-07T00:00:00Z')`;
});

const sql = `-- Generated from the Ministry of the Interior and Safety legal-dong code list.
-- Adds Seoul's remaining official regions without modifying reviewed Dobong pilot rows or posts.
begin;
insert into public.regions(id,parent_id,level,slug,name,source_url,source_checked_on) values
${regionRows.join(",\n")}
on conflict (id) do nothing;

-- New pages are reachable but intentionally noindex until a verified case is classified there.
-- savePostSeo then enables the selected dong, its district, and Seoul hub together.
insert into public.region_pages(region_id,title,description,intro,faq,published,indexable,updated_at) values
${pageRows.join(",\n")}
on conflict (region_id) do nothing;
commit;
`;
await writeFile(outputPath, sql);
console.log(`Generated ${additions.length} regions and pages: ${outputPath}`);
