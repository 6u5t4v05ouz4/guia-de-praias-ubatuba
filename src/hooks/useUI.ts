import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Trava o scroll do fundo enquanto um modal está aberto e fecha com Esc.
 * Extraído para não repetir a mesma lógica em cada modal de `components/Modals`.
 */
export function useModal(open: boolean, onClose?: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);
}

/** Fecha ao clicar fora do conteúdo do painel. */
export function useBackdropClose(open: boolean, onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;

  return useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) ref.current();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );
}

/** Detecta se o viewport é largo o bastante para o layout de duas colunas. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
