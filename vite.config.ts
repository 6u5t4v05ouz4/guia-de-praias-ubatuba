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
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
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
        /**
         * ⚠️ Por que o shell é precacheado como `/` e não como `index.html`:
         * o Cloudflare Pages responde **308** para qualquer caminho `.html`
         * (`/index.html` → `/`, `/offline.html` → `/offline`). O Workbox aborta
         * a instalação do Service Worker quando uma entrada do precache
         * responde redirecionado (`bad-precaching-response`), então pedir
         * `index.html` deixaria o app **sem offline** no Pages — algo que não
         * aparece no `vite preview`, porque lá o arquivo é servido direto.
         *
         * Solução: excluir `.html` do glob e adicionar a raiz (`/`) como entrada
         * manual, que o Pages devolve com 200. `revision: null` porque o `sw.js`
         * é regenerado a cada deploy — não há o que revalidar dentro do mesmo
         * ciclo de vida.
         */
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/api\//],
        additionalManifestEntries: [{ url: '/', revision: null }],
        globPatterns: ['**/*.{js,css,svg,png,ico,webp,woff2}'],
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
