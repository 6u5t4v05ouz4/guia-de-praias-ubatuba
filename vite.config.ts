import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'Guia de Praias & Serviços Ubatuba',
        short_name: 'Praias Ubatuba',
        description:
          'O guia oficial das praias, serviços e informações úteis de Ubatuba, Capital do Surfe. Funciona offline.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fdf6ec',
        theme_color: '#0b3c5d',
        categories: ['travel', 'navigation', 'lifestyle'],
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Meus Salvos', short_name: 'Salvos', url: '/salvos' },
          { name: 'Guia da Cidade', short_name: 'Guia', url: '/guia' },
        ],
      },
      workbox: {
        // App Shell: o HTML/JS/CSS é servido do cache primeiro para abrir instantâneo na praia.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Limite generoso: catálogo + fotos de praias visitadas.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            // Fotos: exibe do cache imediatamente e revalida em segundo plano.
            urlPattern: ({ url, request }) =>
              request.destination === 'image' ||
              /\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'guia-imagens',
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Conteúdo do Supabase (fotos de comunidade, banners, status CETESB).
            urlPattern: ({ url }) => url.hostname.includes('supabase'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'guia-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
