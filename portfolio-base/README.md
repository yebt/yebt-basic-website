# yebt.dev — Grid Console

Portfolio of Yahir Eduardo Bravo, software architect. Astro 7, static output, no UI framework.

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build the static site to `./dist/`      |
| `npm run preview` | Preview the build                       |

## Structure

- `src/styles/global.css` — design tokens (dark default, light via `data-theme="light"` or `prefers-color-scheme`).
- `src/layouts/BaseLayout.astro` — head, no-flash theme script, grain overlay, skip link, header.
- `src/components/` — presentational components (`Nav`, `ThemeToggle`, `SiteHeader`, ...).
