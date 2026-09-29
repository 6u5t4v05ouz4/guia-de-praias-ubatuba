import type { ReactNode } from 'react';
import { useBackdropClose, useModal } from '@/hooks/useUI';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Casca de modal: foco preso, Esc fecha, scroll do fundo bloqueado. */
export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  useModal(open, onClose);
  const onBackdrop = useBackdropClose(open, onClose);
  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onBackdrop}>
      <div className="modal__panel">
        <header className="modal__head">
          <div className="stack">
            <h2 className="modal__title">{title}</h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-btn modal__close"
            onClick={onClose}
            aria-label="Fechar"
            autoFocus
          >
            ×
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}
