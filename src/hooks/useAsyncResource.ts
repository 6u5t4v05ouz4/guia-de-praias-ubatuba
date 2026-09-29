import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega um recurso assíncrono uma vez e expõe `{ data, loading, error, reload }`.
 *
 * Usado por todos os repositórios do `services/repository.ts`. Mantém a tela
 * responsiva mesmo quando o Supabase está configurado e a rede está lenta —
 * e, mais importante, nunca deixa a UI travada quando a chamada falha.
 */
export interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mounted = useRef(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload, setData };
}
