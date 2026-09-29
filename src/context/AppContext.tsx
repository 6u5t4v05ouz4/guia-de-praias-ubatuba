import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useFavorites, type FavoritesApi } from '@/hooks/useFavorites';
import { useToasts, type Toast } from '@/hooks/useToasts';

/**
 * Estado compartilhado do app: favoritos e avisos.
 * Montado uma vez em <AppProviders> (ver App.tsx) e consumido via `useApp()`.
 */
export interface AppContextValue extends FavoritesApi {
  toasts: Toast[];
  notify: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const favorites = useFavorites();
  const { toasts, push, dismiss } = useToasts();

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      push(message, tone);
    },
    [push]
  );

  const value = useMemo<AppContextValue>(
    () => ({ ...favorites, toasts, notify, dismissToast: dismiss }),
    [favorites, toasts, notify, dismiss]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProviders>.');
  return ctx;
}
