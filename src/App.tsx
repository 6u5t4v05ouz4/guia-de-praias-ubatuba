import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';import { AppProviders, useApp } from '@/context/AppContext';
import { BottomBar } from '@/components/Navigation/BottomBar';
import { LocalModeNotice, OfflineBanner } from '@/components/Feedback/StatusBar';
import { Toasts } from '@/components/Feedback/Toasts';
import { BeachesPage } from '@/pages/BeachesPage';
import { BeachDetailPage } from '@/pages/BeachDetailPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { UtilitiesPage } from '@/pages/UtilitiesPage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** Volta ao topo a cada navegação (comportamento esperado de app mobile). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

/**
 * O /admin não usa a BottomBar: é uma ferramenta de gestão, não parte da
 * navegação do tourist. Ele também não mostra o aviso de "modo local" para não
 * competir com a tela de login.
 */
function Shell() {
  const { total, toasts, dismissToast } = useApp();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <ScrollToTop />
      <OfflineBanner />
      {!isAdmin && <LocalModeNotice />}

      <main className="app-main" id="conteudo">
        <Routes>
          <Route path="/" element={<NavigateHome />} />
          <Route path="/praias" element={<BeachesPage />} />
          <Route path="/praia/:id" element={<BeachDetailPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/salvos" element={<FavoritesPage />} />
          <Route path="/guia" element={<UtilitiesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdmin && <BottomBar savedCount={total} />}
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function NavigateHome() {
  // A home do PWA é a lista de praias: é o que o turista quer ver primeiro.
  return <BeachesPage />;
}

/**
 * Raiz da aplicação: provedores + roteador.
 * As rotas usam deep links (`/praia/praia-do-itamambuca`) para o SEO local
 * descrito em docs/BUSINESS_MODEL.md §3.
 */
export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProviders>
  );
}
