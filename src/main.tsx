import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/variables.css';
import './styles/global.css';

/**
 * Ponto de entrada.
 *
 * O Service Worker (Workbox via vite-plugin-pwa) é registrado aqui com
 * `registerType: 'autoUpdate'`: em campo, o usuário não deve precisar limpar
 * cache para receber a versão nova do catálogo.
 */
registerSW({
  immediate: true,
  onNeedRefresh() {
    // A próxima navegação já traz a versão nova; nada a fazer além de recarregar
    // quando a aba já está em primeiro plano.
    if (document.visibilityState === 'visible') {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.info('[PWA] Guia disponível offline — leverage na praia mesmo.');
  },
});

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
