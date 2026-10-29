// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 正式網域確定後改 SITE_URL，canonical / OG / sitemap 都會用到
  site: process.env.SITE_URL || 'https://example.pages.dev',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
