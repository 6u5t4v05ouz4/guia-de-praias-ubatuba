import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Feedback passageiro para ações do usuário (toast).
 * Usado no envio de fotos, na moderação e nos atalhos de mapa.
 */
export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: Toast['tone'] = 'info', duration = 3200) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);
      const timer = window.setTimeout(() => dismiss(id), duration);
      timers.current.push(timer);
      return id;
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  return { toasts, push, dismiss };
}
