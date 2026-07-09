// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://asil-impro.fr',
  // Depuis Astro 5, le mode "hybrid" a fusionné avec "static" :
  // les pages sont pré-rendues, sauf celles marquées `prerender = false`
  // (routes Keystatic + API contact), servies en SSR via l'adapter Vercel.
  output: 'static',
  adapter: vercel(),
  integrations: [react(), markdoc(), keystatic(), sitemap({
    filter: (page) => !page.includes('/keystatic'),
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});
