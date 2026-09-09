# Waste 2 Worth — Frontend

Web client for the Waste 2 Worth flow. **React + Vite + TypeScript**, styled in the
"Eco Playful" direction (warm paper tones, rounded cards, chunky buttons),
**Arabic-only**, RTL.

## Two modes

`VITE_API_MODE` (in `.env`) picks where the data comes from:

| Mode | What it does |
| --- | --- |
| **`local`** (default) | Runs the whole flow **in the browser** — bundled catalogue (`src/data/catalogue.ts`) + a deterministic on-device recogniser. No backend, no network. This is what the hosted prototype ships. |
| `remote` | Talks to the real backend API (`../backend`) via `VITE_API_BASE_URL`. For the production build later. |

`src/lib/api.ts` is a thin switch between `src/lib/localApi.ts` and `src/lib/httpApi.ts`.

## Run it

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173   (local mode — nothing else to start)
```

`npm run build` type-checks and produces a self-contained static site in `dist/`.
`npm run preview` serves that build.

### Adding / editing projects

All project content — titles, steps, per-step measurements, tools, safety notes,
which `blueprint` diagram each step uses, the source credit — lives in
**`src/data/content.ts`** (`IDEAS_AR`). Edit it, then run `npm run gen:data` to
regenerate `src/data/catalogue.ts`, the step blueprints and the product
illustrations in `src/data/media.ts` / `public/media/`. Numeric bottle specs come
from the backend seed. Swap a `-final.svg` for a real photo (same filename) and
re-run `gen:data` to inline it.

## Builds

| Command | Output | Use |
| --- | --- | --- |
| `npm run build` | `dist/` (index.html + `assets/`) | **Hosting.** Upload to a static host. |
| `npm run build:standalone` | `dist-standalone/index.html` (one file, ~360 kB) | **Double-click.** Everything — JS, CSS, artwork — inlined. Opens straight from the file system, no server. |

> A normal multi-file build **will show a blank page if you just double-click
> `index.html`** — browsers block loading the JS from `file://`. Either host it,
> or use the standalone single file.

## Deploy the prototype (for the judging committee)

- **Netlify Drop (fastest):** go to <https://app.netlify.com/drop> and drag the
  `dist` folder onto the page. Public link in seconds.
- **GitHub Pages (automatic):** push this repo, then **Settings → Pages →
  Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes
  on every push to `main`. Link: `https://<username>.github.io/<repo>/`.
- **GitHub Pages (manual):** upload the **contents** of `dist/`, then
  **Settings → Pages → Deploy from a branch → main → /(root)**.
- **No hosting at all:** send someone `dist-standalone/index.html` — they open
  it by double-clicking.

`base: './'` + `HashRouter` mean the site works from any host, any sub-path, and
the file system.

## Tests

```bash
npm test              # Vitest run (107 tests)
npm run test:coverage # enforces 100% coverage (statements / branches / functions / lines)
```

- **Vitest + React Testing Library**, jsdom.
- `localApi.test.ts` tests the real in-browser API. `httpApi.test.ts` tests the
  real fetch client against a stubbed `fetch`. Page/hook tests mock `../lib/api`
  with `src/test/apiMock.ts` (+ `src/test/fixtures.ts`).
- Coverage is gated at 100% in `vite.config.ts`.

## Screens (routes)

| Route | Screen |
| --- | --- |
| `/` | **Upload** — drag & drop or choose an image file. An optional "testing hint" field drives the recogniser (`500`, `1.5l`, `none`). |
| `/scan/:scanId/confirm` | **Confirm** — the guess with Yes / No. "No" (or an unidentified item) opens a size picker: the 3 nearest standard sizes, expandable to the full 24-size catalogue. |
| `/scan/:scanId/ideas` | **Ideas** — grid of upcycling ideas for the chosen size (photo + name). |
| `/scan/:scanId/idea/:ideaId` | **Guide** — tools & materials first, then illustrated plain-language steps (blueprint style, tips/warnings), then a 3D preview to compare against. |

## Structure

```
src/
  data/catalogue.ts   GENERATED from src/data/content.ts — 24 bottle sizes + 4 detailed ideas
  lib/
    api.ts            local/remote switch + re-exports
    localApi.ts       in-browser API: bundled data + on-device recogniser
    httpApi.ts        typed fetch client for the real backend
    useScan.ts        load a scan (from router state, or refetch on refresh)
  components/          Button, Card, Header (step progress), Feedback, icons (inline SVG)
  pages/              UploadPage, ConfirmPage, IdeasPage, GuidePage (+ per-page .css)
  styles/global.css   Eco Playful design tokens
public/media/          GENERATED placeholder SVG artwork
scripts/build-data.ts  the generator behind `npm run gen:data`
```

## Notes

- No user accounts — a run is anchored by the `scanId` in the URL hash.
- In local mode, scan progress is kept in `sessionStorage`, so a refresh
  mid-flow keeps working.
- `public/media/**` is placeholder art. Replace those SVGs with real photos and
  `.glb` files (same names) and the app picks them up — or regenerate with
  `npm run gen:data` after editing the backend seed.
