# Adding a new category (beyond bottles)

Waste 2 Worth is meant to eventually cover any recyclable/upcyclable item —
not just bottles. The bottle category is the first one, built end-to-end as
the template. This is the checklist for adding the next one (a can, a jar, a
cardboard box, wood, fabric, a shoe, a tire, ...).

**Do this gradually, one category at a time.** Each one is real, scoped work
— roughly the same size as the whole bottle category was. Don't stub several
at once; finish one fully (real sizes, real sourced ideas, a real blueprint
engine) before starting the next.

## 0. Register it (so the roadmap UI is honest)

Add an entry to `src/data/categories.ts` with `status: 'soon'` first (it just
shows in the "coming soon" list on the upload screen), then flip it to
`'available'` once steps 1–5 below are actually done. Never mark a category
`'available'` before it has real content — the whole point of that list is
that it doesn't overclaim.

## 1. Size model

Bottles use `Variant` (`heightMm`, `diameterMm`, `volumeMl`, `materialType`).
A new category almost certainly needs different fields — a shoe cares about
length and EU size, a wood plank about length/width/thickness, a fabric
piece about area. Don't force it into the bottle's fields.

- Extend `src/lib/types.ts` with whatever the category actually needs (or,
  once there are 2+ non-bottle categories, generalize `Variant` into a
  tagged union / a generic `dimensions: Record<string, number>` bag — don't
  do that speculatively for category #2, it's premature).
- Seed 15–25 standard real-world sizes for the category, the same way
  `backend/src/seed/bottleSizes.ts` did for bottles: real, common, sourced
  measurements — not invented numbers.
- Arabic labels go in a `*_LABELS_AR` map next to `VARIANT_LABELS_AR` in
  `src/data/content.ts`.

## 2. Recognition

`src/lib/localApi.ts`'s `createScan` currently always guesses `categoryKey:
'bottle'`. When a second category exists, generalize this into a small
per-category recognizer table (`Record<categoryKey, (hint) => Guess>`) so the
"hint" testing mode (`500`, `1.5l`, `none`) can address the new category too
— agree on a hint syntax for it first (e.g. a shoe might use `size:42`).

## 3. Ideas — real, sourced, and MANY

Same bar as the bottle content in `src/data/content.ts`:

- Every idea needs a **real published method** (Instructables, wikiHow, Red
  Ted Art, The Spruce Crafts, a library/museum craft guide, ...) named in its
  `source` field. Wording and diagrams are ours; the method and measurements
  come from the source.
- **Don't ship 2–3 ideas and call the category done.** The bar the user set
  is a genuinely useful, comprehensive set of ideas per category — the same
  ambition as "كل الاحتمالات يللي في الدنيا" from the original brief. Bottles
  shipped with 4 as a deliberately small first slice; a category is not
  finished at that size.
- Bring one real source link per idea when starting a category — that's the
  fastest way to convert it into real Arabic steps + measurements (see how
  the 4 bottle ideas were built from Instructables/Red Ted Art/The Spruce/
  NOAA sources).

## 4. Blueprint engine (the hard part)

`src/components/blueprintSvg.ts` is entirely bottle-shaped: `bottleGeo()`
draws a cap/neck/shoulder/body/base silhouette, and the whole `BpOp` /
`State` / `drawState` / `drawAction` model is built around what you can do to
*that* shape (cut it, invert a piece into another, push a rod through it,
fill it). A shoe or a plank of wood shares none of that geometry.

Each category needs its **own** sibling module with the same three exports,
built the same way the bottle one was (see the git history for
`src/components/blueprintSvg.ts` for the design pattern — a `fold(ops) →
State`, a `drawState(state)`, a `drawAction(state, op)`, plus a
`renderFinalArt` that folds the *whole* op list):

```ts
// src/components/<category>Svg.ts
export type <Category>Op = /* this category's vocabulary, e.g. 'cut' | 'sand' | 'drill' | 'glue' | ... */;
export interface <Category>BlueprintOpts { ops, fracs, index, variant, instruction, ... }
export function renderBlueprint(o: <Category>BlueprintOpts): string { ... }
export function renderFinalArt(o: <Category>FinalArtOpts): string { ... }
```

Then `Blueprint.tsx` / `FinalArt.tsx` (or new category-aware wrappers around
them) dispatch to the right module by the idea's category. Keep each
category's geometry file self-contained — don't try to build one "universal"
shape engine, it doesn't exist for genuinely different physical objects.

## 5. Wire it into the app + regenerate

- `scripts/build-data.ts`: add the category's seed sizes + ideas into the
  generated `catalogue.ts`/`media.ts`, the same way bottles are folded in.
  Run with `npx tsx scripts/build-data.ts` (there's no `npm run gen:data`
  script — call it directly).
- `ConfirmPage` / `IdeasPage` / `GuidePage`: check for any bottle-only
  copy or assumptions once a second category exists (right now "قنينة"
  is hardcoded in a few strings because there's only one category).
- Add tests the same way `blueprintSvg.test.ts` covers every op — 100%
  coverage is enforced project-wide (`vite.config.ts` thresholds).
