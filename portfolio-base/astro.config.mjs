// @ts-check
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { externalLinksPlugin } from './src/lib/links.ts';

/**
 * Public origin of the deployed site, from `SITE_URL` (shell env or a `.env*`
 * file, see `.env.example`). It makes canonical and Open Graph URLs absolute.
 * Unset: `site` stays undefined and those URLs remain relative.
 */
function siteUrl() {
  const mode = process.argv.includes('dev') ? 'development' : 'production';
  const value = (process.env.SITE_URL ?? loadEnv(mode, process.cwd(), '').SITE_URL ?? '').trim();
  if (!value) {
    console.warn('[site] SITE_URL is not set: canonical and og:image URLs will be relative. See .env.example.');
    return undefined;
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`SITE_URL must be an absolute http(s) URL, got "${value}".`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`SITE_URL must use http or https, got "${value}".`);
  }
  return url.origin;
}

// https://astro.build/config
export default defineConfig({
  site: siteUrl(),
  // MDX content (projects, notes) can use the components in src/components/content.
  // It inherits the Markdown processor below, so its external links get the same rules.
  integrations: [mdx()],
  markdown: {
    // External links in Markdown content open in a new tab, like the rest of the site.
    processor: satteri({ hastPlugins: [externalLinksPlugin] }),
  },
});
