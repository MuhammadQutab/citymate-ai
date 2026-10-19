/**
 * End-to-end smoke test against a running CityMate (local or deployed).
 *   npm run smoke                          # http://localhost:3000
 *   npm run smoke -- https://your-app.vercel.app
 *   npm run smoke -- <url> --ai            # also spends 1–2 Gemini calls
 */
const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith("http")) ?? "http://localhost:3000").replace(/\/$/, "");
const withAi = args.includes("--ai");

let failed = 0;
const ok = (name, cond, detail = "") => {
  console.log(`${cond ? "✓" : "✗"} ${name}${detail ? `  (${detail})` : ""}`);
  if (!cond) failed++;
};
const t0 = () => performance.now();

async function page(path, marker) {
  const s = t0();
  const res = await fetch(base + path);
  const html = await res.text();
  ok(`page ${path}`, res.status === 200 && html.includes(marker), `${res.status}, ${Math.round(performance.now() - s)} ms`);
}

async function json(path, init) {
  const s = t0();
  const res = await fetch(base + path, init);
  const body = await res.json().catch(() => null);
  return { res, body, ms: Math.round(performance.now() - s) };
}

console.log(`Smoke testing ${base}\n`);

await page("/", "CityMate");
await page("/explore", "CityMate");
await page("/services", "Tell Mate");
await page("/new-resident", "Welcome to your new city");
await page("/about", "About CityMate");
await page("/place/node-1625045341", "Jamia");
{
  const res = await fetch(`${base}/place/not-a-place`);
  ok("unknown place → 404", res.status === 404, String(res.status));
}

{
  const res = await fetch(`${base}/`);
  ok("security headers", res.headers.get("x-content-type-options") === "nosniff" && res.headers.get("x-frame-options") === "DENY");
}

{
  const { res, body, ms } = await json("/api/categories");
  ok("GET /api/categories", res.status === 200 && body?.categories?.length >= 24, `${ms} ms`);
}
{
  const { res, body, ms } = await json("/api/places?category=atm&city=islamabad&limit=5");
  ok("GET /api/places (pack)", res.status === 200 && body?.places?.length === 5 && body.source === "citypack", `${ms} ms`);
}
{
  const { res, body } = await json("/api/places?category=nope");
  ok("GET /api/places invalid → 400", res.status === 400 && body?.error === "invalid_request");
}
{
  const { res, body, ms } = await json("/api/services?category=plumber&city=islamabad");
  ok("GET /api/services alternatives", res.status === 200 && body?.alternatives?.[0]?.category === "hardware", `${ms} ms`);
}
{
  const { res, body } = await json("/api/services?category=pharmacy&city=kotli");
  ok("Kotli honest empty result", res.status === 200 && body?.places?.length === 0 && body.notices?.length > 0);
}
{
  const { res } = await json("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example" },
    body: JSON.stringify({ message: "atm" }),
  });
  ok("POST /api/chat cross-origin → 403", res.status === 403, String(res.status));
}
if (withAi) {
  const { res, body, ms } = await json("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "My kitchen tap is leaking", city: "islamabad" }),
  });
  ok("POST /api/chat (AI)", res.status === 200 && body?.categories?.[0] === "plumber", `${body?.mode}, ${ms} ms`);
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
