# jacksonbarker.com

Personal site. Astro, static output, deployed to Vercel.

Built from the specification in `../Claude - Site Details/`. That folder is the
authority: `01` for structure, `02` for anything visual, `03` and `04` for every
string. Where this code departs from it, the reason is in a comment at the point
of departure and the departure is listed in the session report.

## Running it

Node 24 is installed at `~/.local/node` and is on `PATH` via `~/.zshrc`.

```
npm install
npm run dev        # local dev server
npm run build      # astro build, then the copy checks
npm run check      # the copy checks alone
npm run assets     # regenerate favicons, hero set, and the OG image from ../Images
npm run fonts      # re download the woff2 faces and trim the Archivo axes
```

`npm run build` fails if a check fails. That is deliberate.

## Checks

| Script | What it enforces |
|---|---|
| `scripts/check-dashes.mjs` | No em dash, en dash, or hyphenated compound in any rendered string. Text nodes only, so slugs and URLs are exempt. |
| `scripts/check-counts.mjs` | Every teaser count equals the number of published entries in the collection it points at. |
| `scripts/check-content.mjs` | Dashes across all thirty eight content bodies, and the list of undated pieces. |

`scripts/dev/` holds the measurement and audit tools used to derive and verify
the build: the name lockup sweep, the positioning statement fit, the contrast
and keyboard audit, Lighthouse, reduced motion, and a verbatim copy diff against
file `03`. They are not part of the build. They exist so the numbers baked into
the CSS can be re-derived rather than trusted.

## Where things live

```
src/lib/routes.ts        one label per route, used by nav, headers, and titles
src/data/metrics.ts      every figure, with its word form and its scope
src/data/copy/           every string, transcribed from files 03 and 04
src/content.config.ts    the three collection schemas
src/content/             38 content files, copied in from Writings/
src/styles/tokens.css    every token from file 02, each value defined once
src/components/          the page components
scripts/                 build checks and asset generation
```

Nothing hardcodes a number into a component. Nothing hardcodes a route label
into two places.

## Fonts

Self hosted from `public/fonts`, latin subset, five files. Archivo is the two
axis variable font with its axes limited to the ranges the scale uses, wght 200
to 800 and wdth 75 to 100, which is 18 percent smaller than the file Google
serves. Archivo and Plex Mono 400 are preloaded; they carry the name lockup and
the role line under it. Regenerate with `npm run fonts`.

There are no third party requests on any page.

## Content

Thirty eight files in three collections, copied from `Writings/` and given the
frontmatter written in files 05, 06, and 07. The originals stay where they are;
`npm run import:content` re-runs the copy and refuses to write if any file's
written title disagrees with its metadata record.

Malformed frontmatter fails the build. Tag vocabularies are fixed per collection,
excerpts are capped at 160 characters, and `readingTime` is verified against
`ceil(wordCount / 240)` rather than trusted.

Fifteen pieces carry `⟦YYYY-MM-DD⟧` and are listed by `npm run check`. Library
entries have no date field by design; see the session report.

## Not built yet

Stage 4 (the interactive resume), stages 5 to 8 (the remaining routes). The
collections exist but nothing renders them yet: index pages and entry templates
are stage 6. Nav links and teasers point at their real paths and return 404
until those stages land, by instruction. There are no stub pages.

There is no `/500` route. Astro's 500 page is an SSR only convention and this is
a static build, so nothing would ever route to it. The copy is kept in
`src/data/copy/system.ts` for the moment any route becomes server rendered.
