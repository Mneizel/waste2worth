# Waste 2 Worth — Frontend

Web client for the Waste 2 Worth flow. **React + Vite + TypeScript**, styled in the
"Eco Playful" direction (warm paper tones, rounded cards, chunky buttons),
Arabic-first / bilingual, RTL.

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

`npm run gen:data` regenerates `src/data/catalogue.ts` and the placeholder artwork
in `public/media/` from the backend seed (only needed if the seed changes).

## Deploy the prototype (for the judging committee)

The build in `dist/` is plain HTML/CSS/JS — host it anywhere, no server:

- **Netlify Drop (fastest):** go to <https://app.netlify.com/drop> and drag the
  whole `dist` folder onto the page. You get a public link in seconds.
- **GitHub Pages (automatic):** push this repo to GitHub, then in
  **Settings → Pages** set **Source: GitHub Actions**. The workflow in
  `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
  The link is `https://<your-username>.github.io/<repo-name>/`.
- **GitHub Pages (manual upload):** create a repo, upload the **contents** of
  `dist/`, then **Settings → Pages → Deploy from a branch → main → /(root)**.

`base: './'` + `HashRouter` mean the site works from any host and any sub-path,
including opening it through a local static server.

## Tests

```bash
npm test              # Vitest run (102 tests)
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
  data/catalogue.ts   GENERATED — 24 bottle sizes + 10 ideas (with tools & steps)
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
