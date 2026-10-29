// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // 正式網域確定後改 SITE_URL，canonical / OG 會用到
  site: process.env.SITE_URL || 'https://example.pages.dev',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
