import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Netlify setzt URL automatisch. Bei eigener Domain hier eintragen.
const site = process.env.URL || 'https://www.daemmmit.at';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !/\/(danke|warenkorb|admin)\//.test(p) })],
});
