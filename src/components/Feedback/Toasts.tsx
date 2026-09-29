import type { Toast } from '@/hooks/useToasts';
import './Toasts.css';

interface ToastsProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

/** Fila de avisos temporários no topo da tela. */
export function Toasts({ toasts, onDismiss }: ToastsProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <span aria-hidden="true">
            {t.tone === 'success' ? '✅' : t.tone === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="grow">{t.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
