// @ts-check
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';
import { externalLinksPlugin } from './src/lib/links.ts';

// https://astro.build/config
export default defineConfig({
  // MDX content (projects, notes) can use the components in src/components/content.
  // It inherits the Markdown processor below, so its external links get the same rules.
  integrations: [mdx()],
  markdown: {
    // External links in Markdown content open in a new tab, like the rest of the site.
    processor: satteri({ hastPlugins: [externalLinksPlugin] }),
  },
});
