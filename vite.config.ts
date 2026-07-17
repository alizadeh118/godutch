import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    // Auto-import Vuetify components & styles, tree-shaken.
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'img/icons/*.png', 'img/icons/*.svg'],
      manifest: {
        name: 'GoDutch',
        short_name: 'GoDutch',
        description: 'Split shared expenses on trips with friends.',
        theme_color: '#1867c0',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'img/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: 'img/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'img/icons/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'img/icons/mstile-150x150.png', sizes: '150x150', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Inline Vuetify so Vite transforms its .css imports (Node can't load them).
    server: { deps: { inline: ['vuetify'] } },
  },
})
