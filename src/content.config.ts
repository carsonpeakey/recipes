import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseFields = {
  title: z.string(),
  summary: z.string().optional(),
  version: z.string().default('v1.0.0'),
  tags: z.array(z.string()).default([]),
};

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    ...baseFields,
  }),
});

const techniques = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/techniques' }),
  schema: z.object({
    ...baseFields,
  }),
});

export const collections = { recipes, techniques };
