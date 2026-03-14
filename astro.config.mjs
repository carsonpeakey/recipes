// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import remarkSections from './src/plugins/remark-sections.ts';
import rehypeWrapTables from './src/plugins/rehype-wrap-tables.ts';

export default defineConfig({
  site: 'https://carsonpeakey.recipes',
  output: 'static',
  outDir: 'dist',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkDirective, remarkSections],
    rehypePlugins: [rehypeWrapTables],
  },
});
