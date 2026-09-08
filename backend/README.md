# Waste 2 Worth — Backend

REST API for the Waste 2 Worth flow: photograph a waste item (MVP: **bottles**),
confirm or correct what it is, then get illustrated, plain-language upcycling
guides for it.

- **Runtime:** Node.js + TypeScript + Express
- **DB:** Prisma ORM. SQLite for local/dev/test; switch `provider` in
  `prisma/schema.prisma` to `postgresql` for production — no schema changes needed.
- **Validation:** Zod
- **Tests:** Jest + Supertest, **100% coverage enforced** (statements, branches,
  functions, lines).
- **No user accounts.** Every request is anonymous. A `Scan` row is the unit of a
  single run through the flow.
- **Vision is pluggable.** Today a deterministic offline **stub** stands in for a
  real model (`src/lib/vision/`). Swapping in a real provider later is a
  one-file change; nothing else moves.

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run migrate:deploy      # create the SQLite schema
npm run seed                # load bottle catalogue + upcycling ideas
npm run dev                 # http://localhost:4000
```

> On first `npm install` this environment blocks package install scripts. If
> Prisma/esbuild fail to build, run:
> `npm approve-scripts @prisma/client prisma @prisma/engines esbuild` then
> `npm install` again.

## Scripts

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start with hot reload (tsx)                   |
| `npm run build`         | Type-check + compile to `dist/`               |
| `npm start`             | Run the compiled server                       |
| `npm run migrate:dev`   | Create/apply a new migration                  |
| `npm run migrate:deploy`| Apply existing migrations                     |
| `npm run seed`          | Seed catalogue + ideas (idempotent)           |
| `npm test`              | Run the test suite                            |
| `npm run test:coverage` | Run tests with the 100% coverage gate         |
| `npm run db:reset`      | Drop, re-migrate and re-seed the dev DB       |

## The flow

```
POST /api/scans                      upload a photo  -> AI guess (+ matched size)
      │
      ├── POST /api/scans/:id/confirm         accept the guess           -> CONFIRMED
      │
      └── POST /api/scans/:id/reject          reject it -> 3 alternative sizes -> REJECTED
                │
                └── POST /api/scans/:id/select-variant { variantId }     -> VARIANT_SELECTED

