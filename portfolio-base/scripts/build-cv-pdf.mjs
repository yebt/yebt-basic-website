#!/usr/bin/env node
/**
 * Prints the /cv page to `public/cv.pdf` (`npm run cv:pdf`).
 *
 * 1. Builds the site (skip with `--no-build` when dist/ is fresh).
 * 2. Serves dist/ on a local port and prints /cv/ with headless Chrome, using
 *    the page's print stylesheet (@page size and margins). The PDF keeps real,
 *    selectable text, so applicant tracking systems can read it.
 * 3. Copies the PDF into dist/ as well. When public/cv.pdf did not exist
 *    before, rebuilds once so the site's CV action points to the PDF.
 *
 * Chrome: set CHROME_PATH, or a standard install is looked up.
 */
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const output = join(root, 'public', 'cv.pdf');
const skipBuild = process.argv.includes('--no-build');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
};

function fail(message) {
  console.error(`cv:pdf: ${message}`);
  process.exit(1);
}

function build() {
  const result = spawnSync('npx', ['astro', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) fail('astro build failed');
}

/** Minimal static server for dist/: files, and index.html for directories. */
function serve() {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = normalize(join(dist, pathname));
    if (!file.startsWith(dist)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

function print(chrome, url) {
  const profile = mkdtempSync(join(tmpdir(), 'cv-pdf-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=4000',
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${output}`,
    url,
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

const existed = existsSync(output);
if (!skipBuild) build();
if (!existsSync(join(dist, 'cv', 'index.html'))) fail('dist/cv/index.html is missing; run without --no-build.');

const server = await serve();
const { port } = server.address();
try {
  if (existed) rmSync(output);
  await print(chrome, `http://127.0.0.1:${port}/cv/`);
} catch (error) {
  fail(error.message);
} finally {
  server.close();
}
copyFileSync(output, join(dist, 'cv.pdf'));
console.log(`cv:pdf: wrote ${output} (${statSync(output).size} bytes)`);

if (!existed && !skipBuild) {
  console.log('cv:pdf: first PDF, rebuilding so the CV action links to it');
  build();
}
