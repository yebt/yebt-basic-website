import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().int(),
    /** Architecture style, e.g. HEXAGONAL. */
    arch: z.string(),
    stack: z.array(z.string()).min(1),
    /** Single explainer video (YouTube watch or youtu.be URL). */
    video: z.url().optional(),
    /** Playlist about the project's design system. */
    playlist: z.url().optional(),
    /** Short label shown on the card, e.g. "WALKTHROUGH 12:04". */
    videoLabel: z.string(),
    repo: z.url().optional(),
    live: z.url().optional(),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().int(),
  }),
});

const garden = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/garden' }),
  schema: z.object({
    title: z.string(),
    stage: z.enum(['seedling', 'budding', 'evergreen']),
    tags: z.array(z.string()).min(1),
    updated: z.coerce.date(),
  }),
});

export const collections = { projects, garden };
