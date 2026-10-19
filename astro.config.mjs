import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://fscreativestudio.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
