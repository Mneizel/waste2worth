# Waste 2 Worth

Photograph something you would throw away, and the app shows you how to turn it
into something useful — with simple, picture-led, step-by-step guides.

**MVP scope:** plastic & glass **bottles**.

## How it works

1. Open the app, upload (or take) a photo of a bottle.
2. It identifies the bottle and guesses the size (e.g. *"water bottle, 250 ml"*).
3. You confirm — or, if it's wrong, pick from 3 standard bottle sizes.
4. You get a list of upcycling ideas (each just a name + a photo of the result).
5. Tap one → see the tools and materials you need.
6. Then follow illustrated, plain-language steps (works even if you can't read).
7. At the end, a 3D view of the finished object to compare against yours.

## Repo layout

```
Hussa/
  frontend/   The app. React + Vite + TypeScript. Runs FULLY IN THE BROWSER by
              default (bundled data + on-device recogniser) — no backend needed.
              `npm run build` -> a static site you can host anywhere.
              102 tests, 100% coverage. See frontend/README.md.

  backend/    The "real" API for the production version. Node + Express + Prisma.
              134 tests, 100% coverage. Not needed for the prototype.
              See backend/README.md.

  design/     Claude Design canvas — the 4 explored frontend directions.
```

## Try the prototype (no coding)

```bash
cd frontend
npm install
npm run build        # produces frontend/dist/  — a plain static website
```

Then host `frontend/dist/`:

- **Netlify Drop:** drag the `dist` folder onto <https://app.netlify.com/drop>.
- **GitHub Pages:** push this repo, then Settings → Pages → Source: *GitHub
  Actions* (the workflow in `.github/workflows/deploy.yml` does the rest).

Full instructions in [frontend/README.md](frontend/README.md#deploy-the-prototype-for-the-judging-committee).

## Roadmap

- [x] **Backend API** — data model, full flow, seeded catalogue + ideas,
      pluggable vision, 100% tested.
- [x] **Web frontend** — file upload, confirm/correct, ideas, illustrated guide,
      3D preview. Bilingual, RTL, "Eco Playful".
- [x] **Static prototype** — the frontend running with zero infrastructure, for
      the judging committee.
- [ ] Real AI vision provider (swap the on-device recogniser).
- [ ] Package as a mobile app (React Native) against the backend API.

## For local development against the real backend

```bash
# terminal 1
cd backend && npm run dev        # http://localhost:4000

# terminal 2
cd frontend
echo "VITE_API_MODE=remote" >> .env
npm run dev                      # http://localhost:5173
```
