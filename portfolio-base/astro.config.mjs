// @ts-check
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { externalLinksPlugin } from './src/lib/links.ts';

// https://astro.build/config
export default defineConfig({
  markdown: {
    // External links in Markdown content open in a new tab, like the rest of the site.
    processor: satteri({ hastPlugins: [externalLinksPlugin] }),
  },
});
