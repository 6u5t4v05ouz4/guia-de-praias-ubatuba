import { useEffect, useState } from 'react';

/**
 * Detecta conectividade (SPEC §3.3).
 *
 * `navigator.onLine` sozinho é pouco confiável em 4G rural: o celular pode estar
 * "online" e não conseguir resolver DNS. Por isso a app também marca offline
 * após uma chamada de rede falha em `useAsyncResource` — mas o indicador primário
 * segue sendo o evento `online`/`offline` do navegador, que é instantâneo.
 */
export function useOfflineStatus(): boolean {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return offline;
}
