# yebt.dev — Grid Console

Portfolio of Yahir Eduardo Bravo, Lead Developer focused on software architecture. Astro 7, static output, no UI framework.

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build the static site to `./dist/`      |
| `npm run preview` | Preview the build                       |
| `npm test`        | Run unit tests (Vitest)                 |
| `npm run og`      | Render the social card to `public/og.png` |
| `npm run cv:pdf`  | Print `/cv` to `public/cv.pdf`          |

## Deployment: `SITE_URL`

Set `SITE_URL` to the public origin (absolute `http(s)` URL, e.g. `https://yebt.dev`) in the host's build
environment or in a local `.env` (see `.env.example`; `.env` files are gitignored). `astro.config.mjs`
validates it and uses it as `site`, so canonical and `og:image` URLs are absolute. Without it the build still
works, prints one warning and keeps those URLs relative, which most social previews ignore.

`npm run og` renders `public/og.png` (1200 × 630) from `scripts/build-og.mjs` with headless Chrome (set
`CHROME_PATH` if it is not in a standard location; Node >= 22.18 to load the plant mark from TypeScript). The
card shows the domain from `SITE_URL`, falling back to `yebt.dev`. Rerun it and commit the PNG after changing
the name, the headline or the domain.

## Structure

- `src/styles/global.css` — design tokens (dark default, light via `data-theme="light"` or `prefers-color-scheme`).
- `src/layouts/BaseLayout.astro` — head, no-flash theme script, grain overlay, skip link, header.
- `src/components/` — presentational components (`Nav`, `ThemeToggle`, `SiteHeader`, ...).
- `src/lib/ascii.ts` — pure ASCII portrait logic (tested in `ascii.test.ts`); `AsciiBackground.astro` draws it on a fixed canvas.
- `src/data/site.ts` — site facts and placeholders (email, CV, social links, city) plus the Practice list.
- `src/lib/youtube.ts`, `src/lib/filter.ts` — tested helpers for privacy-friendly video embeds and the stack filter.
