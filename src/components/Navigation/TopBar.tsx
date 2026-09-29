import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import './TopBar.css';

interface TopBarProps {
  title: string;
  subtitle?: string;
  /** Mostra botão de voltar em vez do logo. */
  backTo?: string;
  backLabel?: string;
  children?: ReactNode;
  transparent?: boolean;
}

/**
 * Cabeçalho superior. Nas páginas de detalhe (`backTo`) vira barra de retorno,
 * para o polegar não precisar alcançar o topo da tela.
 */
export function TopBar({ title, subtitle, backTo, backLabel, children, transparent }: TopBarProps) {
  if (backTo) {
    return (
      <header className="top-bar top-bar--back">
        <Link to={backTo} className="icon-btn top-bar__back" aria-label={backLabel ?? 'Voltar'}>
          ‹
        </Link>
        <h1 className="top-bar__title truncate">{title}</h1>
        <div className="top-bar__actions">{children}</div>
      </header>
    );
  }

  return (
    <header className={`top-bar ${transparent ? 'top-bar--transparent' : ''}`}>
      <div className="top-bar__brand">
        <span className="top-bar__mark" aria-hidden="true">
          🌊
        </span>
        <div className="stack">
          <h1 className="top-bar__title">{title}</h1>
          {subtitle && <span className="top-bar__subtitle">{subtitle}</span>}
        </div>
      </div>
      <div className="top-bar__actions">{children}</div>
    </header>
  );
}
