# Feature: portfolio-grid-console

Locator: `odd/tasks/portfolio-grid-console.md` · Engram mirror: `odd/portfolio-grid-console/tasks`

## Objective
Implement the approved "Grid Console" design (canvas https://claude.ai/artifact/V7EnnXJgEgDhSAHPwCfjXn, page v3, `Home.dc.html`) as the real Astro 7 site in `portfolio-base/`.

## Problem / why
The repo only holds the Astro starter. The user approved the v3 direction: home based on `references/f67f4ae046e6e0ca4936e27b2aa1f5de.jpg` (3×3 hairline grid, centered mono block, blinking cursor), portrait as a progressive ASCII background (cells 40→6 px over a low-res blurred photo), grain overlay, rustic frosted cards, profile = software architect, light + dark.

## Scope
- Home with hero + scroll sections (selected work, practice, garden, contact).
- Projects index filtered by stack, project detail with video/playlist.
- Garden index and note page.
- Content as Markdown content collections (Keystatic later, out of scope).

## Constraints
- Astro 7, static output, no UI framework needed (vanilla TS in `<script>`).
- Light and dark themes, no flash on load, respects `prefers-color-scheme` and a manual toggle.
- `prefers-reduced-motion`: ASCII renders final state, no caret blink.
- Fonts self-hosted (Share Tech Mono, Geist Mono).
- English UI copy; placeholder content clearly marked.
- Accessible: semantic landmarks, focus styles, contrast ≥ 4.5:1, canvas `aria-hidden`.

## Delivery strategy
`ask-on-risk` (default). Forecast ~900–1200 authored lines → over the 400-line budget; chain strategy to be asked before the next commit if exceeded.

## Tasks
- [x] T1 Foundation: deps, fonts, tokens (dark/light), theme toggle without flash, base layout with grain + direction contract comment, remove starter.
- [x] T2 Content collections: `projects` and `garden` schemas + placeholder entries.
- [x] T3 ASCII background: pure module (luminance → char, grid sizing, placement) with Vitest tests (RED → GREEN) + canvas component (steps, resize, theme, reduced motion).
- [x] T4 Home page: hero grid, latest 3 projects cards, practice, garden list, contact.
- [x] T5 Projects: index with stack filter (works without JS), detail page with video/playlist.
- [x] T6 Garden: index + note page with stage and tags.
- [x] T7 Remove the ASCII readout ("N × M CELLS · XPX") and the REPLAY button from the home hero (user feedback 2026-10-13).
- [x] T8 Smoother ASCII resolve: more, finer sequential steps; character ramp grows with each step (few chars at large cells → full ramp at small cells); crossfade between steps; fade-in of the blurred portrait once the image loads. Reduced motion: final state, no fades.
- [x] T9 Brand mark: SVG favicon (light/dark aware) plus apple-touch icon, web manifest icons and a default OG image, wired in the base layout.

## Acceptance criteria
- `npm run build` passes; `npm test` passes.
- Home matches `Home.dc.html` structure and look in both themes.
- Filter by stack works; every project/note page renders.

## Checks
- `npm run build`, `npx vitest run`, impeccable detector on changed UI.

## Progress / evidence
- Branch: `feat/grid-console`.
- Route: delegated direct (writer trigger: 2+ non-trivial files).
- T1 `37e1582` feat(portfolio): foundation. Check: `npm run build` -> 1 page built, direction contract is first child of <body>. Test-first exception: no runnable logic (layout/CSS/theme script).

- T2 `e11573f` feat(content): collections. Check: `npm run build` -> schemas validate, 3 projects + 4 notes loaded. Test-first exception: schema validated by the build itself.

- T3 `8d5f3d2` feat(ascii). RED: `npx vitest run` -> 14 failed (empty module). GREEN: 14 passed. `npm run build` -> passes, portrait emitted as 320px webp.

- T4 `e10e23c` feat(home). Check: `npm run build` passes. Test-first exception: presentational markup only.
- T5 `fa7b487` feat(projects). RED: `npx vitest run` -> 17 failed (youtube + filter helpers). GREEN: 31 passed. `npm run build` -> 5 pages; ledger-core renders youtube-nocookie iframe with title; atlas-ds (playlist) renders link only.

- T6 `e95f678` feat(garden). RED: 2 failed (groupByStage). GREEN: 33 passed. `npm run build` -> 10 pages.
- Polish `a3d9bff` fix(portfolio): veil chips behind hero text on the portrait (contrast), space between pitch spans, UTC note dates. Visual round: headless Chrome 1440x900 dark/light and 360px home/projects/garden, no horizontal scroll.
- Final checks: `npx vitest run` -> 4 files, 33 passed; `npm run build` -> 10 pages; impeccable `detect.mjs --json src` -> [] (no findings).

- T7 `2c87a5e` refactor(home): readout chip, REPLAY button, their styles, `.hide-sm` and the canvas hooks removed. Route: delegated direct (writer trigger: 2+ non-trivial files). Checks: `npx vitest run` -> 33 passed; `npm run build` -> 10 pages. Test-first exception: markup/CSS removal only.
- T8 `a98f36e` feat(ascii): `stepSequence` (geometric 40->6, 14 steps: 40,35,30,26,22,19,17,14,12,11,9,8,7,6), `rampForStep` (4 chars -> full RAMP, order preserved), `easeOut`; STEP_MS 240 (3.36 s), 200 ms crossfade via two offscreen frames + rAF, 800 ms canvas fade-in after image + font load. RED: 12 failed / 33 passed. GREEN: 45 passed. `npm run build` -> 10 pages. Headless Chrome (playwright-core + system Chrome) 1440x900 dark/light, 360x800: canvas opacity 0 -> 1 over ~0.9 s, no readout/replay, no horizontal scroll, final frame unchanged; reduced motion -> `is-ready`, transition 0s, final step drawn.
- T9 `eacab5a` feat(brand): favicon.svg (solid isometric-layers mark, prefers-color-scheme aware), favicon.ico (16+32 PNG-in-ICO), apple-touch-icon 180, icon-192/512 (dotted mark in hairline cell), site.webmanifest, og.png 1200x630 (rendered from HTML in headless Chrome with the self-hosted fonts); head wired with theme-color light/dark and OG/Twitter defaults. `site` is not set in astro.config.mjs, so og:image is relative (`/og.png`) and og:url is omitted until it is. Checks: 45 passed; build 10 pages; dist contains all assets and dist/index.html references them; manifest served as application/manifest+json.

## Next step
Parent: review assessment / delivery decision (chain strategy, since the branch exceeds ~400 authored lines). Replace placeholders in `src/data/site.ts` and content Markdown.
