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
