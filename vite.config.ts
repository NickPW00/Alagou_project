/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const DAY = 24 * 60 * 60;

export default defineConfig({
  // Caminho base da publicação (ex.: /Alagou_project/ no GitHub Pages). Padrão: raiz.
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    tailwindcss(),
    // A3 — app instalável e funcionamento offline (docs/pacote-a/A3-pwa-rascunho.md).
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['alagou-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Alag@u — Alagou? Avisou!',
        short_name: 'Alag@u',
        description: 'Monitoramento Comunitário de Alagamentos em Duque de Caxias. Uma iniciativa do projeto Meninas pelo Clima — LabPENSo/UERJ.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0B2545',
        background_color: '#F5F8FB',
        categories: ['utilities', 'weather', 'education'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // O código do mapa só é guardado quando a pessoa abre o mapa (economia de dados).
        globIgnores: ['**/MapView-*.js', '**/MapView-*.css'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ sameOrigin, url }) => sameOrigin && url.pathname.includes('/assets/'),
            handler: 'CacheFirst',
            options: { cacheName: 'alagou-codigo', expiration: { maxEntries: 60, maxAgeSeconds: 30 * DAY } },
          },
          {
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/styles\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'alagou-mapa-estilo', cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'alagou-mapa-blocos',
              expiration: { maxEntries: 600, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
