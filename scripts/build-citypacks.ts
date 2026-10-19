/**
 * Builds attributed City Pack snapshots from OpenStreetMap via Overpass.
 *   npm run citypacks            # all cities
 *   npm run citypacks -- kotli   # one city
 * Run sparingly (e.g. monthly) to respect public Overpass usage policies.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORY_IDS, CATEGORY_LABELS, overpassStatements } from "../src/lib/places/categories";
import { CITIES } from "../src/lib/places/cities";
import { normalizeElements } from "../src/lib/places/normalize";
import { runOverpass } from "../src/lib/places/overpass";
import type { CityPack } from "../src/lib/places/types";

const OUT_DIR = path.join(process.cwd(), "src", "data", "citypacks");

async function build(cityId: string) {
  const city = CITIES.find((c) => c.id === cityId);
  if (!city) throw new Error(`Unknown city ${cityId}`);
  const { south, west, north, east } = city.bbox;
  const query = `[out:json][timeout:90];\n(\n${overpassStatements(CATEGORY_IDS, `(${south},${west},${north},${east})`)}\n);\nout tags center;`;

  console.log(`→ ${city.name}: querying Overpass…`);
  const res = await runOverpass(query, { timeoutMs: 120_000 });
  const places = normalizeElements(res.elements).sort((a, b) => a.id.localeCompare(b.id));

  const pack: CityPack = {
    cityId: city.id,
    generatedAt: res.osm3s?.timestamp_osm_base ?? new Date().toISOString(),
    source: "OpenStreetMap via Overpass API",
    license: "ODbL-1.0",
    attribution: "© OpenStreetMap contributors",
    places,
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, `${city.id}.json`), JSON.stringify(pack));

  const counts = CATEGORY_IDS.map((c) => `${CATEGORY_LABELS[c]}: ${places.filter((p) => p.category === c).length}`);
  const named = places.filter((p) => p.name).length;
  console.log(`  ${places.length} places (${named} named) · data as of ${pack.generatedAt}`);
  console.log(`  ${counts.join(" · ")}`);
}

async function main() {
  const targets = process.argv.slice(2).length ? process.argv.slice(2) : CITIES.map((c) => c.id);
  for (const [i, id] of targets.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 5000)); // be polite between queries
    await build(id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