GET  /api/scans/:id/ideas            ideas for the settled size (name + final photo)
GET  /api/ideas/:idOrSlug            full guide: tools/materials, then steps, then 3D model
POST /api/scans/:id/select-idea { ideaId }                               -> IDEA_SELECTED
```

### Status machine (`Scan.status`)

| From                  | Action           | To                |
| --------------------- | ---------------- | ----------------- |
| `PENDING_CONFIRMATION`| `confirm`        | `CONFIRMED`       |
| `PENDING_CONFIRMATION`| `reject`         | `REJECTED`        |
| `PENDING_CONFIRMATION` / `REJECTED` / `CONFIRMED` / `VARIANT_SELECTED` | `select-variant` | `VARIANT_SELECTED` |
| `CONFIRMED` / `VARIANT_SELECTED` / `IDEA_SELECTED` | `select-idea` | `IDEA_SELECTED` |

## API reference

All responses are JSON. Success: `{ "data": ... }`. Error:
`{ "error": { "code", "message", "details?" } }`.

### Public

#### `GET /health`
Liveness probe. `{ "status": "ok", "service": "waste2worth-backend" }`.

#### `GET /api/categories`
List item categories with a `variantCount`.

#### `GET /api/categories/:key`
One category plus its `variants` (sorted). `404` if the key is unknown.

#### `GET /api/bottle-sizes`
The standard bottle-size catalogue. Query filters (all optional):
`region`, `materialType`, `common` (`true` | `false`).

#### `POST /api/scans`
`multipart/form-data`:
- `image` — the photo (required). `image/jpeg|png|webp|heic|heif`, ≤ `MAX_UPLOAD_BYTES`.
- `hint` — optional. Understood by the **stub** recogniser only:
  `none`/`unknown` → simulate "not identified"; `500` / `1500ml` / `1l` → force a volume.

`201` → the created `Scan`. `aiGuess.variant` is the catalogue size the guess was
matched to (nearest by volume), or `null`.

#### `GET /api/scans/:id`
The `Scan`. `404` if unknown.

#### `POST /api/scans/:id/confirm`
Accept the AI guess. `409` if the scan is not `PENDING_CONFIRMATION`, or if
nothing was recognised (use `select-variant` instead).

#### `POST /api/scans/:id/reject`
Reject the guess. Returns `{ data: { scan, alternatives } }` — `alternatives` is
up to 3 common sizes, closest-by-volume first (or by sort order when nothing was
recognised), excluding the rejected size. `409` if not `PENDING_CONFIRMATION`.

#### `POST /api/scans/:id/select-variant`
Body `{ "variantId": "..." }`. Sets the confirmed size. `404` for an unknown
variant, `409` from a terminal state.

#### `GET /api/scans/:id/ideas`
Published ideas for the settled size (summary: title + `finalImageUrl` +
`thumbnailUrl`). `409` while the scan is still pending.

#### `GET /api/ideas`
List published idea summaries. Filters: `variantId`, `variantKey`.

#### `GET /api/ideas/:idOrSlug`
Full guide: `tools` (tools + materials), ordered `steps` (plain instruction +
illustration + tip/warning + icon), `model3dUrl` / `model3dPreviewUrl`,
`variantKeys`. `404` if unknown or unpublished.

#### `POST /api/scans/:id/select-idea`
Body `{ "ideaId": "..." }`. `404` unknown/unpublished idea; `422` if the idea does
not apply to the confirmed size; `409` before the size is settled.

### Admin

All `/api/admin/*` routes require header `x-admin-key: <ADMIN_API_KEY>`.

| Method & path                     | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `POST /api/admin/categories`      | `{ key, name }`                            |
| `POST /api/admin/variants`        | `{ categoryKey, key, label, materialType, volumeMl, heightMm, diameterMm, region?, typicalContents?, isCommon?, sortOrder?, notes? }` |
| `PATCH /api/admin/variants/:id`   | any subset of the above (no `categoryKey`) |
| `DELETE /api/admin/variants/:id`  | —                                          |
| `POST /api/admin/ideas`           | idea fields + `variantKeys[]` + `tools[]?` + `steps[]?` |
| `PATCH /api/admin/ideas/:id`      | any subset of the top-level idea fields    |
| `DELETE /api/admin/ideas/:id`     | —                                          |

## Data model

`ItemCategory 1─* ItemVariant *─* Idea 1─* IdeaTool / IdeaStep`.
`Scan` references an AI-guessed variant, a confirmed variant, and a selected idea;
`ScanEvent` is an append-only audit trail of each step.

## Media / assets

- `GET /static/*` serves `public/` (seeded idea/step/tool artwork + `.glb` markers).
- `GET /uploads/*` serves `UPLOAD_DIR` (uploaded scan photos).
- Seeded images are **labelled SVG placeholders** and the 3D files are **markers**.
  Replace the files in `public/images/` and `public/models/` with real artwork and
  real `.glb` exports — paths and URLs stay the same.
- `MEDIA_BASE_URL` is prepended to every media URL the API returns (leave empty
  for same-origin relative URLs).

## Swapping in a real vision model

1. Add an implementation of `VisionRecognizer` (`src/lib/vision/types.ts`) next to
   `stubRecognizer.ts`.
2. Return it from `createVisionRecognizer()` in `src/lib/vision/index.ts` based on
   `env.VISION_PROVIDER` (add the new value to the enum in `src/config/env.ts`).
3. Nothing else changes — `resolveGuessVariantId()` already maps a raw
   `{ categoryKey, estimatedVolumeMl }` observation onto the catalogue.

## Environment variables

See `.env.example`. Notable: `DATABASE_URL`, `ADMIN_API_KEY`, `VISION_PROVIDER`
(`stub`), `MEDIA_BASE_URL`, `MAX_UPLOAD_BYTES`, `UPLOAD_DIR`, `CORS_ORIGIN`, `PORT`.
