#!/usr/bin/env node
/**
 * Renders the social preview card to `public/og.png` (`npm run og`), 1200 × 630.
 *
 * The card is plain HTML (concrete background, hairline grid, frosted module,
 * the plant mark, name, headline, domain and an orange cable) screenshotted
 * with headless Chrome, the same dependency `build-cv-pdf.mjs` uses. Fonts
 * are the self-hosted @fontsource files; the mark comes from src/data/plant.ts.
 * The domain comes from SITE_URL (shell or `.env*`), falling back to yebt.dev.
 *
 * Chrome: set CHROME_PATH, or a standard install is looked up.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'public', 'og.png');
const WIDTH = 1200;
const HEIGHT = 630;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function fail(message) {
  console.error(`og: ${message}`);
  process.exit(1);
}

/** Host name shown on the card: SITE_URL's host, or yebt.dev. */
function domain() {
  const value = (process.env.SITE_URL ?? loadEnv('production', root, '').SITE_URL ?? '').trim();
  if (!value) return 'yebt.dev';
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    fail(`SITE_URL must be an absolute http(s) URL, got "${value}".`);
  }
}

let plant;
try {
  ({ plant } = await import(pathToFileURL(join(root, 'src', 'data', 'plant.ts')).href));
} catch (error) {
  fail(`could not load src/data/plant.ts (Node >= 22.18 strips TypeScript types): ${error.message}`);
}

const font = (path) => pathToFileURL(join(root, 'node_modules', '@fontsource', path)).href;
const host = domain();

const mark = `
<svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
  <g fill="none" stroke="#ecece6" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
    ${['stem', 'ground', 'leafLow', 'veinLow', 'leafHigh', 'veinHigh', 'bud'].map((k) => `<path d="${plant[k]}"/>`).join('')}
  </g>
  ${plant.nodes.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="1.4" fill="#ff6a1f"/>`).join('')}
</svg>`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Share Tech Mono'; src: url('${font('share-tech-mono/files/share-tech-mono-latin-400-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'Geist Mono'; font-weight: 400; src: url('${font('geist-mono/files/geist-mono-latin-400-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'Geist Mono'; font-weight: 500; src: url('${font('geist-mono/files/geist-mono-latin-500-normal.woff2')}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #151615; }
  body { position: relative; color: #ecece6; font-family: 'Geist Mono', monospace; }
  /* Concrete: soft blotches (low-frequency noise, compresses well) and a warm spill. */
  .concrete { position: absolute; inset: 0; opacity: 0.5; mix-blend-mode: soft-light; }
  .spill { position: absolute; inset: 0;
    background:
      radial-gradient(42% 60% at 86% 78%, rgba(255, 106, 31, 0.16), transparent 70%),
      radial-gradient(60% 70% at 18% 10%, rgba(236, 236, 230, 0.05), transparent 70%); }
  /* The home hero's 3 × 3 hairline grid. */
  .grid { position: absolute; inset: 0;
    background:
      linear-gradient(90deg, transparent calc(33.333% - 0.5px), rgba(236,236,230,0.1) 0 calc(33.333% + 0.5px), transparent 0 calc(66.666% - 0.5px), rgba(236,236,230,0.1) 0 calc(66.666% + 0.5px), transparent 0),
      linear-gradient(180deg, transparent calc(33.333% - 0.5px), rgba(236,236,230,0.1) 0 calc(33.333% + 0.5px), transparent 0 calc(66.666% - 0.5px), rgba(236,236,230,0.1) 0 calc(66.666% + 0.5px), transparent 0); }
  .module { position: absolute; left: 64px; top: 64px; width: 760px; height: 438px; padding: 56px 56px 0;
    border: 1px solid rgba(236, 236, 230, 0.2);
    background: radial-gradient(120% 70% at 50% 0%, rgba(236,236,230,0.06), transparent 70%), rgba(27, 28, 27, 0.72);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px -28px rgba(0,0,0,0.8); }
  .mark { display: block; width: 76px; height: 76px; }
  h1 { margin-top: 36px; font-family: 'Share Tech Mono', monospace; font-weight: 400; font-size: 64px;
    line-height: 1.05; letter-spacing: 0.04em; text-transform: uppercase; }
  .role { margin-top: 22px; font-size: 26px; color: #b4b7b1; letter-spacing: 0.01em; }
  .domain { position: absolute; right: 64px; top: 72px; display: flex; align-items: center; gap: 14px;
    font-family: 'Share Tech Mono', monospace; font-size: 26px; letter-spacing: 0.14em; text-transform: uppercase; color: #ecece6; }
  .domain::before { content: ''; width: 12px; height: 12px; background: #ff6a1f; box-shadow: 0 0 12px rgba(255,106,31,0.7); }
  .cable { position: absolute; inset: 0; overflow: visible; }
</style></head><body>
  <svg class="concrete" width="${WIDTH}" height="${HEIGHT}" aria-hidden="true">
    <filter id="c"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#c)"/>
  </svg>
  <div class="spill"></div>
  <div class="grid"></div>
  <svg class="cable" width="${WIDTH}" height="${HEIGHT}" aria-hidden="true">
    <defs><filter id="glow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <path id="run" d="M64 548 H930 C1010 548 1040 520 1060 470 S1110 380 1200 372" fill="none"/>
    <use href="#run" stroke="rgba(255,106,31,0.55)" stroke-width="10" filter="url(#glow)"/>
    <use href="#run" stroke="#ff6a1f" stroke-width="4" stroke-linecap="round"/>
    <use href="#run" stroke="#ffc49a" stroke-width="1" stroke-opacity="0.7"/>
    <circle cx="64" cy="548" r="7" fill="#151615" stroke="#b9c0c6" stroke-width="2"/>
  </svg>
  <section class="module">
    ${mark}
    <h1>Yahir Eduardo Bravo</h1>
    <p class="role">Lead Developer · Software Architecture</p>
  </section>
  <p class="domain">${host}</p>
</body></html>`;

function shoot(chrome, file) {
  const profile = mkdtempSync(join(tmpdir(), 'og-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    `--window-size=${WIDTH},${HEIGHT}`,
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=3000',
    `--user-data-dir=${profile}`,
    `--screenshot=${output}`,
    pathToFileURL(file).href,
  ];
  return new Promise((done, reject) => {
    const child = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let log = '';
    child.stderr.on('data', (chunk) => (log += chunk));
    child.on('error', reject);
    child.on('exit', (code) => {
      rmSync(profile, { recursive: true, force: true });
      if (code === 0 && existsSync(output)) done();
      else reject(new Error(`Chrome exited with ${code}\n${log.slice(-2000)}`));
    });
  });
}

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chrome) fail('Chrome not found; set CHROME_PATH to a Chrome or Chromium binary.');

const work = mkdtempSync(join(tmpdir(), 'og-card-'));
const card = join(work, 'card.html');
writeFileSync(card, html);
rmSync(output, { force: true });
try {
  await shoot(chrome, card);
} catch (error) {
  fail(error.message);
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(`og: wrote ${output} (${WIDTH}×${HEIGHT}, ${statSync(output).size} bytes, domain ${host})`);
