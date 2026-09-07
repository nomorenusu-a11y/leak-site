import { readFile, writeFile } from "node:fs/promises";
import romanizer from "@romanize/korean";

const { romanize } = romanizer;

const [dataPath] = process.argv.slice(2);
if (!dataPath) throw new Error("Usage: node scripts/normalize-seoul-region-slugs.mjs <regions.json>");

const districtOverrides = {
  종로구: "jongno-gu",
  중구: "jung-gu",
};
const regions = JSON.parse(await readFile(dataPath, "utf8"));
for (const region of regions) {
  if (region.level === "city") continue;
  if (districtOverrides[region.name]) {
    region.slug = districtOverrides[region.name];
    continue;
  }
  const suffix = region.level === "district" ? "구" : "동";
  region.slug = `${romanize(region.name.slice(0, -suffix.length))}-${region.level === "district" ? "gu" : "dong"}`;
}
await writeFile(dataPath, `${JSON.stringify(regions, null, 2)}\n`);
console.log(`Normalized ${regions.length - 1} Seoul region slugs.`);
