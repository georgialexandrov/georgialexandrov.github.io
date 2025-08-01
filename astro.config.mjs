// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://georgi.alexandrov.dev',
  prefetch: false,
  markdown: {
    syntaxHighlight: 'prism',
  }
});