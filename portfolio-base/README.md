# yebt.dev — Grid Console

Portfolio of Yahir Eduardo Bravo, software architect. Astro 7, static output, no UI framework.

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build the static site to `./dist/`      |
| `npm run preview` | Preview the build                       |
| `npm test`        | Run unit tests (Vitest)                 |

## Structure

- `src/styles/global.css` — design tokens (dark default, light via `data-theme="light"` or `prefers-color-scheme`).
- `src/layouts/BaseLayout.astro` — head, no-flash theme script, grain overlay, skip link, header.
- `src/components/` — presentational components (`Nav`, `ThemeToggle`, `SiteHeader`, ...).
- `src/lib/ascii.ts` — pure ASCII portrait logic (tested in `ascii.test.ts`); `AsciiBackground.astro` draws it on a fixed canvas.
- `src/data/site.ts` — site facts and placeholders (email, CV, social links, city) plus the Practice list.
- `src/lib/youtube.ts`, `src/lib/filter.ts` — tested helpers for privacy-friendly video embeds and the stack filter.
