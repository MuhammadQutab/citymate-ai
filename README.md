# CityMate AI

**Your City. Your Needs. Your AI Companion.**

A location-aware AI companion that helps travellers and newcomers find real places and essential services in Pakistani cities (pilots: Islamabad, Rawalpindi, Kotli) using OpenStreetMap data. Non-commercial prototype.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion for React · React-Leaflet · Gemini API (server-side) · OpenStreetMap / Overpass

## Getting started

Requires Node.js 24 LTS.

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY (optional; app runs AI-off without it)
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route type generation + `tsc` |

## Project layout

```
src/app/              routes: / , /explore , /place/[id] , /about
src/components/       brand/ landing/ layout/ mate/ ui/
src/lib/places/       category taxonomy, place types & providers
src/lib/geo/          straight-line distance helpers
src/lib/motion.ts     shared animation language
```

## Data & attribution

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL. City illustrations are original and decorative and do not depict real locations.

## HTTP API (shared by web and future mobile apps)

All responses are JSON. Errors: `{ error, message, issues? }` with 400 / 500 / 503.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/categories` | Taxonomy (groups, 24 categories, alternatives) and supported cities |
| `GET /api/places?category=&city=\|lat=&lon=[&limit][&wide=1]` | Nearest real places for one category |
| `GET /api/services?category=…` | As above, plus clearly-labelled `alternatives` when providers are scarce |
| `POST /api/chat` `{ message, history?, city?, near?, lastCategories? }` | AI City Assistant (Plan → Execute → Narrate, ≤2 model calls) |

Business logic lives in `src/lib` (`places/`, `agent/`, `resident/`, `api/`); UI in `src/components`. Add a category by editing `src/lib/places/categories.ts`, then run `npm run citypacks`.

## Reliability & safety (free-tier friendly)

- **Bounded AI:** ≤2 Gemini calls per message; keyword pre-check skips the planner; identical context-free questions are answered from cache.
- **Graceful degradation:** quota (429), timeouts or no key → instant "basic" mode with an honest notice; a 60 s cooldown avoids hammering the API.
- **Open data:** City Packs serve Islamabad/Rawalpindi/Kotli without network calls; live Overpass results are cached and fail fast during outages, falling back to the nearest pack.
- **Abuse protection:** per-client rate limits (chat ≈10/min, search ≈1/s) and same-origin checks on chat. These are per-instance and best-effort on serverless; the bounded work above is what keeps costs safe.
- **Hardening:** zod-validated inputs, CSP and security headers, no secrets in the client, no personal data stored server-side.

Run `npm test` (unit + API tests) and `npm run smoke -- <url> [--ai]` (end-to-end) before every deploy.
