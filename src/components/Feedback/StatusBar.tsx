import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { dataSource } from '@/services/repository';
import './StatusBar.css';

/**
 * Aviso de conectividade exigido pelo SPEC §3.3:
 * "Você está offline. Todas as informações salvas estão disponíveis."
 *
 * Some sozinho quando a conexão volta.
 */
export function OfflineBanner() {
  const offline = useOfflineStatus();
  if (!offline) return null;

  return (
    <div className="status-bar status-bar--offline" role="status">
      <span aria-hidden="true">📴</span>
      <span>
        Você está offline. O catálogo, os salvos e o guia da cidade continuam disponíveis.
      </span>
    </div>
  );
}

/** Aviso persistente de que os dados vêm do fallback local (sem Supabase). */
export function LocalModeNotice() {
  if (dataSource !== 'local') return null;
  return (
    <div className="status-bar status-bar--local" role="note">
      <span aria-hidden="true">🧪</span>
      <span>
        Modo local: usando o catálogo embutido e o <code>localStorage</code>. Configure
        <code> VITE_SUPABASE_URL</code> para sincronizar com o banco.
      </span>
    </div>
  );
}
